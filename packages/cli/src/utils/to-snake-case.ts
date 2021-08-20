export const toSnakeCase = (value: string): string => {
    return value
        .replace(/(.)([A-Z][a-z]+)/g, '$1_$2')
        .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
        .replace(/ /g, '_')
        .toLowerCase();
};
