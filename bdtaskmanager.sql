-- --------------------------------------------------------
-- Anfitrião:                    127.0.0.1
-- Versão do servidor:           8.4.3 - MySQL Community Server - GPL
-- SO do servidor:               Win64
-- HeidiSQL Versão:              12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- A despejar estrutura da base de dados para taskmanager_db
CREATE DATABASE IF NOT EXISTS `taskmanager_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `taskmanager_db`;

-- A despejar estrutura para tabela taskmanager_db.comentarios
CREATE TABLE IF NOT EXISTS `comentarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tarefa_id` int NOT NULL,
  `user_id` int NOT NULL,
  `comentario` text NOT NULL,
  `data_criacao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `tarefa_id` (`tarefa_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `comentarios_ibfk_1` FOREIGN KEY (`tarefa_id`) REFERENCES `tarefas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `comentarios_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- A despejar dados para tabela taskmanager_db.comentarios: ~6 rows (aproximadamente)
INSERT INTO `comentarios` (`id`, `tarefa_id`, `user_id`, `comentario`, `data_criacao`) VALUES
	(6, 3, 2, 'dkuaegdfojghefa~', '2026-05-05 09:50:26'),
	(7, 3, 2, 'ljdvshgvsd', '2026-05-05 09:59:29'),
	(8, 3, 4, 'ai ', '2026-05-05 09:59:54'),
	(9, 3, 4, 'ola', '2026-05-05 10:03:03'),
	(10, 3, 4, 'ola', '2026-05-05 10:03:38'),
	(11, 3, 4, 'o', '2026-05-05 10:05:05'),
	(12, 3, 4, 'o', '2026-05-05 10:06:36'),
	(13, 3, 2, 'r', '2026-05-12 15:29:36'),
	(14, 5, 3, 'm', '2026-05-12 16:46:17'),
	(15, 6, 4, 'd', '2026-05-13 09:02:51'),
	(16, 6, 2, ',', '2026-05-13 09:08:21');

-- A despejar estrutura para tabela taskmanager_db.departamentos
CREATE TABLE IF NOT EXISTS `departamentos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `empresa_id` int NOT NULL,
  `nome` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `empresa_id` (`empresa_id`),
  CONSTRAINT `departamentos_ibfk_1` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- A despejar dados para tabela taskmanager_db.departamentos: ~3 rows (aproximadamente)
INSERT INTO `departamentos` (`id`, `empresa_id`, `nome`) VALUES
	(1, 1, 'Administração'),
	(2, 2, 'Recursos Humanos'),
	(3, 2, 'Direção'),
	(4, 3, 'IT');

-- A despejar estrutura para tabela taskmanager_db.empresas
CREATE TABLE IF NOT EXISTS `empresas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `data_criacao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- A despejar dados para tabela taskmanager_db.empresas: ~0 rows (aproximadamente)
INSERT INTO `empresas` (`id`, `nome`, `data_criacao`) VALUES
	(1, 'Empresa Principal', '2026-05-04 11:01:32'),
	(2, 'CruZTech', '2026-05-04 11:24:34'),
	(3, 'teste1', '2026-05-05 09:36:23');

-- A despejar estrutura para tabela taskmanager_db.notificacoes
CREATE TABLE IF NOT EXISTS `notificacoes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `mensagem` text NOT NULL,
  `lida` tinyint(1) DEFAULT '0',
  `data_criacao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- A despejar dados para tabela taskmanager_db.notificacoes: ~0 rows (aproximadamente)

-- A despejar estrutura para tabela taskmanager_db.tarefas
CREATE TABLE IF NOT EXISTS `tarefas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `empresa_id` int NOT NULL,
  `departamento_id` int NOT NULL,
  `criador_id` int NOT NULL,
  `atribuida_a` int NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `descricao` text,
  `data_entrega` date DEFAULT NULL,
  `hora_entrega` time DEFAULT NULL,
  `progresso` int DEFAULT '0',
  `status` enum('Pendente','Em Andamento','Concluída') DEFAULT 'Pendente',
  `data_criacao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `importante` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `empresa_id` (`empresa_id`),
  KEY `departamento_id` (`departamento_id`),
  KEY `criador_id` (`criador_id`),
  KEY `atribuida_a` (`atribuida_a`),
  CONSTRAINT `tarefas_ibfk_1` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tarefas_ibfk_2` FOREIGN KEY (`departamento_id`) REFERENCES `departamentos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tarefas_ibfk_3` FOREIGN KEY (`criador_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tarefas_ibfk_4` FOREIGN KEY (`atribuida_a`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- A despejar dados para tabela taskmanager_db.tarefas: ~5 rows (aproximadamente)
INSERT INTO `tarefas` (`id`, `empresa_id`, `departamento_id`, `criador_id`, `atribuida_a`, `titulo`, `descricao`, `data_entrega`, `hora_entrega`, `progresso`, `status`, `data_criacao`, `importante`) VALUES
	(1, 2, 2, 4, 2, 'Tarefa Teste', NULL, NULL, NULL, 100, 'Concluída', '2026-05-04 18:35:15', 0),
	(2, 2, 2, 1, 2, 'Relatorio', 'relatorio', '2026-06-15', '09:00:00', 100, 'Concluída', '2026-05-04 18:46:53', 1),
	(3, 2, 2, 4, 2, 'teee', 'eeee', NULL, NULL, 100, 'Concluída', '2026-05-04 18:57:21', 1),
	(4, 2, 3, 3, 3, 'eeeee', '', '1111-11-11', '09:00:00', 100, 'Concluída', '2026-05-07 13:51:42', 0),
	(5, 2, 3, 3, 3, 'Relatorio1', '', '2026-12-12', '09:00:00', 100, 'Concluída', '2026-05-07 13:52:56', 1),
	(6, 2, 2, 4, 2, 'Relatorio', '', '2026-12-14', '09:00:00', 100, 'Concluída', '2026-05-13 08:58:21', 0),
	(7, 2, 2, 4, 2, 'teste24', '', '2026-05-12', '09:00:00', 0, 'Em Andamento', '2026-05-13 09:07:22', 0);

-- A despejar estrutura para tabela taskmanager_db.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `empresa_id` int NOT NULL,
  `departamento_id` int DEFAULT NULL,
  `nome` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `role` enum('admin','manager','user') NOT NULL DEFAULT 'user',
  `data_criacao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `empresa_id` (`empresa_id`),
  KEY `departamento_id` (`departamento_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `users_ibfk_2` FOREIGN KEY (`departamento_id`) REFERENCES `departamentos` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- A despejar dados para tabela taskmanager_db.users: ~3 rows (aproximadamente)
INSERT INTO `users` (`id`, `empresa_id`, `departamento_id`, `nome`, `email`, `senha`, `role`, `data_criacao`) VALUES
	(1, 1, 1, 'Admin', 'admin@teste.com', '1234', 'admin', '2026-05-04 11:01:32'),
	(2, 2, 2, 'joao', 'joao@cruztech.com', '1234', 'user', '2026-05-04 11:27:54'),
	(3, 2, 3, 'cruz', 'cruz@cruztech.com', '1234', 'manager', '2026-05-04 11:28:39'),
	(4, 2, 2, 'Afonso', 'a@cruztech.com', '1234', 'manager', '2026-05-04 11:52:13'),
	(5, 3, 4, 'Simao', 'simao@teste1.com', '1234', 'user', '2026-05-05 09:36:58');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
