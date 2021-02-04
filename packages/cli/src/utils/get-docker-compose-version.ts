import execa from 'execa';

export const getDockerComposeVersion = async (): Promise<string|null> => {
    const result = await execa('docker-compose', ['-v']);
    const matches = result.stdout.match(/(\d+\.\d+\.\d+)/);

    return matches?.[0] || null;
};
