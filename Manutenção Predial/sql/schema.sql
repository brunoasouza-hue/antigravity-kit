-- Script de Criação do Banco de Dados - SENAI Manutenção Predial
-- UTF-8 mb4 habilitado para suportar caracteres especiais e acentos em português.

CREATE DATABASE IF NOT EXISTS manutencao_predial CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE manutencao_predial;

-- =========================================================================
-- 1. TABELA DE USUÁRIOS
-- =========================================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    nivel_acesso ENUM('Solicitante', 'Gestor', 'Executor') NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================================================================
-- 2. TABELA DE AMBIENTES (Blocos e Salas)
-- =========================================================================
-- O CHECK constraint garante que nenhum ambiente seja cadastrado com o nome "VAZIO" 
-- (ignorando maiúsculas/minúsculas e removendo espaços em branco extras).
CREATE TABLE IF NOT EXISTS ambientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome_bloco_sala VARCHAR(100) NOT NULL UNIQUE,
    status ENUM('Ativo', 'Inativo') NOT NULL DEFAULT 'Ativo',
    CONSTRAINT chk_nome_nao_vazio CHECK (UPPER(TRIM(nome_bloco_sala)) <> 'VAZIO' AND TRIM(nome_bloco_sala) <> '')
) ENGINE=InnoDB;

-- =========================================================================
-- 3. TABELA DE ORDENS DE SERVIÇO (Corretivas)
-- =========================================================================
-- A relação com ambientes possui ON DELETE CASCADE para possibilitar a exclusão direta 
-- de ambientes e a respectiva limpeza automática de suas ordens de serviço associadas.
CREATE TABLE IF NOT EXISTS ordens_servico (
    id INT AUTO_INCREMENT PRIMARY KEY,
    solicitante_id INT NOT NULL,
    gestor_id INT DEFAULT NULL,
    executor_id INT DEFAULT NULL,
    ambiente_id INT NOT NULL,
    descricao_problema TEXT NOT NULL,
    tipo_execucao ENUM('Interna', 'Terceirizada') NOT NULL DEFAULT 'Interna',
    status ENUM('Pendente', 'Em Execução', 'Aguardando Validação', 'Concluída') NOT NULL DEFAULT 'Pendente',
    data_abertura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_fechamento DATETIME DEFAULT NULL,
    FOREIGN KEY (solicitante_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (gestor_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (executor_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (ambiente_id) REFERENCES ambientes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================================================================
-- 4. TABELA DE CHECKLISTS (Preventivas)
-- =========================================================================
-- Também configurada com ON DELETE CASCADE na relação de ambientes e usuários.
CREATE TABLE IF NOT EXISTS checklists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ambiente_id INT NOT NULL,
    responsavel_id INT NOT NULL,
    data_inspecao DATE NOT NULL,
    status_tomadas ENUM('Ok', 'Defeito', 'Não se aplica') NOT NULL DEFAULT 'Não se aplica',
    status_forros ENUM('Ok', 'Defeito', 'Não se aplica') NOT NULL DEFAULT 'Não se aplica',
    status_paredes ENUM('Ok', 'Defeito', 'Não se aplica') NOT NULL DEFAULT 'Não se aplica',
    status_projetor ENUM('Ok', 'Defeito', 'Não se aplica') NOT NULL DEFAULT 'Não se aplica',
    status_tela ENUM('Ok', 'Defeito', 'Não se aplica') NOT NULL DEFAULT 'Não se aplica',
    status_lousa ENUM('Ok', 'Defeito', 'Não se aplica') NOT NULL DEFAULT 'Não se aplica',
    observacoes TEXT DEFAULT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ambiente_id) REFERENCES ambientes(id) ON DELETE CASCADE,
    FOREIGN KEY (responsavel_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================================================================
-- CARGA INICIAL DE DADOS (SEEDING)
-- =========================================================================

-- Inserindo usuários de exemplo (Senha: "senai123" criptografada com password_hash / bcrypt)
-- Hash gerado por: password_hash('senai123', PASSWORD_DEFAULT)
INSERT INTO usuarios (nome, email, senha, nivel_acesso) VALUES
('Carlos Souza (Solicitante)', 'solicitante@senai.br', '$2y$10$U228o/lq1Q7n6lP2tT/Eae/T1XUeTj.lYVfG9d4t.F37yT7V42qK6', 'Solicitante'),
('Renata Mendes (Gestor)', 'gestor@senai.br', '$2y$10$U228o/lq1Q7n6lP2tT/Eae/T1XUeTj.lYVfG9d4t.F37yT7V42qK6', 'Gestor'),
('Marcos Silva (Executor)', 'executor@senai.br', '$2y$10$U228o/lq1Q7n6lP2tT/Eae/T1XUeTj.lYVfG9d4t.F37yT7V42qK6', 'Executor')
ON DUPLICATE KEY UPDATE id=id;

-- Inserindo ambientes válidos (Desconsiderando os marcados como "VAZIO")
INSERT INTO ambientes (nome_bloco_sala, status) VALUES
('Bloco A - Lab Informática 1', 'Ativo'),
('Bloco A - Lab Redes', 'Ativo'),
('Bloco B - Oficina Mecânica', 'Ativo'),
('Bloco B - Sala Eletroeletrônica', 'Ativo'),
('Bloco C - Auditório Principal', 'Ativo'),
('Bloco C - Sala de Reuniões', 'Ativo')
ON DUPLICATE KEY UPDATE id=id;
