"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePassword = exports.updateProfile = exports.lerNotificacoes = exports.getNotificacoes = exports.addComment = exports.getComments = exports.deleteLegacyTask = exports.updateLegacyTask = exports.updateTaskProgress = exports.toggleImportante = exports.getManagerTasks = exports.getMyTasks = exports.addLegacyTask = exports.createTask = exports.getTeam = exports.getDepartamentos = exports.createDepartamento = exports.getEmpresas = exports.createEmpresa = exports.getUsers = exports.adminCreateUser = exports.login = void 0;
const http_1 = require("../utils/http");
const service = __importStar(require("../services/taskmanagerService"));
const handle = (callback) => async (request, response) => {
    try {
        (0, http_1.ok)(response, await callback(request));
    }
    catch (error) {
        if (error instanceof service.ServiceError) {
            return (0, http_1.erro)(response, error.message, error.statusCode);
        }
        console.error(error);
        return (0, http_1.erro)(response, "Erro interno do servidor", 500);
    }
};
exports.login = handle((request) => service.login(request.body));
exports.adminCreateUser = handle((request) => service.adminCreateUser(request.body));
exports.getUsers = handle(() => service.getUsers());
exports.createEmpresa = handle((request) => service.createEmpresa(request.body));
exports.getEmpresas = handle(() => service.getEmpresas());
exports.createDepartamento = handle((request) => service.createDepartamento(request.body));
exports.getDepartamentos = handle((request) => service.getDepartamentos(request.query));
exports.getTeam = handle((request) => service.getTeam(request.query));
exports.createTask = handle((request) => service.createTask(request.body));
exports.addLegacyTask = handle((request) => service.addLegacyTask(request.body));
exports.getMyTasks = handle((request) => service.getMyTasks(request.query));
exports.getManagerTasks = handle((request) => service.getManagerTasks(request.query));
exports.toggleImportante = handle((request) => service.toggleImportante(request.body));
exports.updateTaskProgress = handle((request) => service.updateTaskProgress(request.body));
exports.updateLegacyTask = handle((request) => service.updateLegacyTask(request.body));
exports.deleteLegacyTask = handle((request) => service.deleteLegacyTask(request.body));
exports.getComments = handle((request) => service.getComments(request.query));
exports.addComment = handle((request) => service.addComment(request.body));
exports.getNotificacoes = handle((request) => service.getNotificacoes(request.query));
exports.lerNotificacoes = handle((request) => service.lerNotificacoes(request.body));
exports.updateProfile = handle((request) => service.updateProfile(request.body));
exports.updatePassword = handle((request) => service.updatePassword(request.body));
