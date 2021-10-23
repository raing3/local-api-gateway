import { ISpectralDiagnostic } from '@stoplight/spectral-core';
import { pretty } from '@stoplight/spectral-cli/dist/formatters';

export const formatLintResults = (results: ISpectralDiagnostic[]): string => {
    return pretty(results, { failSeverity: 0 });
};
