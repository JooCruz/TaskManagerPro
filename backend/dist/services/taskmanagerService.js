"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.asNumber = exports.ServiceError = void 0;
exports.login = login;
exports.adminCreateUser = adminCreateUser;
exports.getUsers = getUsers;
exports.createEmpresa = createEmpresa;
exports.getEmpresas = getEmpresas;
exports.createDepartamento = createDepartamento;
exports.getDepartamentos = getDepartamentos;
exports.getTeam = getTeam;
exports.createTask = createTask;
exports.addLegacyTask = addLegacyTask;
exports.getMyTasks = getMyTasks;
exports.getManagerTasks = getManagerTasks;
exports.toggleImportante = toggleImportante;
exports.updateTaskProgress = updateTaskProgress;
exports.updateLegacyTask = updateLegacyTask;
exports.deleteLegacyTask = deleteLegacyTask;
exports.getComments = getComments;
exports.addComment = addComment;
exports.getNotificacoes = getNotificacoes;
exports.lerNotificacoes = lerNotificacoes;
exports.updateProfile = updateProfile;
exports.updatePassword = updatePassword;
const supabase_1 = __importDefault(require("../config/supabase"));
class ServiceError extends Error {
    constructor(message, statusCode = 400) {
        super(message);
        this.statusCode = statusCode;
    }
}
exports.ServiceError = ServiceError;
const dbError = (error) => new ServiceError(error?.message || "Erro na base de dados", 500);
const asNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};
exports.asNumber = asNumber;
async function usersById(ids) {
    const cleanIds = [...new Set(ids.filter((id) => Number.isFinite(Number(id))).map(Number))];
    if (cleanIds.length === 0) {
        return new Map();
    }
    const { data, error } = await supabase_1.default.from("users").select("*").in("id", cleanIds);
    if (error) {
        throw dbError(error);
    }
    return new Map((data || []).map((user) => [Number(user.id), user]));
}
async function namesById(table, ids) {
    const cleanIds = [...new Set(ids.filter((id) => Number.isFinite(Number(id))).map(Number))];
    if (cleanIds.length === 0) {
        return new Map();
    }
    const { data, error } = await supabase_1.default.from(table).select("id,nome").in("id", cleanIds);
    if (error) {
        throw dbError(error);
    }
    return new Map((data || []).map((row) => [Number(row.id), row.nome]));
}
async function login(payload) {
    const { email, password } = payload || {};
    if (!email || !password) {
        throw new ServiceError("Dados incompletos");
    }
    const { data, error } = await supabase_1.default
        .from("users")
        .select("id,nome,email,role,departamento_id,empresa_id")
        .eq("email", String(email))
        .eq("senha", String(password))
        .maybeSingle();
    if (error) {
        throw dbError(error);
    }
    if (!data) {
        throw new ServiceError("Email ou password incorretos");
    }
    return { user: data };
}
async function adminCreateUser(payload) {
    const { nome, email, senha, role = "user", empresa_id = 1, departamento_id } = payload || {};
    if (!nome || !email || !senha) {
        throw new ServiceError("Dados incompletos recebidos pelo servidor.");
    }
    const { data: existing, error: existingError } = await supabase_1.default
        .from("users")
        .select("id")
        .eq("email", String(email))
        .maybeSingle();
    if (existingError) {
        throw dbError(existingError);
    }
    if (existing) {
        throw new ServiceError("Este email ja esta a ser utilizado por outro utilizador.");
    }
    const { error } = await supabase_1.default.from("users").insert({
        empresa_id: (0, exports.asNumber)(empresa_id, 1),
        departamento_id: departamento_id === "" || departamento_id === undefined ? null : (0, exports.asNumber)(departamento_id),
        nome: String(nome),
        email: String(email),
        senha: String(senha),
        role: String(role),
    });
    if (error) {
        throw dbError(error);
    }
    return { mensagem: "Utilizador registado com sucesso!" };
}
async function getUsers() {
    const { data, error } = await supabase_1.default
        .from("users")
        .select("id,nome,email,role,empresa_id,departamento_id")
        .order("id", { ascending: false });
    if (error) {
        throw dbError(error);
    }
    const empresaNames = await namesById("empresas", (data || []).map((user) => user.empresa_id));
    const departamentoNames = await namesById("departamentos", (data || []).map((user) => user.departamento_id));
    const users = (data || []).map((user) => ({
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role,
        empresa_nome: empresaNames.get(Number(user.empresa_id)) || null,
        departamento_nome: departamentoNames.get(Number(user.departamento_id)) || null,
    }));
    return { users };
}
async function createEmpresa(payload) {
    const { nome } = payload || {};
    if (!nome) {
        throw new ServiceError("Nome da empresa em falta.");
    }
    const { error } = await supabase_1.default.from("empresas").insert({ nome: String(nome) });
    if (error) {
        throw dbError(error);
    }
    return { mensagem: "Nova empresa registada com sucesso!" };
}
async function getEmpresas() {
    const { data, error } = await supabase_1.default.from("empresas").select("id,nome").order("id", { ascending: true });
    if (error) {
        throw dbError(error);
    }
    return { empresas: data || [] };
}
async function createDepartamento(payload) {
    const { nome, empresa_id } = payload || {};
    if (!nome || !empresa_id) {
        throw new ServiceError("Dados incompletos.");
    }
    const { error } = await supabase_1.default
        .from("departamentos")
        .insert({ empresa_id: (0, exports.asNumber)(empresa_id), nome: String(nome) });
    if (error) {
        throw dbError(error);
    }
    return { mensagem: "Departamento criado com sucesso!" };
}
async function getDepartamentos(query) {
    const empresaId = query.empresa_id;
    if (!empresaId) {
        throw new ServiceError("ID da empresa em falta.");
    }
    const { data, error } = await supabase_1.default
        .from("departamentos")
        .select("id,nome")
        .eq("empresa_id", (0, exports.asNumber)(empresaId))
        .order("id", { ascending: true });
    if (error) {
        throw dbError(error);
    }
    return { departamentos: data || [] };
}
async function getTeam(query) {
    const departamentoId = query.departamento_id;
    if (!departamentoId) {
        throw new ServiceError("ID do departamento em falta.");
    }
    const { data, error } = await supabase_1.default
        .from("users")
        .select("id,nome,email,role")
        .eq("departamento_id", (0, exports.asNumber)(departamentoId))
        .order("id", { ascending: true });
    if (error) {
        throw dbError(error);
    }
    return { team: data || [] };
}
async function createTask(payload) {
    const { titulo, descricao = "", data_entrega = null, hora_entrega = null } = payload || {};
    const { empresa_id = 1, criador_id = 1, atribuida_a, departamento_id } = payload || {};
    if (!titulo || !atribuida_a) {
        throw new ServiceError("Dados incompletos enviados pelo React.");
    }
    const { error } = await supabase_1.default.from("tarefas").insert({
        empresa_id: (0, exports.asNumber)(empresa_id, 1),
        departamento_id: departamento_id ? (0, exports.asNumber)(departamento_id) : null,
        criador_id: (0, exports.asNumber)(criador_id, 1),
        atribuida_a: (0, exports.asNumber)(atribuida_a),
        titulo: String(titulo),
        descricao: String(descricao),
        data_entrega: data_entrega || null,
        hora_entrega: hora_entrega || null,
        progresso: 0,
        status: "Pendente",
    });
    if (error) {
        throw dbError(error);
    }
    return {};
}
async function addLegacyTask(payload) {
    const { titulo, status } = payload || {};
    if (!titulo || !status) {
        throw new ServiceError("Dados incompletos.");
    }
    // Possivel codigo morto: a app atual nao chama add_task.php e o dump antigo nem inclui a tabela tasks.
    const { error } = await supabase_1.default.from("tasks").insert({ titulo: String(titulo), status: String(status) });
    if (error) {
        throw dbError(error);
    }
    return { mensagem: "Tarefa adicionada!" };
}
async function getMyTasks(query) {
    const userId = query.user_id;
    if (!userId) {
        throw new ServiceError("Falta o ID do user");
    }
    const { data, error } = await supabase_1.default
        .from("tarefas")
        .select("*")
        .eq("atribuida_a", (0, exports.asNumber)(userId))
        .order("data_criacao", { ascending: false });
    if (error) {
        throw dbError(error);
    }
    const creators = await usersById((data || []).map((task) => task.criador_id));
    const tarefas = (data || []).map((task) => ({
        ...task,
        criador_nome: creators.get(Number(task.criador_id))?.nome || null,
    }));
    return { tarefas };
}
async function getManagerTasks(query) {
    const departamentoId = query.departamento_id;
    if (!departamentoId) {
        throw new ServiceError("ID do departamento em falta.");
    }
    const { data, error } = await supabase_1.default
        .from("tarefas")
        .select("*")
        .eq("departamento_id", (0, exports.asNumber)(departamentoId))
        .order("data_criacao", { ascending: false });
    if (error) {
        throw dbError(error);
    }
    const assignedUsers = await usersById((data || []).map((task) => task.atribuida_a));
    const tarefas = (data || []).map((task) => ({
        ...task,
        funcionario_nome: assignedUsers.get(Number(task.atribuida_a))?.nome || null,
    }));
    return { tarefas };
}
async function toggleImportante(payload) {
    const { tarefa_id } = payload || {};
    if (!tarefa_id) {
        throw new ServiceError("ID da tarefa nao enviado.");
    }
    const { data: tarefa, error: readError } = await supabase_1.default
        .from("tarefas")
        .select("importante")
        .eq("id", (0, exports.asNumber)(tarefa_id))
        .maybeSingle();
    if (readError) {
        throw dbError(readError);
    }
    if (!tarefa) {
        throw new ServiceError("Tarefa nao encontrada.", 404);
    }
    const { error } = await supabase_1.default
        .from("tarefas")
        .update({ importante: !Boolean(tarefa.importante) })
        .eq("id", (0, exports.asNumber)(tarefa_id));
    if (error) {
        throw dbError(error);
    }
    return {};
}
async function updateTaskProgress(payload) {
    const { tarefa_id, progresso } = payload || {};
    if (!tarefa_id || progresso === undefined) {
        throw new ServiceError("Dados incompletos");
    }
    const novoStatus = (0, exports.asNumber)(progresso) === 100 ? "Concluída" : "Em Andamento";
    const { error } = await supabase_1.default
        .from("tarefas")
        .update({ progresso: (0, exports.asNumber)(progresso), status: novoStatus })
        .eq("id", (0, exports.asNumber)(tarefa_id));
    if (error) {
        throw dbError(error);
    }
    return { novo_status: novoStatus };
}
async function updateLegacyTask(payload) {
    const { id, status } = payload || {};
    if (!id || !status) {
        throw new ServiceError("Dados incompletos.");
    }
    // Possivel codigo morto: mantido para compatibilidade com o endpoint PHP antigo.
    const { error } = await supabase_1.default.from("tasks").update({ status: String(status) }).eq("id", (0, exports.asNumber)(id));
    if (error) {
        throw dbError(error);
    }
    return {};
}
async function deleteLegacyTask(payload) {
    const { id } = payload || {};
    if (!id) {
        throw new ServiceError("ID da tarefa em falta.");
    }
    // Possivel codigo morto: mantido para compatibilidade com o endpoint PHP antigo.
    const { error } = await supabase_1.default.from("tasks").delete().eq("id", (0, exports.asNumber)(id));
    if (error) {
        throw dbError(error);
    }
    return {};
}
async function getComments(query) {
    const tarefaId = query.tarefa_id;
    if (!tarefaId) {
        throw new ServiceError("Falta o ID da tarefa");
    }
    const { data, error } = await supabase_1.default
        .from("comentarios")
        .select("*")
        .eq("tarefa_id", (0, exports.asNumber)(tarefaId))
        .order("data_criacao", { ascending: true });
    if (error) {
        throw dbError(error);
    }
    const users = await usersById((data || []).map((comment) => comment.user_id));
    const comentarios = (data || []).map((comment) => {
        const nome = users.get(Number(comment.user_id))?.nome || null;
        return { ...comment, nome, nome_user: nome };
    });
    return { comentarios };
}
async function addComment(payload) {
    const { tarefa_id, user_id, comentario } = payload || {};
    if (!tarefa_id || !user_id || !comentario) {
        throw new ServiceError("Dados incompletos");
    }
    const { error } = await supabase_1.default.from("comentarios").insert({
        tarefa_id: (0, exports.asNumber)(tarefa_id),
        user_id: (0, exports.asNumber)(user_id),
        comentario: String(comentario),
    });
    if (error) {
        throw dbError(error);
    }
    return { mensagem: "Comentario adicionado!" };
}
async function getNotificacoes(query) {
    const userId = query.user_id;
    if (!userId) {
        throw new ServiceError("Falta o ID do user");
    }
    const { data, error } = await supabase_1.default
        .from("notificacoes")
        .select("*")
        .eq("user_id", (0, exports.asNumber)(userId))
        .order("data_criacao", { ascending: false })
        .limit(15);
    if (error) {
        throw dbError(error);
    }
    const notificacoes = data || [];
    const nao_lidas = notificacoes.filter((item) => Number(item.lida) === 0 || item.lida === false).length;
    return { notificacoes, nao_lidas };
}
async function lerNotificacoes(payload) {
    const { user_id } = payload || {};
    if (!user_id) {
        throw new ServiceError("Falta o ID do user");
    }
    const { error } = await supabase_1.default.from("notificacoes").update({ lida: true }).eq("user_id", (0, exports.asNumber)(user_id));
    if (error) {
        throw dbError(error);
    }
    return {};
}
async function updateProfile(payload) {
    const { user_id, nome, email, email_atual, novo_nome, novo_email } = payload || {};
    const nextNome = nome || novo_nome;
    const nextEmail = email || novo_email;
    if ((!user_id && !email_atual) || !nextNome || !nextEmail) {
        throw new ServiceError("Dados incompletos.");
    }
    let targetUserId = user_id ? (0, exports.asNumber)(user_id) : 0;
    if (!targetUserId) {
        const { data: userByEmail, error: userByEmailError } = await supabase_1.default
            .from("users")
            .select("id")
            .eq("email", String(email_atual))
            .maybeSingle();
        if (userByEmailError) {
            throw dbError(userByEmailError);
        }
        if (!userByEmail) {
            throw new ServiceError("Utilizador nao encontrado.", 404);
        }
        targetUserId = (0, exports.asNumber)(userByEmail.id);
    }
    const { data: existing, error: existingError } = await supabase_1.default
        .from("users")
        .select("id")
        .eq("email", String(nextEmail))
        .neq("id", targetUserId)
        .maybeSingle();
    if (existingError) {
        throw dbError(existingError);
    }
    if (existing) {
        throw new ServiceError("Este email ja esta a ser utilizado por outro utilizador.");
    }
    const { error } = await supabase_1.default
        .from("users")
        .update({ nome: String(nextNome), email: String(nextEmail) })
        .eq("id", targetUserId);
    if (error) {
        throw dbError(error);
    }
    return { mensagem: "Perfil atualizado com sucesso!" };
}
async function updatePassword(payload) {
    const { user_id, email, senha_atual, nova_senha } = payload || {};
    if ((!user_id && !email) || !senha_atual || !nova_senha) {
        throw new ServiceError("Dados incompletos.");
    }
    const { data, error: readError } = user_id
        ? await supabase_1.default
            .from("users")
            .select("id")
            .eq("id", (0, exports.asNumber)(user_id))
            .eq("senha", String(senha_atual))
            .maybeSingle()
        : await supabase_1.default
            .from("users")
            .select("id")
            .eq("email", String(email))
            .eq("senha", String(senha_atual))
            .maybeSingle();
    if (readError) {
        throw dbError(readError);
    }
    if (!data) {
        throw new ServiceError("Password atual incorreta.");
    }
    const { error } = await supabase_1.default.from("users").update({ senha: String(nova_senha) }).eq("id", (0, exports.asNumber)(data.id));
    if (error) {
        throw dbError(error);
    }
    return { mensagem: "Password atualizada com sucesso!" };
}
