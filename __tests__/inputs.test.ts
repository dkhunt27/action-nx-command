import { parseArgs } from '../src/inputs.ts'

describe('parseArgs', () => {
  test('should parse as expected', () => {
    const actual = parseArgs('--coverage --coverageReporters=json,json-summary')
    expect(actual).toEqual([
      '--coverage',
      '--coverageReporters=json,json-summary'
    ])
  })
})
