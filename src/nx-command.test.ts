import { retrieveGitBoundaries } from './nx-command.ts'
import * as utils from './utils.ts'

describe('nx-command tests', () => {
  describe('retrieveGitBoundaries', () => {
    test('when pull request, should use the pr shas', async () => {
      await expect(
        retrieveGitBoundaries({
          inputs: {} as never,
          githubContextEventName: 'pull_request',
          githubContextPayload: {
            pull_request: {
              base: { sha: 'base-sha' },
              head: { sha: 'head-sha' }
            } as never
          },
          gitRevParse: utils.gitRevParse
        })
      ).resolves.toEqual({ base: 'base-sha', head: 'head-sha' })
    })
    test('when push event, should use the push event', async () => {
      await expect(
        retrieveGitBoundaries({
          inputs: {} as never,
          githubContextEventName: 'push',
          githubContextPayload: {
            before: 'before-sha',
            after: 'after-sha'
          },
          gitRevParse: utils.gitRevParse
        })
      ).resolves.toEqual({ base: 'before-sha', head: 'after-sha' })
    })
    test('when push event and overrides, should use overrides', async () => {
      await expect(
        retrieveGitBoundaries({
          inputs: {
            baseBoundaryOverride: 'override-base-sha',
            headBoundaryOverride: 'override-head-sha'
          } as never,
          githubContextEventName: 'push',
          githubContextPayload: {
            before: 'before-sha',
            after: 'after-sha'
          },
          gitRevParse: utils.gitRevParse
        })
      ).resolves.toEqual({
        base: 'override-base-sha',
        head: 'override-head-sha'
      })
    })
    test('when not pull request or push event, should use git reverse parse', async () => {
      await expect(
        retrieveGitBoundaries({
          inputs: {} as never,
          githubContextEventName: 'other',
          githubContextPayload: {
            before: 'before-sha',
            after: 'after-sha'
          },
          gitRevParse: (ref: string) => {
            if (ref === 'HEAD~1') return Promise.resolve('base-sha')
            if (ref === 'HEAD') return Promise.resolve('head-sha')
            return Promise.reject('unknown ref')
          }
        })
      ).resolves.toEqual({ base: 'base-sha', head: 'head-sha' })
    })
  })
})
