<?php
/**
 * SENAI Manutenção Predial - Arquivo de Configuração Global
 * Define as credenciais do banco de dados, fuso horário, controle de sessão e URLs base.
 */

// =========================================================================
// 1. CONFIGURAÇÕES DE CONEXÃO COM O BANCO DE DADOS (MySQL)
// =========================================================================
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'manutencao_predial');
define('DB_CHARSET', 'utf8mb4');

// =========================================================================
// 2. CONFIGURAÇÕES GERAIS DO SISTEMA
// =========================================================================
define('APP_NAME', 'SENAI - Sistema de Manutenção Predial');
define('BASE_URL', 'http://localhost/manutencao_predial');

// =========================================================================
// 3. SEGURANÇA E GERENCIAMENTO DE SESSÕES
// =========================================================================
// Garante que a sessão esteja ativa em todas as páginas do sistema
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// =========================================================================
// 4. CONFIGURAÇÃO DE LOCALIZAÇÃO (FUSO HORÁRIO)
// =========================================================================
// Configura o fuso horário padrão para São Paulo / Brasil
date_default_timezone_set('America/Sao_Paulo');
