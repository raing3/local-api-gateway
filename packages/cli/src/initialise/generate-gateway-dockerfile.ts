import { Context } from '../types';
import { getVersion } from '../utils/get-version';

export const generateGatewayDockerfile = (context: Context): string => {
    return [
        'FROM node:16-alpine',
        'EXPOSE 80',
        'WORKDIR /app',
        // install the gateway if we haven't provided a path to it
        context.config.gateway.source ? '' : `RUN npm install -g @local-api-gateway/gateway@${getVersion()}`,
        'ENV PATH="/app/node_modules/.bin:${PATH}"', // eslint-disable-line no-template-curly-in-string
        context.config.gateway.source ? 'ENTRYPOINT ["npm", "run", "start"]' : 'ENTRYPOINT ["local-api-gateway"]'
    ].join('\n');
};
