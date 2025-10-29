# Action Nx Command

This is git action that executes NX commands

## Inspiration

Started with the great work from
[https://github.com/MansaGroup/nrwl-nx-action](https://github.com/MansaGroup/nrwl-nx-action)
and updated to support base/head commits, removed deprecated support for
NX_RUN_GROUP, and added support for additional arguments

## Usage

By default, the action will try to run the provided tasks only on the affected
projects. This behavior can be modified using the different inputs (see below).

> workflow.yml

```yaml
---
- name: Checkout
  uses: actions/checkout@v5
  with:
    fetch-depth: 0

- uses: dkhunt27/nx-command@v1
  with:
    targets: lint,build,deploy
```

This step will run three targets: `lint`, `build` and `deploy`, sequentially
only on the affected projects

> Note: By default, the checkout action will only clone the latest commit of the
> branch, which will cause issues as Nx needs to compute the difference between
> the `base` and `head`. Using the `fetch-depth: 0` parameter will clone the
> entire repository, which is not optimal but functional.

## Inputs

This GitHub action can take several inputs to configure its behaviors:

| Name                  | Type                 | Default | Example            | Description                                                                        |
| --------------------- | -------------------- | ------- | ------------------ | ---------------------------------------------------------------------------------- |
| affected              | Boolean              | `true`  | `true`             | Run the targets on the affected projects since the last modifications (more below) |
| all                   | Boolean              | `false` | `true`             | Run the targets on all the projects of the Nx workspace                            |
| args                  | String               |         | `--key="value"`    | Optional args to append to the Nx commands                                         |
| baseBoundaryOverride  | String               |         |                    | Parameter to use for overriding nx base commit                                     |
| headBoundaryOverride  | String               |         |                    | Parameter to use for overriding nx head commit                                     |
| projects              | Comma-separated list |         | `frontend,backend` | List of projects to use (more below)                                               |
| setNxBranchToPrNumber | Boolean              | `false` | `true`             | Set the NX_BRANCH environment variable to the pull request number                  |
| targets               | Comma-separated list |         | `lint,test,build`  | List of targets to execute                                                         |
| workingDirectory      | String               |         | `myNxFolder`       | Path to the Nx workspace, needed if not the repository root                        |

### `all` and `affected`

`all` and `affected` are mutually exclusive.

### `projects`

When defined, will skip the `all` and `affected` inputs.

### `affected`

When set to `true`, the affected detection will depend on the event type of the
workflow:

- Inside a **pull request** context, the action will use the base and head Git
  references
- Otherwise, will compute the difference between the `HEAD` and the last commit;
  unless base/head overrides provided

## Examples

### Run one target on all the affected projects (default)

This will run the `build` target on all the affected projects. **This is the
default behavior.**

```yaml
---
- uses: dkhunt27/nx-command@v1
  with:
    targets: build
    affected: 'true' # Defaults to true, therefore optional
```

### Run multiple targets to all projects

This will run three targets: `lint`, `test` and `build` to all the projects of
the workspace.

```yaml
---
- uses: dkhunt27/nx-command@v1
  with:
    targets: lint,test,build
    all: 'true'
```

### Run one target on some projects

This will run the `build` target on the `frontend` and `backend` projects only.

```yaml
---
- uses: dkhunt27/nx-command@v1
  with:
    targets: build
    projects: frontend,backend
```

### Send extra arguments to the nx command

This will skip the nx cloud (assuming nx cloud enabled in nx.json) and enable
extra logging and run 3 tasks in parallel

> workflow.yml

```yaml
---
- uses: dkhunt27/nx-command@v1
  with:
    targets: build
    args: --skip-nx-cloud --verbose --parallel=3
```

## Test your action locally

The [`@github/local-action`](https://github.com/github/local-action) utility can
be used to test your action locally. It is a simple command-line tool that
"stubs" (or simulates) the GitHub Actions Toolkit. This way, you can run your
TypeScript action locally without having to commit and push your changes to a
repository.

The `local-action` utility can be run in the following ways:

- Visual Studio Code Debugger

  Make sure to review and, if needed, update
  [`.vscode/launch.json`](./.vscode/launch.json)

- Terminal/Command Prompt

  ```bash
  # npx @github/local action <action-yaml-path> <entrypoint> <dotenv-file>
  npx @github/local-action . src/main.ts .env
  ```

You can provide a `.env` file to the `local-action` CLI to set environment
variables used by the GitHub Actions Toolkit. For example, setting inputs and
event payload data used by your action. For more information, see the example
file, [`.env.example`](./.env.example), and the
[GitHub Actions Documentation](https://docs.github.com/en/actions/learn-github-actions/variables#default-environment-variables).

## Publishing a New Release

This project includes a helper script, [`script/release`](./script/release)
designed to streamline the process of tagging and pushing new releases for
GitHub Actions.

GitHub Actions allows users to select a specific version of the action to use,
based on release tags. This script simplifies this process by performing the
following steps:

1. **Retrieving the latest release tag:** The script starts by fetching the most
   recent SemVer release tag of the current branch, by looking at the local data
   available in your repository.
1. **Prompting for a new release tag:** The user is then prompted to enter a new
   release tag. To assist with this, the script displays the tag retrieved in
   the previous step, and validates the format of the inputted tag (vX.X.X). The
   user is also reminded to update the version field in package.json.
1. **Tagging the new release:** The script then tags a new release and syncs the
   separate major tag (e.g. v1, v2) with the new release tag (e.g. v1.0.0,
   v2.1.2). When the user is creating a new major release, the script
   auto-detects this and creates a `releases/v#` branch for the previous major
   version.
1. **Pushing changes to remote:** Finally, the script pushes the necessary
   commits, tags and branches to the remote repository. From here, you will need
   to create a new release in GitHub so users can easily reference the new tags
   in their workflows.
