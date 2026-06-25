-- Supabase schema for the migrated TaskManager API.
-- Mirrors the old PHP/MySQL backend tables while using PostgreSQL types.

create table if not exists public.empresas (
  id bigserial primary key,
  nome varchar(100) not null,
  data_criacao timestamptz not null default now()
);

create table if not exists public.departamentos (
  id bigserial primary key,
  empresa_id bigint not null references public.empresas(id) on delete cascade,
  nome varchar(100) not null
);

create table if not exists public.users (
  id bigserial primary key,
  empresa_id bigint not null references public.empresas(id) on delete cascade,
  departamento_id bigint references public.departamentos(id) on delete set null,
  nome varchar(100) not null,
  email varchar(100) not null unique,
  senha varchar(255) not null,
  role varchar(20) not null default 'user',
  data_criacao timestamptz not null default now(),
  constraint users_role_check check (role in ('admin', 'manager', 'user'))
);

create table if not exists public.tarefas (
  id bigserial primary key,
  empresa_id bigint not null references public.empresas(id) on delete cascade,
  departamento_id bigint references public.departamentos(id) on delete cascade,
  criador_id bigint not null references public.users(id) on delete cascade,
  atribuida_a bigint not null references public.users(id) on delete cascade,
  titulo varchar(255) not null,
  descricao text,
  data_entrega date,
  hora_entrega time,
  progresso integer not null default 0,
  status varchar(30) not null default 'Pendente',
  data_criacao timestamptz not null default now(),
  importante boolean not null default false,
  constraint tarefas_progresso_check check (progresso >= 0 and progresso <= 100),
  constraint tarefas_status_check check (status in ('Pendente', 'Em Andamento', 'Concluída'))
);

create table if not exists public.comentarios (
  id bigserial primary key,
  tarefa_id bigint not null references public.tarefas(id) on delete cascade,
  user_id bigint not null references public.users(id) on delete cascade,
  comentario text not null,
  data_criacao timestamptz not null default now()
);

create table if not exists public.notificacoes (
  id bigserial primary key,
  user_id bigint not null references public.users(id) on delete cascade,
  mensagem text not null,
  lida boolean not null default false,
  data_criacao timestamptz not null default now()
);

-- Legacy table used only by add_task.php, update_task.php and delete_task.php.
-- The current mobile app appears to use public.tarefas instead.
create table if not exists public.tasks (
  id bigserial primary key,
  titulo varchar(255) not null,
  status varchar(100) not null,
  data_criacao timestamptz not null default now()
);

create index if not exists departamentos_empresa_id_idx on public.departamentos(empresa_id);
create index if not exists users_empresa_id_idx on public.users(empresa_id);
create index if not exists users_departamento_id_idx on public.users(departamento_id);
create index if not exists tarefas_empresa_id_idx on public.tarefas(empresa_id);
create index if not exists tarefas_departamento_id_idx on public.tarefas(departamento_id);
create index if not exists tarefas_criador_id_idx on public.tarefas(criador_id);
create index if not exists tarefas_atribuida_a_idx on public.tarefas(atribuida_a);
create index if not exists tarefas_data_criacao_idx on public.tarefas(data_criacao desc);
create index if not exists comentarios_tarefa_id_idx on public.comentarios(tarefa_id);
create index if not exists comentarios_user_id_idx on public.comentarios(user_id);
create index if not exists notificacoes_user_id_data_criacao_idx on public.notificacoes(user_id, data_criacao desc);

INSERT INTO users (id, empresa_id, departamento_id, nome, email, senha, role, data_criacao) VALUES (1, 1, 1, 'Admin', 'admin@teste.com', '1234', 'admin', '2026-05-04 12:01:32');
INSERT INTO users (id, empresa_id, departamento_id, nome, email, senha, role, data_criacao) VALUES (2, 2, 2, 'joao', 'joao@cruztech.com', '1234', 'user', '2026-05-04 12:27:54');
INSERT INTO users (id, empresa_id, departamento_id, nome, email, senha, role, data_criacao) VALUES (3, 2, 3, 'cruz', 'cruz@cruztech.com', '1234', 'manager', '2026-05-04 12:28:39');
INSERT INTO users (id, empresa_id, departamento_id, nome, email, senha, role, data_criacao) VALUES (4, 2, 2, 'Afonso', 'a@cruztech.com', '1234', 'manager', '2026-05-04 12:52:13');
INSERT INTO users (id, empresa_id, departamento_id, nome, email, senha, role, data_criacao) VALUES (5, 3, 4, 'Simao', 'simao@teste1.com', '1234', 'user', '2026-05-05 10:36:58');



INSERT INTO empresas ( id, nome, data_criacao) VALUES (1, 'Empresa Principal', '2026-05-04 12:01:32');
INSERT INTO empresas (id, nome, data_criacao) VALUES (2, 'CruZTech', '2026-05-04 12:24:34');
INSERT INTO empresas (id, nome, data_criacao) VALUES (3, 'teste1', '2026-05-05 10:36:23');


INSERT INTO departamentos (id, empresa_id, nome) VALUES (1, 1, 'Administração');
INSERT INTO departamentos (id, empresa_id, nome) VALUES (2, 2, 'Recursos Humanos');
INSERT INTO departamentos (id, empresa_id, nome) VALUES (3, 2, 'Direção');
INSERT INTO departamentos (id, empresa_id, nome) VALUES (4, 3, 'IT')
