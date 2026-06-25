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
const express_1 = require("express");
const controller = __importStar(require("../controllers/taskmanagerController"));
const router = (0, express_1.Router)();
router.post(["/login", "/login.php"], controller.login);
router.post(["/admin_create_user", "/admin_create_user.php"], controller.adminCreateUser);
router.get(["/get_users", "/get_users.php"], controller.getUsers);
router.post(["/create_empresa", "/create_empresa.php"], controller.createEmpresa);
router.get(["/get_empresas", "/get_empresas.php"], controller.getEmpresas);
router.post(["/create_departamento", "/create_departamento.php"], controller.createDepartamento);
router.get(["/get_departamentos", "/get_departamentos.php"], controller.getDepartamentos);
router.get(["/get_team", "/get_team.php"], controller.getTeam);
router.post(["/create_task", "/create_task.php"], controller.createTask);
router.post(["/add_task", "/add_task.php"], controller.addLegacyTask);
router.get(["/get_my_tasks", "/get_my_tasks.php"], controller.getMyTasks);
router.get(["/get_manager_tasks", "/get_manager_tasks.php"], controller.getManagerTasks);
router.post(["/toggle_importante", "/toggle_importante.php"], controller.toggleImportante);
router.post(["/update_task_progress", "/update_task_progress.php"], controller.updateTaskProgress);
router.post(["/update_task", "/update_task.php"], controller.updateLegacyTask);
router.post(["/delete_task", "/delete_task.php"], controller.deleteLegacyTask);
router.get(["/get_comments", "/get_comments.php"], controller.getComments);
router.post(["/add_comment", "/add_comment.php"], controller.addComment);
router.get(["/get_notificacoes", "/get_notificacoes.php"], controller.getNotificacoes);
router.post(["/ler_notificacoes", "/ler_notificacoes.php"], controller.lerNotificacoes);
router.post(["/update_profile", "/update_profile.php"], controller.updateProfile);
router.post(["/update_password", "/update_password.php"], controller.updatePassword);
exports.default = router;
