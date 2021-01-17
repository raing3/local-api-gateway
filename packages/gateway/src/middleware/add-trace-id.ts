import { NextFunction, Request, RequestHandler, Response } from 'express';
import { randexp } from 'randexp';

export const addTraceId = (traceIdHeaderName: string): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const id = randexp(/1-[0-9]{8}-[0-9a-f]{24}/);

        if (req.headers[traceIdHeaderName]) {
            req.headers[traceIdHeaderName] = `Self=${id};${req.headers[traceIdHeaderName]}`;
        } else {
            req.headers[traceIdHeaderName] = `Root=${id}`;
        }

        next();
    };
};
