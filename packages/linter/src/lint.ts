import { Document, Spectral } from '@stoplight/spectral-core';
import DefaultRuleset from './ruleset';
import esm from 'esm';
import fs from 'fs';
import { ISpectralDiagnostic } from '@stoplight/spectral-core/dist/types';
import { LintOptions } from './lint-options';
import { Yaml } from '@stoplight/spectral-parsers';

const esmRequire = esm(module, { cjs: { dedefault: true } });

export const lint = (options: LintOptions): Promise<ISpectralDiagnostic[]> => {
    const spectral = new Spectral();

    spectral.setRuleset(options.rulesetPath ? esmRequire(options.rulesetPath) : DefaultRuleset);

    const document = new Document(
        fs.readFileSync(options.configurationPath, 'utf8'),
        Yaml,
        options.configurationPath
    );

    return spectral.run(document);
};
