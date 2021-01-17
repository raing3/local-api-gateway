import { NextFunction, Request, RequestHandler, Response } from 'express';
import { CorsMiddlewareConfig } from '@local-api-gateway/types';

export const cors = (config: CorsMiddlewareConfig): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const headerNames = [
            'access-control-allow-origin',
            'access-control-allow-methods',
            'access-control-allow-headers',
            'access-control-allow-credentials'
        ];

        headerNames.forEach(headerName => {
            if (!(headerName in config)) {
                return;
            }

            switch (headerName) {
                case 'access-control-allow-origin':
                    if (config[headerName]!.length === 1) {
                        res.set('Access-Control-Allow-Origin', config['access-control-allow-origin']);
                    } else if (config[headerName]!.includes(req.headers.origin!)) {
                        res.setHeader('Access-Control-Allow-Origin', req.headers.origin!);
                    }
                    break;
                default:
                    res.setHeader(headerName, (config as any)[headerName]);
                    break;
            }
        });

        next();
    };
};
