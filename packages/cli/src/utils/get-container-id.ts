import execa from 'execa';

export const getContainerIds = async (filters: string[] = []): Promise<string[]> => {
    const result = await execa(
        'docker',
        [
            'ps',
            '-q',
            ...filters.map(filter => `--filter "${filter}"`)
        ],
        { shell: true }
    );

    return result.stdout.split('\n');
};
