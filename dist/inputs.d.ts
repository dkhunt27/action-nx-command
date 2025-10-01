export type Inputs = {
    readonly affected: boolean;
    readonly all: boolean;
    readonly args: readonly string[];
    readonly baseBoundaryOverride: string;
    readonly headBoundaryOverride: string;
    readonly isWorkflowsCiPipeline: boolean;
    readonly parallel: number;
    readonly projects: readonly string[];
    readonly setNxBranchToPrNumber: boolean;
    readonly targets: readonly string[];
    readonly workingDirectory: string;
};
export declare function parseArgs(raw: string): string[];
export declare function parseInputs(): Inputs;
