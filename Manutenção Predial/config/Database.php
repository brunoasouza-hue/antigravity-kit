<?php
/**
 * SENAI Manutenção Predial - Classe de Conexão com o Banco de Dados (PDO)
 * Implementa o padrão de projeto Singleton para garantir apenas uma conexão ativa.
 */

require_once __DIR__ . '/config.php';

class Database {
    // Armazena a instância única da conexão PDO
    private static ?PDO $instance = null;

    // Construtor privado impede a criação direta de novas instâncias usando "new Database()"
    private function __construct() {}

    // Previne a clonagem do objeto para manter o padrão Singleton íntegro
    private function __clone() {}

    // Previne a desserialização do objeto
    public function __wakeup() {
        throw new Exception("Não é possível desserializar uma instância de Database (Singleton).");
    }

    /**
     * Obtém a instância única da conexão PDO com o MySQL.
     * Caso não exista, cria e configura uma nova.
     * 
     * @return PDO Retorna a conexão PDO configurada
     */
    public static function getConnection(): PDO {
        if (self::$instance === null) {
            try {
                // DSN (Data Source Name) dinâmico baseado nas constantes do config.php
                $dsn = sprintf(
                    "mysql:host=%s;dbname=%s;charset=%s",
                    DB_HOST,
                    DB_NAME,
                    DB_CHARSET
                );

                // Configurações de comportamento e segurança da conexão PDO
                $options = [
                    // Habilita o lançamento de exceções em caso de erros SQL
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    // Define o retorno padrão como array associativo (coluna => valor)
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    // Desabilita emulação de prepared statements para proteção contra SQL Injection
                    PDO::ATTR_EMULATE_PREPARES   => false,
                    // Executa charset correto na inicialização
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES " . DB_CHARSET
                ];

                self::$instance = new PDO($dsn, DB_USER, DB_PASS, $options);
            } catch (PDOException $e) {
                // Em produção, registra o log detalhado no servidor e esconde informações sensíveis do usuário final
                error_log("Erro de Conexão com o Banco: " . $e->getMessage() . " (Código: " . $e->getCode() . ")");
                
                // Retorna uma mensagem amigável sem expor dados de ambiente
                die("<div style='font-family: sans-serif; padding: 20px; border: 1px solid #ff2b2b; background-color: #fff5f5; color: #cc0000; border-radius: 8px; max-width: 600px; margin: 40px auto;'>
                        <h3 style='margin-top:0;'>Erro de Conexão</h3>
                        <p>Incapaz de estabelecer conexão segura com o banco de dados. Por favor, verifique as configurações no arquivo <strong>config/config.php</strong> e certifique-se de que o servidor MySQL está ativo.</p>
                     </div>");
            }
        }

        return self::$instance;
    }
}
