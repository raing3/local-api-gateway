import { NextFunction, Request, RequestHandler, Response } from 'express';
import { randexp } from 'randexp';
import { CorsMiddlewareConfig } from '@local-api-gateway/types';

export const cors = (config: CorsMiddlewareConfig): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const id = randexp(/1-[0-9]{8}-[0-9a-f]{24}/);

        if (config['access-control-allow-origin']) {
            res.set('Access-Control-Allow-Origin', config['access-control-allow-origin']);
        }

        next();
    };
};
