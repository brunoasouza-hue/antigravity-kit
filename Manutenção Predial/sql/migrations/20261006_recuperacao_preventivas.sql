-- Migração aditiva do armazenamento preventivo. Não reexecutar schema.sql.
-- Compatível com MariaDB 10.4; nomes e IDs de registros existentes são preservados.
SET NAMES utf8mb4;
CREATE TABLE IF NOT EXISTS usuario_ambiente (
    usuario_id INT NOT NULL,
    ambiente_id INT NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_id, ambiente_id),
    KEY idx_usuario_ambiente_ambiente (ambiente_id),
    CONSTRAINT fk_usuario_ambiente_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_usuario_ambiente_ambiente FOREIGN KEY (ambiente_id) REFERENCES ambientes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS inspecoes_mensais (
    id INT NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE NULL,
    status VARCHAR(40) NOT NULL,
    responsavel_id INT NOT NULL,
    data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_inspecoes_mensais_responsavel (responsavel_id),
    CONSTRAINT fk_inspecoes_mensais_responsavel FOREIGN KEY (responsavel_id) REFERENCES usuarios(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Preserva IDs importados e permite gerar IDs novos para ciclos futuros.
ALTER TABLE inspecoes_mensais MODIFY id INT NOT NULL AUTO_INCREMENT;

ALTER TABLE ambientes ADD COLUMN IF NOT EXISTS familia VARCHAR(80) NOT NULL DEFAULT 'Geral';

CREATE TABLE IF NOT EXISTS itens_preventiva (
    id INT NOT NULL AUTO_INCREMENT,
    familia VARCHAR(80) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    ativo TINYINT(1) NOT NULL DEFAULT 1,
    ordem INT NOT NULL DEFAULT 0,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_itens_preventiva_familia_nome (familia, nome)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS checklist_itens (
    checklist_id INT NOT NULL,
    item_id INT NOT NULL,
    status VARCHAR(40) NOT NULL,
    observacao TEXT NULL,
    PRIMARY KEY (checklist_id, item_id),
    KEY idx_checklist_itens_item (item_id),
    CONSTRAINT fk_checklist_itens_checklist FOREIGN KEY (checklist_id) REFERENCES checklists(id) ON DELETE CASCADE,
    CONSTRAINT fk_checklist_itens_item FOREIGN KEY (item_id) REFERENCES itens_preventiva(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS recuperacao_staging (
    id BIGINT NOT NULL AUTO_INCREMENT,
    origem VARCHAR(80) NOT NULL,
    tipo_registro VARCHAR(80) NOT NULL,
    chave_origem VARCHAR(190) NOT NULL,
    motivo VARCHAR(255) NOT NULL,
    payload LONGTEXT NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_recuperacao_staging_origem (origem, tipo_registro, chave_origem)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE checklists ADD COLUMN IF NOT EXISTS inspecao_mensal_id INT NULL;
ALTER TABLE checklists ADD KEY IF NOT EXISTS idx_checklists_inspecao_mensal (inspecao_mensal_id);
DROP PROCEDURE IF EXISTS recuperar_20261006_add_fk_checklists_im;
DELIMITER //
CREATE PROCEDURE recuperar_20261006_add_fk_checklists_im()
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.REFERENTIAL_CONSTRAINTS
        WHERE CONSTRAINT_SCHEMA = DATABASE() AND CONSTRAINT_NAME = 'fk_checklists_inspecao_mensal'
    ) THEN
        ALTER TABLE checklists ADD CONSTRAINT fk_checklists_inspecao_mensal
            FOREIGN KEY (inspecao_mensal_id) REFERENCES inspecoes_mensais(id) ON DELETE RESTRICT;
    END IF;
END//
DELIMITER ;
CALL recuperar_20261006_add_fk_checklists_im();
DROP PROCEDURE recuperar_20261006_add_fk_checklists_im;

-- Corrige a definição ENUM preexistente caso tenha sido criada com bytes de
-- charset incorretos. Os status vazios da carga recém-importada representam
-- o default "Não se aplica" (a tabela estava vazia antes da recuperação).
ALTER TABLE checklists
    MODIFY status_tomadas VARCHAR(40) NOT NULL DEFAULT 'Não se aplica',
    MODIFY status_forros VARCHAR(40) NOT NULL DEFAULT 'Não se aplica',
    MODIFY status_paredes VARCHAR(40) NOT NULL DEFAULT 'Não se aplica',
    MODIFY status_projetor VARCHAR(40) NOT NULL DEFAULT 'Não se aplica',
    MODIFY status_tela VARCHAR(40) NOT NULL DEFAULT 'Não se aplica',
    MODIFY status_lousa VARCHAR(40) NOT NULL DEFAULT 'Não se aplica';

UPDATE checklists SET
    status_tomadas = IF(status_tomadas = '', 'Não se aplica', status_tomadas),
    status_forros = IF(status_forros = '', 'Não se aplica', status_forros),
    status_paredes = IF(status_paredes = '', 'Não se aplica', status_paredes),
    status_projetor = IF(status_projetor = '', 'Não se aplica', status_projetor),
    status_tela = IF(status_tela = '', 'Não se aplica', status_tela),
    status_lousa = IF(status_lousa = '', 'Não se aplica', status_lousa);

ALTER TABLE checklists
    MODIFY status_tomadas ENUM('Ok','Defeito','Não se aplica') NOT NULL DEFAULT 'Não se aplica',
    MODIFY status_forros ENUM('Ok','Defeito','Não se aplica') NOT NULL DEFAULT 'Não se aplica',
    MODIFY status_paredes ENUM('Ok','Defeito','Não se aplica') NOT NULL DEFAULT 'Não se aplica',
    MODIFY status_projetor ENUM('Ok','Defeito','Não se aplica') NOT NULL DEFAULT 'Não se aplica',
    MODIFY status_tela ENUM('Ok','Defeito','Não se aplica') NOT NULL DEFAULT 'Não se aplica',
    MODIFY status_lousa ENUM('Ok','Defeito','Não se aplica') NOT NULL DEFAULT 'Não se aplica';
