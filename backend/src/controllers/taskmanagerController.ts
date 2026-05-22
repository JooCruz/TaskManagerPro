import { Request, Response } from "express";
import { erro, ok } from "../utils/http";
import * as service from "../services/taskmanagerService";

type ServiceCall = (request: Request) => Promise<Record<string, unknown>>;

const handle =
  (callback: ServiceCall) =>
  async (request: Request, response: Response) => {
    try {
      ok(response, await callback(request));
    } catch (error) {
      if (error instanceof service.ServiceError) {
        return erro(response, error.message, error.statusCode);
      }

      console.error(error);
      return erro(response, "Erro interno do servidor", 500);
    }
  };

export const login = handle((request) => service.login(request.body));
export const adminCreateUser = handle((request) => service.adminCreateUser(request.body));
export const getUsers = handle(() => service.getUsers());
export const createEmpresa = handle((request) => service.createEmpresa(request.body));
export const getEmpresas = handle(() => service.getEmpresas());
export const createDepartamento = handle((request) => service.createDepartamento(request.body));
export const getDepartamentos = handle((request) => service.getDepartamentos(request.query));
export const getTeam = handle((request) => service.getTeam(request.query));
export const createTask = handle((request) => service.createTask(request.body));
export const addLegacyTask = handle((request) => service.addLegacyTask(request.body));
export const getMyTasks = handle((request) => service.getMyTasks(request.query));
export const getManagerTasks = handle((request) => service.getManagerTasks(request.query));
export const toggleImportante = handle((request) => service.toggleImportante(request.body));
export const updateTaskProgress = handle((request) => service.updateTaskProgress(request.body));
export const updateLegacyTask = handle((request) => service.updateLegacyTask(request.body));
export const deleteLegacyTask = handle((request) => service.deleteLegacyTask(request.body));
export const getComments = handle((request) => service.getComments(request.query));
export const addComment = handle((request) => service.addComment(request.body));
export const getNotificacoes = handle((request) => service.getNotificacoes(request.query));
export const lerNotificacoes = handle((request) => service.lerNotificacoes(request.body));
export const updateProfile = handle((request) => service.updateProfile(request.body));
export const updatePassword = handle((request) => service.updatePassword(request.body));

