import * as core from '@actions/core'
import { parseInputs } from './inputs.ts'
import { runNx } from './nx-command.ts'

export const run = async (): Promise<void> => {
  const inputs = parseInputs()

  if (inputs.workingDirectory && inputs.workingDirectory.length > 0) {
    core.info(`Working in custom directory: ${inputs.workingDirectory}`)
    process.chdir(inputs.workingDirectory)
  }

  if (inputs.isWorkflowsCiPipeline) {
    // used for .github/workflows/ci.yml
    core.info(
      'Skipping running the nx command as skipNxCommand input is set to true'
    )
  } else {
    try {
      await runNx(inputs)
    } catch (error) {
      core.setFailed(error as never)
    }
  }
}
