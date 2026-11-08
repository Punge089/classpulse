import type { Request, RequestHandler, Response } from "express";

/** Express 4 does not catch rejected promises, so forward them to the shared error handler. */
export function asyncRoute(handler: (req: Request, res: Response) => Promise<void>): RequestHandler {
  return (req, res, next) => {
    handler(req, res).catch(next);
  };
}
