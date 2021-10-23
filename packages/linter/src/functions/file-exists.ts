import fs from 'fs';
import { IFunctionResult } from '@stoplight/spectral-core';

export const fileExists = (targetValue: string): IFunctionResult[] => {
    if (!fs.existsSync(targetValue)) {
        return [{ message: `file "${targetValue}" does not exist` }];
    }

    return [];
};
