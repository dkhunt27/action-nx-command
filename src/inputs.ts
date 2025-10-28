import * as core from '@actions/core'
import type { NxCommandInputs } from 'action-nx-command-wrapper'

export const parseArgs = (raw: string): string[] => {
  return raw.split(' ').filter((arg) => arg.length > 0)
}

export const parseInputs = (): NxCommandInputs => {
  const affectedToIgnore = core
    .getInput('affectedToIgnore', { required: false })
    .split(',')
    .filter((target) => target.length > 0)

  const targets = core
    .getInput('targets', { required: true })
    .split(',')
    .filter((target) => target.length > 0)

  const projects = core
    .getInput('projects', { required: false })
    .split(',')
    .filter((project) => project.length > 0)

  const command = core.getInput('command', { required: true })

  const parallelNumber = Number(core.getInput('parallel'))
  const parallel = Number.isNaN(parallelNumber) ? 3 : parallelNumber

  const args = parseArgs(core.getInput('args'))

  const setNxBranchToPrNumber =
    core.getInput('setNxBranchToPrNumber') === 'true'

  const workingDirectory = core.getInput('workingDirectory')

  const baseBoundaryOverride = core.getInput('baseBoundaryOverride')

  const headBoundaryOverride = core.getInput('headBoundaryOverride')

  // this is an internal flag used to skip running the actual nx command for testing purposes
  const isWorkflowsCiPipeline =
    core.getInput('isWorkflowsCiPipeline') === 'true'

  return {
    affectedToIgnore,
    args,
    command,
    baseBoundaryOverride,
    headBoundaryOverride,
    isWorkflowsCiPipeline,
    parallel,
    projects,
    setNxBranchToPrNumber,
    targets,
    workingDirectory
  } as NxCommandInputs
}
