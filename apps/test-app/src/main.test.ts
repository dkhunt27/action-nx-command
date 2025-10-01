import { run } from './main.ts'

describe('run', () => {
  it('should run without error', () => {
    run()
    expect(true).toBe(true)
  })
})
