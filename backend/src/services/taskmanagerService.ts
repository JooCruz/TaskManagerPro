import supabase from "../config/supabase";

export type DbRow = Record<string, any>;

export class ServiceError extends Error {
  constructor(
    message: string,
    public statusCode = 400
  ) {
    super(message);
  }
}

const dbError = (error: { message: string } | null) =>
  new ServiceError(error?.message || "Erro na base de dados", 500);

export const asNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

async function usersById(ids: Array<number | null | undefined>): Promise<Map<number, DbRow>> {
  const cleanIds = [...new Set(ids.filter((id): id is number => Number.isFinite(Number(id))).map(Number))];
  if (cleanIds.length === 0) {
    return new Map();
  }

  const { data, error } = await supabase.from("users").select("*").in("id", cleanIds);
  if (error) {
    throw dbError(error);
  }

  return new Map((data || []).map((user) => [Number(user.id), user]));
}

async function namesById(table: string, ids: Array<number | null | undefined>): Promise<Map<number, string>> {
  const cleanIds = [...new Set(ids.filter((id): id is number => Number.isFinite(Number(id))).map(Number))];
  if (cleanIds.length === 0) {
    return new Map();
  }

  const { data, error } = await supabase.from(table).select("id,nome").in("id", cleanIds);
  if (error) {
    throw dbError(error);
  }

  return new Map((data || []).map((row) => [Number(row.id), row.nome]));
}

export async function login(payload: DbRow) {
  const { email, password } = payload || {};

  if (!email || !password) {
    throw new ServiceError("Dados incompletos");
  }

  const { data, error } = await supabase
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

export async function adminCreateUser(payload: DbRow) {
  const { nome, email, senha, role = "user", empresa_id = 1, departamento_id } = payload || {};

  if (!nome || !email || !senha) {
    throw new ServiceError("Dados incompletos recebidos pelo servidor.");
  }

  const { data: existing, error: existingError } = await supabase
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

  const { error } = await supabase.from("users").insert({
    empresa_id: asNumber(empresa_id, 1),
    departamento_id: departamento_id === "" || departamento_id === undefined ? null : asNumber(departamento_id),
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

export async function getUsers() {
  const { data, error } = await supabase
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

export async function createEmpresa(payload: DbRow) {
  const { nome } = payload || {};
  if (!nome) {
    throw new ServiceError("Nome da empresa em falta.");
  }

  const { error } = await supabase.from("empresas").insert({ nome: String(nome) });
  if (error) {
    throw dbError(error);
  }

  return { mensagem: "Nova empresa registada com sucesso!" };
}

export async function getEmpresas() {
  const { data, error } = await supabase.from("empresas").select("id,nome").order("id", { ascending: true });
  if (error) {
    throw dbError(error);
  }

  return { empresas: data || [] };
}

export async function createDepartamento(payload: DbRow) {
  const { nome, empresa_id } = payload || {};
  if (!nome || !empresa_id) {
    throw new ServiceError("Dados incompletos.");
  }

  const { error } = await supabase
    .from("departamentos")
    .insert({ empresa_id: asNumber(empresa_id), nome: String(nome) });

  if (error) {
    throw dbError(error);
  }

  return { mensagem: "Departamento criado com sucesso!" };
}

export async function getDepartamentos(query: DbRow) {
  const empresaId = query.empresa_id;
  if (!empresaId) {
    throw new ServiceError("ID da empresa em falta.");
  }

  const { data, error } = await supabase
    .from("departamentos")
    .select("id,nome")
    .eq("empresa_id", asNumber(empresaId))
    .order("id", { ascending: true });

  if (error) {
    throw dbError(error);
  }

  return { departamentos: data || [] };
}

export async function getTeam(query: DbRow) {
  const departamentoId = query.departamento_id;
  if (!departamentoId) {
    throw new ServiceError("ID do departamento em falta.");
  }

  const { data, error } = await supabase
    .from("users")
    .select("id,nome,email,role")
    .eq("departamento_id", asNumber(departamentoId))
    .order("id", { ascending: true });

  if (error) {
    throw dbError(error);
  }

  return { team: data || [] };
}

export async function createTask(payload: DbRow) {
  const { titulo, descricao = "", data_entrega = null, hora_entrega = null } = payload || {};
  const { empresa_id = 1, criador_id = 1, atribuida_a, departamento_id } = payload || {};

  if (!titulo || !atribuida_a) {
    throw new ServiceError("Dados incompletos enviados pelo React.");
  }

  const { error } = await supabase.from("tarefas").insert({
    empresa_id: asNumber(empresa_id, 1),
    departamento_id: departamento_id ? asNumber(departamento_id) : null,
    criador_id: asNumber(criador_id, 1),
    atribuida_a: asNumber(atribuida_a),
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

export async function addLegacyTask(payload: DbRow) {
  const { titulo, status } = payload || {};
  if (!titulo || !status) {
    throw new ServiceError("Dados incompletos.");
  }

  // Possivel codigo morto: a app atual nao chama add_task.php e o dump antigo nem inclui a tabela tasks.
  const { error } = await supabase.from("tasks").insert({ titulo: String(titulo), status: String(status) });
  if (error) {
    throw dbError(error);
  }

  return { mensagem: "Tarefa adicionada!" };
}

export async function getMyTasks(query: DbRow) {
  const userId = query.user_id;
  if (!userId) {
    throw new ServiceError("Falta o ID do user");
  }

  const { data, error } = await supabase
    .from("tarefas")
    .select("*")
    .eq("atribuida_a", asNumber(userId))
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

export async function getManagerTasks(query: DbRow) {
  const departamentoId = query.departamento_id;
  if (!departamentoId) {
    throw new ServiceError("ID do departamento em falta.");
  }

  const { data, error } = await supabase
    .from("tarefas")
    .select("*")
    .eq("departamento_id", asNumber(departamentoId))
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

export async function toggleImportante(payload: DbRow) {
  const { tarefa_id } = payload || {};
  if (!tarefa_id) {
    throw new ServiceError("ID da tarefa nao enviado.");
  }

  const { data: tarefa, error: readError } = await supabase
    .from("tarefas")
    .select("importante")
    .eq("id", asNumber(tarefa_id))
    .maybeSingle();

  if (readError) {
    throw dbError(readError);
  }

  if (!tarefa) {
    throw new ServiceError("Tarefa nao encontrada.", 404);
  }

  const { error } = await supabase
    .from("tarefas")
    .update({ importante: !Boolean(tarefa.importante) })
    .eq("id", asNumber(tarefa_id));

  if (error) {
    throw dbError(error);
  }

  return {};
}

export async function updateTaskProgress(payload: DbRow) {
  const { tarefa_id, progresso } = payload || {};
  if (!tarefa_id || progresso === undefined) {
    throw new ServiceError("Dados incompletos");
  }

  const novoStatus = asNumber(progresso) === 100 ? "Concluída" : "Em Andamento";
  const { error } = await supabase
    .from("tarefas")
    .update({ progresso: asNumber(progresso), status: novoStatus })
    .eq("id", asNumber(tarefa_id));

  if (error) {
    throw dbError(error);
  }

  return { novo_status: novoStatus };
}

export async function updateLegacyTask(payload: DbRow) {
  const { id, status } = payload || {};
  if (!id || !status) {
    throw new ServiceError("Dados incompletos.");
  }

  // Possivel codigo morto: mantido para compatibilidade com o endpoint PHP antigo.
  const { error } = await supabase.from("tasks").update({ status: String(status) }).eq("id", asNumber(id));
  if (error) {
    throw dbError(error);
  }

  return {};
}

export async function deleteLegacyTask(payload: DbRow) {
  const { id } = payload || {};
  if (!id) {
    throw new ServiceError("ID da tarefa em falta.");
  }

  // Possivel codigo morto: mantido para compatibilidade com o endpoint PHP antigo.
  const { error } = await supabase.from("tasks").delete().eq("id", asNumber(id));
  if (error) {
    throw dbError(error);
  }

  return {};
}

export async function getComments(query: DbRow) {
  const tarefaId = query.tarefa_id;
  if (!tarefaId) {
    throw new ServiceError("Falta o ID da tarefa");
  }

  const { data, error } = await supabase
    .from("comentarios")
    .select("*")
    .eq("tarefa_id", asNumber(tarefaId))
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

export async function addComment(payload: DbRow) {
  const { tarefa_id, user_id, comentario } = payload || {};
  if (!tarefa_id || !user_id || !comentario) {
    throw new ServiceError("Dados incompletos");
  }

  const { error } = await supabase.from("comentarios").insert({
    tarefa_id: asNumber(tarefa_id),
    user_id: asNumber(user_id),
    comentario: String(comentario),
  });

  if (error) {
    throw dbError(error);
  }

  return { mensagem: "Comentario adicionado!" };
}

export async function getNotificacoes(query: DbRow) {
  const userId = query.user_id;
  if (!userId) {
    throw new ServiceError("Falta o ID do user");
  }

  const { data, error } = await supabase
    .from("notificacoes")
    .select("*")
    .eq("user_id", asNumber(userId))
    .order("data_criacao", { ascending: false })
    .limit(15);

  if (error) {
    throw dbError(error);
  }

  const notificacoes = data || [];
  const nao_lidas = notificacoes.filter((item) => Number(item.lida) === 0 || item.lida === false).length;

  return { notificacoes, nao_lidas };
}

export async function lerNotificacoes(payload: DbRow) {
  const { user_id } = payload || {};
  if (!user_id) {
    throw new ServiceError("Falta o ID do user");
  }

  const { error } = await supabase.from("notificacoes").update({ lida: true }).eq("user_id", asNumber(user_id));
  if (error) {
    throw dbError(error);
  }

  return {};
}

export async function updateProfile(payload: DbRow) {
  const { user_id, nome, email, email_atual, novo_nome, novo_email } = payload || {};
  const nextNome = nome || novo_nome;
  const nextEmail = email || novo_email;

  if ((!user_id && !email_atual) || !nextNome || !nextEmail) {
    throw new ServiceError("Dados incompletos.");
  }

  let targetUserId = user_id ? asNumber(user_id) : 0;

  if (!targetUserId) {
    const { data: userByEmail, error: userByEmailError } = await supabase
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

    targetUserId = asNumber(userByEmail.id);
  }

  const { data: existing, error: existingError } = await supabase
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

  const { error } = await supabase
    .from("users")
    .update({ nome: String(nextNome), email: String(nextEmail) })
    .eq("id", targetUserId);

  if (error) {
    throw dbError(error);
  }

  return { mensagem: "Perfil atualizado com sucesso!" };
}

export async function updatePassword(payload: DbRow) {
  const { user_id, email, senha_atual, nova_senha } = payload || {};
  if ((!user_id && !email) || !senha_atual || !nova_senha) {
    throw new ServiceError("Dados incompletos.");
  }

  const { data, error: readError } = user_id
    ? await supabase
        .from("users")
        .select("id")
        .eq("id", asNumber(user_id))
        .eq("senha", String(senha_atual))
        .maybeSingle()
    : await supabase
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

  const { error } = await supabase.from("users").update({ senha: String(nova_senha) }).eq("id", asNumber(data.id));

  if (error) {
    throw dbError(error);
  }

  return { mensagem: "Password atualizada com sucesso!" };
}

