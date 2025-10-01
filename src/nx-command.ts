import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as github from '@actions/github'
import type { PullRequest, PushEvent } from '@octokit/webhooks-types'

import type { Inputs } from './inputs.ts'
import * as utils from './utils.ts'

export const retrieveGitBoundaries = async (params: {
  inputs: Inputs
  githubContextEventName: string
  githubContextPayload: typeof github.context.payload
  gitRevParse: (ref: string) => Promise<string>
}): Promise<{ base: string; head: string }> => {
  const { inputs, githubContextEventName, githubContextPayload, gitRevParse } =
    params

  let base = ''
  let head = ''

  if (githubContextEventName === 'pull_request') {
    const prPayload = githubContextPayload.pull_request as PullRequest
    base = prPayload.base.sha
    head = prPayload.head.sha
  } else if (githubContextEventName === 'push') {
    const pushPayload = githubContextPayload as PushEvent
    base = inputs.baseBoundaryOverride || pushPayload.before
    head = inputs.headBoundaryOverride || pushPayload.after
  } else {
    if (inputs.baseBoundaryOverride) {
      base = inputs.baseBoundaryOverride
    } else {
      base = await gitRevParse('HEAD~1')
    }

    if (inputs.headBoundaryOverride) {
      head = inputs.headBoundaryOverride
    } else {
      head = await gitRevParse('HEAD')
    }
  }

  return { base, head }
}

const nx = async (args: readonly string[]): Promise<void> => {
  // using exec.exec instead of execHandler to stream output to console
  await exec.exec(`npx nx ${args.join(' ')}`)
}

const runNxAll = async (inputs: Inputs, args: string[]): Promise<void> => {
  core.startGroup('Running NX All')

  const promises = []
  core.info('Running nx targets...')
  for (const target of inputs.targets) {
    core.info(`Target: ${target}`)

    promises.push(nx(['run-many', `--target=${target}`, ...args]))
  }

  await Promise.all(promises)

  core.endGroup()
}

const runNxProjects = async (inputs: Inputs, args: string[]): Promise<void> => {
  core.startGroup('Running NX Projects')

  const promises = []
  core.info('Running nx targets...')
  for (const target of inputs.targets) {
    core.info(`Target: ${target}`)

    promises.push(
      nx([
        'run-many',
        `--target=${target}`,
        `--projects=${inputs.projects.join(',')}`,
        ...args
      ])
    )
  }

  await Promise.all(promises)

  core.endGroup()
}

const runNxAffected = async (inputs: Inputs, args: string[]): Promise<void> => {
  core.startGroup('Running NX Affected')

  core.info('Retrieving git boundaries...')
  const { base, head } = await retrieveGitBoundaries({
    inputs,
    githubContextEventName: github.context.eventName,
    githubContextPayload: github.context.payload,
    gitRevParse: utils.gitRevParse
  })

  core.info(`Base boundary: ${base}`)
  core.info(`Head boundary: ${head}`)

  const promises = []
  core.info('Running nx targets...')
  for (const target of inputs.targets) {
    core.info(`Target: ${target}`)

    promises.push(
      nx([
        'affected',
        `--target=${target}`,
        `--base=${base}`,
        `--head=${head}`,
        ...args
      ])
    )
  }

  await Promise.all(promises)

  core.endGroup()
}

export const runNx = async (inputs: Inputs): Promise<void> => {
  const args = inputs.args as string[]

  core.info(`args: ${args.join()}`)

  if (inputs.setNxBranchToPrNumber) {
    if (github.context.eventName === 'pull_request') {
      const prPayload = github.context.payload.pull_request as PullRequest
      process.env.NX_BRANCH = prPayload.number.toString()
    }
  }

  if (inputs.parallel) {
    args.push(`--parallel=${inputs.parallel.toString()}`)
  }

  if (inputs.all === true || inputs.affected === false) {
    return runNxAll(inputs, args)
  } else if (inputs.projects.length > 0) {
    return runNxProjects(inputs, args)
  } else {
    return runNxAffected(inputs, args)
  }
}
