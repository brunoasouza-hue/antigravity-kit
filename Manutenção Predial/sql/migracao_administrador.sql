-- Migração aditiva. Executar uma única vez após backup verificado.
ALTER TABLE usuarios MODIFY nivel_acesso ENUM('Solicitante','Gestor','Executor','Administrador') NOT NULL;
CREATE TABLE IF NOT EXISTS auditoria_usuarios (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    ator_id INT NOT NULL,
    usuario_id INT NOT NULL,
    operacao VARCHAR(40) NOT NULL,
    nivel_anterior VARCHAR(30) NULL,
    nivel_novo VARCHAR(30) NULL,
    data_operacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_auditoria_data (data_operacao),
    CONSTRAINT fk_auditoria_ator FOREIGN KEY (ator_id) REFERENCES usuarios(id),
    CONSTRAINT fk_auditoria_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
