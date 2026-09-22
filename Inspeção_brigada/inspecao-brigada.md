# Plano de Desenvolvimento: Sistema de Inspeção da Brigada de Emergência

## Overview
Desenvolvimento de uma aplicação web Fullstack completa para gerenciamento e inspeção periódica de itens de combate a incêndio e emergência (Extintores, Hidrantes, Saídas de Emergência, Iluminação, Alarmes). O sistema contará com autenticação JWT, controle de acesso (Admin vs Brigadista/Inspetor), gestão de usuários, leitura/geração de QR Code, dashboard estatístico, histórico de vistorias e relatórios exportáveis em PDF/Excel.

## Project Type
**FULLSTACK WEB APP** (Backend Node.js/TypeScript + Frontend React/TypeScript + Tailwind CSS)

## Success Criteria
1. Autenticação completa com login administrativo por padrão (`bruno.souza@sp.senai.br` / `senai123`).
2. Módulo de Gestão de Usuários para Administrador (Listar, Cadastrar, Excluir e Alterar Privilégios: Admin / Brigadista / Inspetor).
3. Cadastro e gestão de itens com códigos padronizados (Extintores, Hidrantes, Saídas de Emergência).
4. Leitor interativo de QR Code para identificação e inspeção rápida via câmera do celular/desktop.
5. Formulários de vistoria com verificação de lacre, pressão, validade, desobstrução e observações.
6. Dashboard dinâmico com métricas de conformidade e alertas de vencimento (30, 60, 90 dias).
7. Exportação em lote de etiquetas QR Code em PDF e relatórios de auditoria em PDF e Excel.

## Tech Stack
- **Backend:** Node.js, Express, TypeScript, SQLite3 (via better-sqlite3 ou sqlite3), JWT, Bcrypt, QRCode, PDFKit, ExcelJS.
- **Frontend:** React, Vite, TypeScript, Lucide React (ícones), Tailwind CSS, Chart.js/Recharts, html5-qrcode, Axios, React Router DOM.
- **Dev Tools:** Concurrently / Nodemon para execução sincronizada do ambiente dev.

## File Structure
```
Inspeção_brigada/
├── backend/
│   ├── src/
│   │   ├── config/          # Configurações de BD e JWT
│   │   ├── controllers/     # AuthController, UserController, EquipamentoController, VistoriaController, DashboardController, ReportController
│   │   ├── middleware/      # AuthMiddleware, RoleMiddleware
│   │   ├── models/          # Schema / Interfaces do Banco de Dados
│   │   ├── routes/          # Rotas REST API
│   │   ├── utils/           # Gerador de PDF, Excel e QR Code
│   │   └── server.ts        # Ponto de entrada da API Node.js
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── assets/          # Logos e estilos globais
│   │   ├── components/      # Navbar, Sidebar, QRCodeScanner, Modal, Cards
│   │   ├── pages/           # Login, Dashboard, Equipamentos, Usuarios, NovaVistoria, HistoricoVistorias, Relatorios, QRCodes
│   │   ├── services/        # Cliente API Axios
│   │   ├── context/         # AuthContext (Estado global do usuário)
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── index.html
└── inspecao-brigada.md
```

## Task Breakdown

### Fase 1: Backend Foundation, Auth & User Management (Priority P0)
- **Task 1.1:** Inicializar projeto Node.js TypeScript no backend, instalar dependências (`express`, `cors`, `sqlite3`, `jsonwebtoken`, `bcryptjs`, `qrcode`, `pdfkit`, `exceljs`).
  - **Agent:** `backend-specialist` | **Skill:** `nodejs-best-practices`
  - **INPUT:** Diretório `backend/` limpo
  - **OUTPUT:** `package.json`, `tsconfig.json` e servidor express funcional em TypeScript
  - **VERIFY:** `npm run dev` no backend respondendo `HTTP 200` em `http://localhost:3001/api/health`

- **Task 1.2:** Modelagem do banco de dados (Tabelas: Users, Equipamentos, Vistorias, Setores).
  - **Agent:** `database-architect` | **Skill:** `database-design`
  - **INPUT:** Requisitos de extintores, hidrantes e saídas de emergência
  - **OUTPUT:** Migrações / Banco SQLite inicializado com seeds iniciais (admin: `bruno.souza@sp.senai.br` / `senai123`)
  - **VERIFY:** Consulta no BD confirmando usuário admin e dados iniciais criados

- **Task 1.3:** Controladores e rotas de Autenticação & Gestão de Usuários (`/api/users`).
  - **Agent:** `backend-specialist` | **Skill:** `api-patterns`
  - **INPUT:** Middleware JWT e rotas `/api/auth`, `/api/users` (Listar, Criar, Deletar, Atualizar Privilégios)
  - **OUTPUT:** CRUD de usuários protegido por permissão de Admin
  - **VERIFY:** Testes de criação, listagem e alteração de privilégios via API

- **Task 1.4:** Controladores e rotas de Equipamentos, Vistorias, Dashboard Stats, QR Code e Relatórios PDF/Excel.
  - **Agent:** `backend-specialist` | **Skill:** `api-patterns`
  - **INPUT:** Lógica de negócio de inspeção e métricas
  - **OUTPUT:** Rotas `/api/equipamentos`, `/api/vistorias`, `/api/dashboard`, `/api/reports/pdf`, `/api/reports/excel`, `/api/qrcode/generate`
  - **VERIFY:** Geração de relatórios PDF/Excel e endpoints de vistoria respondendo com dados válidos

### Fase 2: Frontend UI & User Experience (Priority P1)
- **Task 2.1:** Scaffold da aplicação React Vite + TypeScript + Tailwind CSS no `frontend/`.
  - **Agent:** `frontend-specialist` | **Skill:** `frontend-design`
  - **INPUT:** Estrutura `frontend/`
  - **OUTPUT:** App Vite com roteamento React Router, temas de cores industriais de segurança
  - **VERIFY:** `npm run dev` rodando sem erros em `http://localhost:5173`

- **Task 2.2:** Tela de Login e Integração com AuthContext.
  - **Agent:** `frontend-specialist` | **Skill:** `react-best-practices`
  - **INPUT:** Endpoint `/api/auth/login`
  - **OUTPUT:** Interface de login moderna com pré-preenchimento ou validação amigável
  - **VERIFY:** Autenticação real com token JWT salvo no localStorage e redirecionamento para o Dashboard

- **Task 2.3:** Dashboard Executivo de Inspeção da Brigada.
  - **Agent:** `frontend-specialist` | **Skill:** `frontend-design`
  - **INPUT:** Endpoint `/api/dashboard`
  - **OUTPUT:** Cards de KPIs, Gráficos de Status por Tipo de Equipamento e por Setor
  - **VERIFY:** Gráficos e estatísticas carregando dinamicamente do backend

- **Task 2.4:** Módulo de Gestão de Usuários (Exclusivo Admin).
  - **Agent:** `frontend-specialist` | **Skill:** `frontend-design`
  - **INPUT:** Endpoint `/api/users`
  - **OUTPUT:** Tela de controle de usuários para listar, cadastrar novos usuários, alterar papel (Admin/Brigadista) e remover acessos.
  - **VERIFY:** Admin criando novo usuário e alterando cargo com atualização em tempo real

- **Task 2.5:** Módulo de Gestão de Equipamentos (Extintores, Hidrantes, Saídas).
  - **Agent:** `frontend-specialist` | **Skill:** `frontend-design`
  - **INPUT:** Endpoint `/api/equipamentos`
  - **OUTPUT:** Tabela com busca, filtros por tipo (Extintores, Hidrantes, Saídas), cadastro/edição de novos itens e geração de QR Code individual/lote
  - **VERIFY:** Ações CRUD refletindo no banco de dados com notificações visuais

- **Task 2.6:** Módulo de Vistoria / Leitor de QR Code.
  - **Agent:** `frontend-specialist` | **Skill:** `frontend-design`
  - **INPUT:** Câmera / Leitor de código html5-qrcode
  - **OUTPUT:** Tela de nova vistoria com leitor de QR Code da câmera ou digitação rápida de código do equipamento, formulário de checklist com opções rápidas de Aprovado/Reprovado e observações
  - **VERIFY:** Realizar uma vistoria completa via QR Code e verificar gravação no banco

- **Task 2.7:** Módulo de Relatórios e Histórico de Vistorias.
  - **Agent:** `frontend-specialist` | **Skill:** `frontend-design`
  - **INPUT:** Endpoints de histórico e geração de arquivos PDF/Excel
  - **OUTPUT:** Tela de histórico com filtros por data/brigadista/setor e botões de exportação para PDF e Excel
  - **VERIFY:** Download de relatórios PDF e Excel funcionando perfeitamente

### Fase 3: Script de Execução Única e Polimento (Priority P2)
- **Task 3.1:** Configurar `package.json` raiz para rodar Backend e Frontend simultaneamente com um único comando `npm run dev`.
  - **Agent:** `devops-engineer` | **Skill:** `clean-code`
  - **INPUT:** Projetos `backend` e `frontend`
  - **OUTPUT:** Script unificado na raiz do workspace
  - **VERIFY:** Rodar `npm run dev` na raiz e acessar sistema completo

## Phase X: Verification Plan
- [ ] Executar build de produção sem erros (`npm run build` no backend e frontend).
- [ ] Teste de login com credenciais `bruno.souza@sp.senai.br` / `senai123`.
- [ ] Teste de gestão de usuários pelo admin (cadastro, alteração de papel, exclusão).
- [ ] Teste de cadastro de novos Extintores, Hidrantes e Saídas de Emergência.
- [ ] Teste de geração e leitura de QR Code.
- [ ] Teste de checklist e gravação de vistoria.
- [ ] Teste de exportação de relatórios em PDF e Excel.
