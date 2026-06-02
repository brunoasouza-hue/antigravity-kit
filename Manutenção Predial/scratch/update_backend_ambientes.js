const fs = require('fs');

// 1. Update Ambiente.php
let phpModel = fs.readFileSync('src/Models/Ambiente.php', 'utf8');

if (!phpModel.includes('private string $familia')) {
    phpModel = phpModel.replace('private string $status;', "private string $status;\n    private string $familia;");
    phpModel = phpModel.replace("string $status = 'Ativo',", "string $status = 'Ativo',\n        string $familia = 'Geral',");
    phpModel = phpModel.replace('$this->status = $status;', "$this->status = $status;\n        $this->familia = $familia;");
    
    const getters = `
    public function getFamilia(): string {
        return $this->familia;
    }
    
    public function setFamilia(string $familia): self {
        $this->familia = $familia;
        return $this;
    }
`;
    phpModel = phpModel.replace('public function getNomeAmbiente(): string {', getters + '\n    public function getNomeAmbiente(): string {');
    
    // update self instantiations
    phpModel = phpModel.replace(/\$row\['nome_ambiente'\],\s*\n\s*\$row\['status'\],\s*\n\s*\(int\)\$row\['id'\]/g, "$row['nome_ambiente'],\n                  $row['status'],\n                  $row['familia'] ?? 'Geral',\n                  (int)$row['id']");

    fs.writeFileSync('src/Models/Ambiente.php', phpModel);
}

// 2. Update start_test_server.js
let serverJs = fs.readFileSync('start_test_server.js', 'utf8');

// Replace rowsHtml building in ambientes.php page load
const oldRowsHtmlBadge = `const safeNameJs = (amb.nome_ambiente || '').replace(/'/g, "\\\\'").replace(/"/g, '&quot;');
                      const tog        = isAtivo ? 'inativar' : 'ativar';
                      const tip        = isAtivo ? 'Inativar' : 'Ativar';`;

const newRowsHtmlBadge = `const safeNameJs = (amb.nome_ambiente || '').replace(/'/g, "\\\\'").replace(/"/g, '&quot;');
                      const familia    = amb.familia || 'Geral';
                      const tog        = isAtivo ? 'inativar' : 'ativar';
                      const tip        = isAtivo ? 'Inativar' : 'Ativar';`;

if (serverJs.includes(oldRowsHtmlBadge)) {
    serverJs = serverJs.replace(oldRowsHtmlBadge, newRowsHtmlBadge);
}

const oldRowBtn = `onclick="abrirModalEdicao(\${amb.id},'\${safeNameJs}','\${amb.status}')"`;
const newRowBtn = `onclick="abrirModalEdicao(\${amb.id},'\${safeNameJs}','\${amb.status}','\${familia}')"`;

if (serverJs.includes(oldRowBtn)) {
    serverJs = serverJs.replace(oldRowBtn, newRowBtn);
}

const oldTrHtml = `<td style="display:table-cell;padding:13px 20px;text-align:center;vertical-align:middle;white-space:nowrap;">\${badge}</td>`;
const newTrHtml = `<td style="display:table-cell;padding:13px 20px;text-align:center;vertical-align:middle;white-space:nowrap;">\${familia}</td>
                                          <td style="display:table-cell;padding:13px 20px;text-align:center;vertical-align:middle;white-space:nowrap;">\${badge}</td>`;

if (serverJs.includes(oldTrHtml) && !serverJs.includes('\${familia}</td>')) {
    serverJs = serverJs.replace(oldTrHtml, newTrHtml);
}

// Update acao === 'cadastrar'
const oldCadastrar = `const nome = (postParams.nome_ambiente || '').trim();
                    const status = postParams.status || 'Ativo';`;
const newCadastrar = `const nome = (postParams.nome_ambiente || '').trim();
                    const status = postParams.status || 'Ativo';
                    const familia = postParams.familia || 'Geral';`;

if (serverJs.includes(oldCadastrar)) {
    serverJs = serverJs.replace(oldCadastrar, newCadastrar);
}

const oldNewAmb = `const newAmb = {
                        id: id,
                        nome_ambiente: nome,
                        status: status
                    };`;
const newNewAmb = `const newAmb = {
                        id: id,
                        nome_ambiente: nome,
                        status: status,
                        familia: familia
                    };`;

if (serverJs.includes(oldNewAmb)) {
    serverJs = serverJs.replace(oldNewAmb, newNewAmb);
}

// Update acao === 'editar'
const oldEditar = `db.ambientes[idx].nome_ambiente = nome;
                    db.ambientes[idx].status = status;`;
const newEditar = `db.ambientes[idx].nome_ambiente = nome;
                    db.ambientes[idx].status = status;
                    if(postParams.familia) db.ambientes[idx].familia = postParams.familia;`;

if (serverJs.includes(oldEditar)) {
    serverJs = serverJs.replace(oldEditar, newEditar);
}

fs.writeFileSync('start_test_server.js', serverJs);
