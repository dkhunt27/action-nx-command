export type Inputs = {
    readonly affected: boolean;
    readonly all: boolean;
    readonly argsAddtl: readonly string[];
    readonly argsNx: readonly string[];
    readonly baseBoundaryOverride: string;
    readonly headBoundaryOverride: string;
    readonly parallel: number;
    readonly projects: readonly string[];
    readonly setNxBranchToPrNumber: boolean;
    readonly targets: readonly string[];
    readonly workingDirectory: string;
};
export declare function parseArgs(raw: string): string[];
export declare function parseInputs(): Inputs;
