import * as github from '@actions/github';
import type { Inputs } from './inputs.ts';
export declare const gitRevParse: (ref: string) => Promise<string>;
export declare const retrieveGitBoundaries: (params: {
    inputs: Inputs;
    githubContextEventName: string;
    githubContextPayload: typeof github.context.payload;
}) => Promise<{
    base: string;
    head: string;
}>;
export declare const runNx: (inputs: Inputs) => Promise<void>;
