import { alphabetical, schema } from '@stoplight/spectral-functions';
import { fileExists } from './functions/file-exists';
import path from 'path';

export default {
    rules: {
        schema: {
            severity: 'error',
            type: 'validation',
            given: '$',
            then: {
                'function': schema,
                functionOptions: {
                    allErrors: true,
                    schema: {
                        $ref: path.resolve(__dirname, 'schema.yml')
                    }
                }
            }
        },
        'alphabetically-sorted-integrations': {
            message: 'Integrations should be sorted alphabetically, {{error}}.',
            severity: 'warn',
            type: 'style',
            given: '$.integrations',
            then: {
                'function': alphabetical
            }
        },
        'middleware-exists': {
            message: 'Configured middleware files should exist, {{error}}.',
            severity: 'error',
            type: 'validation',
            given: '$.middleware.*.path',
            then: {
                'function': fileExists
            }
        }
    }
};
