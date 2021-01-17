import { NextFunction, Request, RequestHandler, Response } from 'express';
import { randexp } from 'randexp';
import { TraceIdMiddlewareConfig } from "@local-api-gateway/types";

export const traceId = (config: TraceIdMiddlewareConfig): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const id = randexp(/1-[0-9]{8}-[0-9a-f]{24}/);

        if (req.headers[config.header]) {
            req.headers[config.header] = `Self=${id};${req.headers[config.header]}`;
        } else {
            req.headers[config.header] = `Root=${id}`;
        }

        next();
    };
};
