import { exec } from 'node:child_process'
import { promisify } from 'node:util'

const execPromise = promisify(exec)

export const execHandler = async (command: string): Promise<string> => {
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
