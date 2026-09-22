import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const dbPath = path.resolve(__dirname, '../../database.sqlite');
const sqlite = new (sqlite3.verbose()).Database(dbPath);

export const db = {
  run(sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> {
    return new Promise((resolve, reject) => {
      sqlite.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  },
  get<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      sqlite.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row as T);
      });
    });
  },
  all<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      sqlite.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows as T[]);
      });
    });
  },
  exec(sql: string): Promise<void> {
    return new Promise((resolve, reject) => {
      sqlite.exec(sql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
};

export async function initDatabase() {
  sqlite.serialize(async () => {
    // Criar Tabela de Usuários
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        senha TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'brigadista',
        cargo TEXT,
        ativo INTEGER NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Criar Tabela de Equipamentos
    await db.exec(`
      CREATE TABLE IF NOT EXISTS equipamentos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        codigo TEXT NOT NULL UNIQUE,
        tipo TEXT NOT NULL,
        subtipo TEXT,
        capacidade TEXT,
        setor TEXT NOT NULL,
        localizacao_detalhada TEXT,
        validade_carga DATE,
        validade_teste_hidro DATE,
        pressao_status TEXT DEFAULT 'OK',
        lacre_status TEXT DEFAULT 'OK',
        sinalizacao_status TEXT DEFAULT 'OK',
        desobstruido INTEGER DEFAULT 1,
        status_geral TEXT DEFAULT 'APROVADO',
        qr_code_data TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Criar Tabela de Vistorias
    await db.exec(`
      CREATE TABLE IF NOT EXISTS vistorias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        equipamento_id INTEGER NOT NULL,
        usuario_id INTEGER NOT NULL,
        data_vistoria DATETIME DEFAULT CURRENT_TIMESTAMP,
        status_result TEXT NOT NULL,
        pressao_ok INTEGER DEFAULT 1,
        lacre_ok INTEGER DEFAULT 1,
        sinalizacao_ok INTEGER DEFAULT 1,
        desobstruido_ok INTEGER DEFAULT 1,
        validade_ok INTEGER DEFAULT 1,
        observacoes TEXT,
        foto_url TEXT,
        FOREIGN KEY (equipamento_id) REFERENCES equipamentos (id) ON DELETE CASCADE,
        FOREIGN KEY (usuario_id) REFERENCES users (id) ON DELETE CASCADE
      );
    `);

    // Seed Admin Bruno Souza
    const checkAdmin = await db.get('SELECT * FROM users WHERE email = ?', ['bruno.souza@sp.senai.br']);
    if (!checkAdmin) {
      const hashedSenha = bcrypt.hashSync('senai123', 10);
      await db.run(
        `INSERT INTO users (nome, email, senha, role, cargo) VALUES (?, ?, ?, 'admin', 'Coordenador de Segurança')`,
        ['Bruno Souza', 'bruno.souza@sp.senai.br', hashedSenha]
      );
      console.log('✅ Usuário admin criado: bruno.souza@sp.senai.br');
    }

    // Seed Brigadista Rafael Marangoni Paixao
    const checkRafael = await db.get('SELECT * FROM users WHERE email = ?', ['rafael.paixao@sp.senai.br']);
    if (!checkRafael) {
      const hashedSenha = bcrypt.hashSync('senai123', 10);
      await db.run(
        `INSERT INTO users (nome, email, senha, role, cargo) VALUES (?, ?, ?, 'brigadista', 'Inspetor da Brigada')`,
        ['Rafael Marangoni Paixao', 'rafael.paixao@sp.senai.br', hashedSenha]
      );
    }

    // Seed Brigadista Carlos Silva
    const checkBrigadista = await db.get('SELECT * FROM users WHERE email = ?', ['brigadista@sp.senai.br']);
    if (!checkBrigadista) {
      const hashedSenha = bcrypt.hashSync('senai123', 10);
      await db.run(
        `INSERT INTO users (nome, email, senha, role, cargo) VALUES (?, ?, ?, 'brigadista', 'Inspetor de Segurança')`,
        ['Carlos Silva', 'brigadista@sp.senai.br', hashedSenha]
      );
    }

    // Carregar itens reais da planilha Relatorio_Inspecao_2026-09-22.xlsx (102 itens)
    const seedJsonPath = path.resolve(__dirname, '../../all_seed_items.json');
    if (fs.existsSync(seedJsonPath)) {
      const seedItems = JSON.parse(fs.readFileSync(seedJsonPath, 'utf8'));

      // Se a tabela tiver menos de 50 itens, recarregar os 102 itens reais
      const equipCountRow = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM equipamentos');
      if (!equipCountRow || equipCountRow.count < 50) {
        await db.exec('DELETE FROM equipamentos');

        for (const item of seedItems) {
          await db.run(`
            INSERT INTO equipamentos (
              codigo, tipo, subtipo, capacidade, setor, localizacao_detalhada,
              validade_carga, validade_teste_hidro, pressao_status, lacre_status,
              sinalizacao_status, desobstruido, status_geral, qr_code_data
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            item.codigo,
            item.tipo,
            item.subtipo,
            item.capacidade,
            item.setor,
            item.localizacao_detalhada,
            item.validade_carga,
            item.validade_teste_hidro,
            item.pressao_status,
            item.lacre_status,
            item.sinalizacao_status,
            item.desobstruido,
            item.status_geral,
            item.qr_code_data
          ]);
        }
        console.log(`✅ ${seedItems.length} equipamentos da planilha oficial cadastrados no banco de dados!`);
      }
    }
  });
}

export default db;
