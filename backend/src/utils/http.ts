import { NextFunction, Request, Response } from "express";

export type AsyncRoute = (
  request: Request,
  response: Response,
  next: NextFunction
) => Promise<unknown>;

export const asyncRoute =
  (handler: AsyncRoute) =>
  (request: Request, response: Response, next: NextFunction) =>
    handler(request, response, next).catch(next);

export const ok = (response: Response, body: Record<string, unknown> = {}) =>
  response.json({ status: "sucesso", ...body });

export const erro = (response: Response, mensagem: string, statusCode = 400) =>
  response.status(statusCode).json({ status: "erro", mensagem });

