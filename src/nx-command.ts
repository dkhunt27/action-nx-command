import * as core from '@actions/core'
import * as github from '@actions/github'
import type { PullRequest, PushEvent } from '@octokit/webhooks-types'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'

import type { Inputs } from './inputs.ts'

const execPromise = promisify(exec)

const execHandler = async (command: string): Promise<string> => {
  const { stdout, stderr } = await execPromise(command)
  if (stderr) {
    throw stderr
  }
  return stdout
}

export const gitRevParse = async (ref: string): Promise<string> => {
  const result = await execHandler(`git rev-parse ${ref}`)
  return result.replace(/(\r\n|\n|\r)/gm, '')
}

export const retrieveGitBoundaries = async (params: {
  inputs: Inputs
  githubContextEventName: string
  githubContextPayload: typeof github.context.payload
}): Promise<{ base: string; head: string }> => {
  const { inputs, githubContextEventName, githubContextPayload } = params

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
  await execHandler(`npx nx ${args.join(' ')}`)
}

const runNxAll = async (inputs: Inputs, args: string[]): Promise<void> => {
  core.startGroup('Running NX All')

  const promises = []
  core.startGroup('Running nx targets...')
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
  core.startGroup('Running nx targets...')
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

  core.startGroup('Retrieving git boundaries...')
  const { base, head } = await retrieveGitBoundaries({
    inputs,
    githubContextEventName: github.context.eventName,
    githubContextPayload: github.context.payload
  })

  core.info(`Base boundary: ${base}`)
  core.info(`Head boundary: ${head}`)

  const promises = []
  core.startGroup('Running nx targets...')
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
