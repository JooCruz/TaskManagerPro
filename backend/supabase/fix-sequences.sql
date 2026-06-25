-- Corrigir a sequência de auto-incremento das tabelas
-- Isso é necessário porque os dados pré-existentes têm IDs fixos (1, 2, 3)
-- e a sequência precisa continuar de onde pararam

SELECT setval('public.empresas_id_seq', (SELECT MAX(id) FROM public.empresas) + 1);
SELECT setval('public.departamentos_id_seq', (SELECT MAX(id) FROM public.departamentos) + 1);
SELECT setval('public.users_id_seq', (SELECT MAX(id) FROM public.users) + 1);
SELECT setval('public.tarefas_id_seq', (SELECT MAX(id) FROM public.tarefas) + 1);
SELECT setval('public.comentarios_id_seq', (SELECT MAX(id) FROM public.comentarios) + 1);
SELECT setval('public.notificacoes_id_seq', (SELECT MAX(id) FROM public.notificacoes) + 1);
