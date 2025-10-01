import { run } from './main'

describe('run', () => {
  it('should log "Hello World"', () => {
    const consoleLogSpy = jest.spyOn(console, 'log')
    run()
    expect(consoleLogSpy).toHaveBeenCalledWith('Hello World')
    consoleLogSpy.mockRestore()
  })
})
