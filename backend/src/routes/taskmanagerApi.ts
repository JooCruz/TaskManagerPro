import { Router } from "express";
import * as controller from "../controllers/taskmanagerController";

const router = Router();

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

export default router;
