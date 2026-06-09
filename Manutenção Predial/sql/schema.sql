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
    status ENUM('Ativo', 'Inativo') NOT NULL DEFAULT 'Ativo',
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================================================================
-- 2. TABELA DE AMBIENTES (Blocos e Salas)
-- =========================================================================
-- O CHECK constraint garante que nenhum ambiente seja cadastrado com o nome "VAZIO" 
-- (ignorando maiúsculas/minúsculas e removendo espaços em branco extras).
CREATE TABLE IF NOT EXISTS ambientes (
    id INT PRIMARY KEY,
    nome_ambiente VARCHAR(100) NOT NULL UNIQUE,
    status ENUM('Ativo', 'Inativo') NOT NULL DEFAULT 'Ativo',
    CONSTRAINT chk_nome_nao_vazio CHECK (UPPER(TRIM(nome_ambiente)) <> 'VAZIO' AND TRIM(nome_ambiente) <> '')
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

-- SEEDING DE USUARIOS (EXECUTORES)
INSERT IGNORE INTO usuarios (nome, email, senha, nivel_acesso) VALUES ('Victor Izaias Arantes', 'victor.arantes@escola.com', '$2y$10$U228o/lq1Q7n6lP2tT/Eae/T1XUeTj.lYVfG9d4t.F37yT7V42qK6', 'Executor');
INSERT IGNORE INTO usuarios (nome, email, senha, nivel_acesso) VALUES ('Silvio Ronei Marchetti', 'silvio.marchetti@escola.com', '$2y$10$U228o/lq1Q7n6lP2tT/Eae/T1XUeTj.lYVfG9d4t.F37yT7V42qK6', 'Executor');
INSERT IGNORE INTO usuarios (nome, email, senha, nivel_acesso) VALUES ('Natalia Gomes dos Santos', 'natalia.santos@escola.com', '$2y$10$U228o/lq1Q7n6lP2tT/Eae/T1XUeTj.lYVfG9d4t.F37yT7V42qK6', 'Executor');
INSERT IGNORE INTO usuarios (nome, email, senha, nivel_acesso) VALUES ('Cesar Ferraiolo Batista', 'cesar.batista@escola.com', '$2y$10$U228o/lq1Q7n6lP2tT/Eae/T1XUeTj.lYVfG9d4t.F37yT7V42qK6', 'Executor');
INSERT IGNORE INTO usuarios (nome, email, senha, nivel_acesso) VALUES ('Luciana Flores', 'luciana.flores@escola.com', '$2y$10$U228o/lq1Q7n6lP2tT/Eae/T1XUeTj.lYVfG9d4t.F37yT7V42qK6', 'Executor');
INSERT IGNORE INTO usuarios (nome, email, senha, nivel_acesso) VALUES ('Bruna Regina Bianchini Roveda', 'bruna.roveda@escola.com', '$2y$10$U228o/lq1Q7n6lP2tT/Eae/T1XUeTj.lYVfG9d4t.F37yT7V42qK6', 'Executor');
INSERT IGNORE INTO usuarios (nome, email, senha, nivel_acesso) VALUES ('Antônio Carlos Morettin', 'antonio.morettin@escola.com', '$2y$10$U228o/lq1Q7n6lP2tT/Eae/T1XUeTj.lYVfG9d4t.F37yT7V42qK6', 'Executor');
INSERT IGNORE INTO usuarios (nome, email, senha, nivel_acesso) VALUES ('Claudemir Aparecido Flores', 'claudemir.flores@escola.com', '$2y$10$U228o/lq1Q7n6lP2tT/Eae/T1XUeTj.lYVfG9d4t.F37yT7V42qK6', 'Executor');
INSERT IGNORE INTO usuarios (nome, email, senha, nivel_acesso) VALUES ('Adriana Cristina de Jesus Rosa', 'adriana.rosa@escola.com', '$2y$10$U228o/lq1Q7n6lP2tT/Eae/T1XUeTj.lYVfG9d4t.F37yT7V42qK6', 'Executor');
INSERT IGNORE INTO usuarios (nome, email, senha, nivel_acesso) VALUES ('Geovane Roberto da Silva', 'geovane.silva@escola.com', '$2y$10$U228o/lq1Q7n6lP2tT/Eae/T1XUeTj.lYVfG9d4t.F37yT7V42qK6', 'Executor');
INSERT IGNORE INTO usuarios (nome, email, senha, nivel_acesso) VALUES ('Flavio Alves da Silva', 'flavio.silva@escola.com', '$2y$10$U228o/lq1Q7n6lP2tT/Eae/T1XUeTj.lYVfG9d4t.F37yT7V42qK6', 'Executor');
INSERT IGNORE INTO usuarios (nome, email, senha, nivel_acesso) VALUES ('Marcelo Vinicius Oliveira Dionisio', 'marcelo.dionisio@escola.com', '$2y$10$U228o/lq1Q7n6lP2tT/Eae/T1XUeTj.lYVfG9d4t.F37yT7V42qK6', 'Executor');
INSERT IGNORE INTO usuarios (nome, email, senha, nivel_acesso) VALUES ('Alexandre Felix de Araujo', 'alexandre.araujo@escola.com', '$2y$10$U228o/lq1Q7n6lP2tT/Eae/T1XUeTj.lYVfG9d4t.F37yT7V42qK6', 'Executor');
INSERT IGNORE INTO usuarios (nome, email, senha, nivel_acesso) VALUES ('Wellington Gonçalves Norberto', 'wellington.norberto@escola.com', '$2y$10$U228o/lq1Q7n6lP2tT/Eae/T1XUeTj.lYVfG9d4t.F37yT7V42qK6', 'Executor');
INSERT IGNORE INTO usuarios (nome, email, senha, nivel_acesso) VALUES ('Sergio Eduardo Brunessi', 'sergio.brunessi@escola.com', '$2y$10$U228o/lq1Q7n6lP2tT/Eae/T1XUeTj.lYVfG9d4t.F37yT7V42qK6', 'Executor');
INSERT IGNORE INTO usuarios (nome, email, senha, nivel_acesso) VALUES ('Bruno Alves de Souza', 'bruno.souza@escola.com', '$2y$10$U228o/lq1Q7n6lP2tT/Eae/T1XUeTj.lYVfG9d4t.F37yT7V42qK6', 'Executor');
INSERT IGNORE INTO usuarios (nome, email, senha, nivel_acesso) VALUES ('Cleiton Cezar Monteiro', 'cleiton.monteiro@escola.com', '$2y$10$U228o/lq1Q7n6lP2tT/Eae/T1XUeTj.lYVfG9d4t.F37yT7V42qK6', 'Executor');
INSERT IGNORE INTO usuarios (nome, email, senha, nivel_acesso) VALUES ('Angelica Affonso Bassan', 'angelica.bassan@escola.com', '$2y$10$U228o/lq1Q7n6lP2tT/Eae/T1XUeTj.lYVfG9d4t.F37yT7V42qK6', 'Executor');
INSERT IGNORE INTO usuarios (nome, email, senha, nivel_acesso) VALUES ('Gustavo Antonio Marchiori', 'gustavo.marchiori@escola.com', '$2y$10$U228o/lq1Q7n6lP2tT/Eae/T1XUeTj.lYVfG9d4t.F37yT7V42qK6', 'Executor');
INSERT IGNORE INTO usuarios (nome, email, senha, nivel_acesso) VALUES ('Marcio Donizete Gasparoto', 'marcio.gasparoto@escola.com', '$2y$10$U228o/lq1Q7n6lP2tT/Eae/T1XUeTj.lYVfG9d4t.F37yT7V42qK6', 'Executor');
INSERT IGNORE INTO usuarios (nome, email, senha, nivel_acesso) VALUES ('Everton Luiz Cerantula', 'everton.cerantula@escola.com', '$2y$10$U228o/lq1Q7n6lP2tT/Eae/T1XUeTj.lYVfG9d4t.F37yT7V42qK6', 'Executor');
INSERT IGNORE INTO usuarios (nome, email, senha, nivel_acesso) VALUES ('Diego Soares de Oliveira', 'diego.oliveira@escola.com', '$2y$10$U228o/lq1Q7n6lP2tT/Eae/T1XUeTj.lYVfG9d4t.F37yT7V42qK6', 'Executor');
INSERT IGNORE INTO usuarios (nome, email, senha, nivel_acesso) VALUES ('Almir Lotito Lima', 'almir.lima@escola.com', '$2y$10$U228o/lq1Q7n6lP2tT/Eae/T1XUeTj.lYVfG9d4t.F37yT7V42qK6', 'Executor');
INSERT IGNORE INTO usuarios (nome, email, senha, nivel_acesso) VALUES ('Marcio Garcia', 'marcio.garcia@escola.com', '$2y$10$U228o/lq1Q7n6lP2tT/Eae/T1XUeTj.lYVfG9d4t.F37yT7V42qK6', 'Executor');
INSERT IGNORE INTO usuarios (nome, email, senha, nivel_acesso) VALUES ('Rafael Marangoni Paixão', 'rafael.paixao@escola.com', '$2y$10$U228o/lq1Q7n6lP2tT/Eae/T1XUeTj.lYVfG9d4t.F37yT7V42qK6', 'Executor');
INSERT IGNORE INTO usuarios (nome, email, senha, nivel_acesso) VALUES ('Equipe Itinerante', 'equipe.itinerante@escola.com', '$2y$10$U228o/lq1Q7n6lP2tT/Eae/T1XUeTj.lYVfG9d4t.F37yT7V42qK6', 'Executor');
INSERT IGNORE INTO usuarios (nome, email, senha, nivel_acesso) VALUES ('Roberto de Souza Ribeiro Moraes Junior', 'roberto.junior@escola.com', '$2y$10$U228o/lq1Q7n6lP2tT/Eae/T1XUeTj.lYVfG9d4t.F37yT7V42qK6', 'Executor');
INSERT IGNORE INTO usuarios (nome, email, senha, nivel_acesso) VALUES ('Renan Junior de Almeida Silva', 'renan.silva@escola.com', '$2y$10$U228o/lq1Q7n6lP2tT/Eae/T1XUeTj.lYVfG9d4t.F37yT7V42qK6', 'Executor');
INSERT IGNORE INTO usuarios (nome, email, senha, nivel_acesso) VALUES ('Rafael Forti Scalfi', 'rafael.scalfi@escola.com', '$2y$10$U228o/lq1Q7n6lP2tT/Eae/T1XUeTj.lYVfG9d4t.F37yT7V42qK6', 'Executor');
INSERT IGNORE INTO usuarios (nome, email, senha, nivel_acesso) VALUES ('Rogerio Monteiro da Silva', 'rogerio.silva@escola.com', '$2y$10$U228o/lq1Q7n6lP2tT/Eae/T1XUeTj.lYVfG9d4t.F37yT7V42qK6', 'Executor');

-- SEEDING DE AMBIENTES
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770001, 'RECPÇÃO') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770002, 'COORDPEDAG') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770003, 'COORDRELAIND') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770004, 'SECRETARIA') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770005, 'SERVIDORPABX') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770006, 'ARQUIVOPOST') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770007, 'REUNIAO') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770008, 'DIRETORIA') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770010, 'BIBLIOTECA') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770012, 'ALMOXARIFADO') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770013, 'DOCENTES') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770014, 'AAPM') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770015, 'ANUALVIDA') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770017, 'REFEITORIO') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770018, 'ALMOXMECANIC') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770019, 'DEPMECANICA') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770020, 'DEPSOLDAGEM') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770021, 'ORIENPRATPRO') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770022, 'CASEOCMECAN') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770023, 'LABHIDRAPNEU') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770024, 'LABMETROLOG') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770025, 'LABINFORMAT') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770026, 'LABCAMCNCMEC') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770027, 'ESMERILHAMEN') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770028, 'OFSOLDAGEM') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770029, 'TRATTERMICO') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770030, 'OFMECEICPES') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770031, 'OFTORNEARIA') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770032, 'OFFRESAAJUST') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770033, 'OFMAQCNCMEC') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770034, 'SALATECMEC') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770035, 'SALAAULA') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770036, 'SALAAULA') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770037, 'SALAAULA') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770038, 'SALAAULA') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770039, 'SALADESENHO') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770040, 'COORDTECNICA') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770042, 'CASEOCMARCEN') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770043, 'DEPMOVACAB') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770044, 'DEPFERRAMARC') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770045, 'DEPTINTAS') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770047, 'LABELETROLP') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770048, 'LABCOMAQELET') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770049, 'CABPINTURA') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770050, 'OFMAQCNCMAD') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770051, 'OFMAQCONVMAD') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770052, 'OFINSTALELET') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770053, 'OFTAPECARIA') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770054, 'OFCOSTURAIND') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770055, 'SALAAULA') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770056, 'SALATECCOST') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770057, 'SALATECMAD') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770058, 'AUDITFOYER') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770059, 'BXABREMPILH') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770060, 'ALMOXFERR') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770061, 'ABREMPILHA') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770062, 'DEP JARDINAG') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770063, 'DEPLIMPEZAG') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770064, 'ZELADORIA') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770065, 'ABRCOMPRESS') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770066, 'PORTARIA') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770071, 'ALMOXMADEIRA') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770072, 'ALMOXQUIMICO') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770073, 'INFORMATICA') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770074, 'PATIO') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770075, 'COSTURA') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770078, 'SANITARIOFEM') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770079, 'SANITARIOMAS') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770080, 'SANITARIOFEM') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770081, 'SANITARIOMAS') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770086, 'COZINHA') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770095, 'PANIFICACAO') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770096, 'LABTI') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770099, 'ITINERANTE') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770100, 'REFRIGERAÇÃO') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770101, 'CADCAMTI') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770102, 'ARQUIVOPERM') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770103, 'SLIMPRESSOES') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770104, 'LABTIB') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770105, 'SESIFERNAND') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;
INSERT INTO ambientes (id, nome_ambiente) VALUES (20770106, 'CONSTCIVIL') ON DUPLICATE KEY UPDATE nome_ambiente=nome_ambiente;


-- =========================================================================
-- 5. TABELA DE INSPEÇÕES GERAIS EM QUADROS E PAINEIS (SESSÕES)
-- =========================================================================
CREATE TABLE IF NOT EXISTS inspecoes_geral (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unidade VARCHAR(100) NOT NULL,
    data_inspecao DATE NOT NULL,
    responsavel_id INT NOT NULL,
    observacoes TEXT DEFAULT NULL,
    status ENUM('Em Andamento', 'Encerrada') NOT NULL DEFAULT 'Em Andamento',
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (responsavel_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================================================================
-- 6. TABELA DE INSPEÇÕES VISUAIS EM QUADROS E PAINEIS ELÉTRICOS (RH-064-FR009)
-- =========================================================================
CREATE TABLE IF NOT EXISTS inspecoes_painel (
    id INT AUTO_INCREMENT PRIMARY KEY,
    inspecao_geral_id INT DEFAULT NULL,
    unidade VARCHAR(100) NOT NULL,
    setor VARCHAR(100) NOT NULL,
    quadro_tag VARCHAR(100) NOT NULL,
    data_inspecao DATE NOT NULL,
    responsavel_id INT NOT NULL,
    observacoes TEXT DEFAULT NULL,
    itens JSON NOT NULL,
    status_geral ENUM('Conforme', 'Não Conforme') NOT NULL DEFAULT 'Conforme',
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (inspecao_geral_id) REFERENCES inspecoes_geral(id) ON DELETE CASCADE,
    FOREIGN KEY (responsavel_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

