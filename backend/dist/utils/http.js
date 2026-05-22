"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.erro = exports.ok = exports.asyncRoute = void 0;
const asyncRoute = (handler) => (request, response, next) => handler(request, response, next).catch(next);
exports.asyncRoute = asyncRoute;
const ok = (response, body = {}) => response.json({ status: "sucesso", ...body });
exports.ok = ok;
const erro = (response, mensagem, statusCode = 400) => response.status(statusCode).json({ status: "erro", mensagem });
exports.erro = erro;
