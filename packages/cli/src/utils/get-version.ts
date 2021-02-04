import fs from 'fs';
import path from 'path';

export const getVersion = (): string => {
    const packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', '..', 'package.json'), 'utf8'));

    return String(packageJson.version);
};
