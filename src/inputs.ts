import * as core from '@actions/core'

export type Inputs = {
  readonly affected: boolean
  readonly all: boolean
  readonly args: readonly string[]
  readonly baseBoundaryOverride: string
  readonly headBoundaryOverride: string
  readonly isWorkflowsCiPipeline: boolean
  readonly parallel: number
  readonly projects: readonly string[]
  readonly setNxBranchToPrNumber: boolean
  readonly targets: readonly string[]
  readonly workingDirectory: string
}

export const parseArgs = (raw: string): string[] => {
  return raw.split(' ').filter((arg) => arg.length > 0)
}

export const parseInputs = (): Inputs => {
  const targets = core
    .getInput('targets', { required: true })
    .split(',')
    .filter((target) => target.length > 0)

  const projects = core
    .getInput('projects', { required: false })
    .split(',')
    .filter((project) => project.length > 0)

  const all = core.getInput('all') === 'true'

  const affected = core.getInput('affected') === 'true'

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
    affected,
    all,
    args,
    baseBoundaryOverride,
    headBoundaryOverride,
    isWorkflowsCiPipeline,
    parallel,
    projects,
    setNxBranchToPrNumber,
    targets,
    workingDirectory
  }
}
