import * as core from '@actions/core'
import { parseInputs } from './inputs.ts'
import { runNx } from './nx-command.ts'

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  const inputs = parseInputs()

  if (inputs.workingDirectory && inputs.workingDirectory.length > 0) {
    core.info(`🏃 Working in custom directory: ${inputs.workingDirectory}`)
    process.chdir(inputs.workingDirectory)
  }

  if (inputs.isWorkflowsCiPipeline) {
    // used for .github/workflows/ci.yml
    core.info(
      'Skipping running the nx command as skipNxCommand input is set to true'
    )
    return
  }

  return runNx(inputs).catch((err: Error) => {
    core.setFailed(err)
  })
}
