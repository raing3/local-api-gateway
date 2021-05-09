import { LintOptions } from '../types';
import { Spectral, Document, Parsers } from '@stoplight/spectral';
import { formatOutput } from '@stoplight/spectral/dist/cli/services/output';
import fs from 'fs';
import path from 'path';
import { OutputFormat } from '@stoplight/spectral/dist/types/config';
import { IRuleResult } from '@stoplight/spectral/dist/types';

export const lint = async (options: LintOptions): Promise<IRuleResult[]> => {
    const spectral = new Spectral();

    await spectral.loadRuleset(
        options.rulesetPath ||
        path.resolve(__dirname, '../../resources/configuration-ruleset.yml')
    );

    const document = new Document(
        fs.readFileSync(options.configurationPath, 'utf8'),
        Parsers.Yaml,
        options.configurationPath
    );

    return spectral.run(document);
};

export const formatLintResults = (results: IRuleResult[]): string => {
    return formatOutput(results, OutputFormat.STYLISH, { failSeverity: 0 });
};
