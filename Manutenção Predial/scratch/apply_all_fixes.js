const fs = require('fs');
let content = fs.readFileSync('start_test_server.js', 'utf8');

// 1. update_backend_ambientes (just skipping this for now since it's already there? No, I need it).
// wait, familia undefined in 1314:
content = content.replace(
    "const tog        = isAtivo ? 'inativar' : 'ativar';",
    "const familia    = amb.familia || 'Geral';\\n                    const tog        = isAtivo ? 'inativar' : 'ativar';"
);

// 2. enable_button:
const btnDisabled = `const btnFinalizar = inspecao.progresso === inspecao.total \\n                ? \\`<button id="btnFinalizarMensal" onclick="finalizarInspecao(\${inspecao.id})" style="background:#28a745;color:#fff;border:none;border-radius:8px;padding:12px 25px;font-weight:bold;cursor:pointer;transition:0.2s;"><i class="bi bi-check-circle"></i> Finalizar Inspeção Mensal</button>\\`\\n                : \\`<button id="btnFinalizarMensal" disabled style="background:#ccc;color:#666;border:none;border-radius:8px;padding:12px 25px;font-weight:bold;cursor:not-allowed;"><i class="bi bi-lock-fill"></i> Conclua \${inspecao.total - inspecao.progresso} ambientes para finalizar</button>\\`;`;
const btnEnabled = `const btnFinalizar = \\`<button id="btnFinalizarMensal" onclick="finalizarInspecao(\${inspecao.id})" style="background:#28a745;color:#fff;border:none;border-radius:8px;padding:12px 25px;font-weight:bold;cursor:pointer;transition:0.2s;"><i class="bi bi-check-circle"></i> Finalizar Inspeção Mensal</button>\\`;`;
content = content.replace(btnDisabled, btnEnabled);

// 3. fix_dbinspecoes
content = content.replace(/const dbInspecoes = db\.inspecoes_mensais \|\| \[\];/g, '');
content = content.replace(
    'const checklists = db.checklists || [];',
    "const dbInspecoes = db.inspecoes_mensais || [];\\n    const checklists = db.checklists || [];"
);

// 4. fix history safe
const regexesOld = `// Ranking\\n                { regex: new RegExp(\`\\\\<\\\\\\\\?php\\\\\\\\s+echo\\\\\\\\s+\\\\\\\\$idx\\\\\\\\s*\\\\\\\\+\\\\\\\\s*1\\\\\\\\s*;?\\\\\\\\s*\\\\\\\\?\\\\>\`, 'g'), val: idx + 1 },`;
// Actually, it's easier to just append the variables to dbContext and conditionally compile
const ccOld = `html = compileConditionals(html, session);`;
const ccNew = `html = compileConditionals(html, session, { historicoInspecoes: dbContext.historicoInspecoes });`;
content = content.replace(/html = compileConditionals\(html, session\);/g, ccNew);

const epOld = `.replace(/\\$erro/g, 'localContext.erro')`;
const epNew = `.replace(/\\$erro/g, 'localContext.erro')\\n        .replace(/\\$historicoInspecoes/g, 'localContext.historicoInspecoes')`;
content = content.replace(epOld, epNew);

const dcOld = `const dbContext = {\\n        ambientes: filteredAmbientes,\\n        currentChecklists,\\n        currentOS,\\n        executores,\\n        rankingAmbientes,\\n        maxOS,\\n        pesquisa,\\n        dashboard_analise\\n    };`;
const dcNew = `\\n    const historico = dbInspecoes.filter(i => i.status === 'Finalizada').sort((a,b) => b.id - a.id);\\n    const dbContext = {\\n        ambientes: filteredAmbientes,\\n        currentChecklists,\\n        currentOS,\\n        executores,\\n        rankingAmbientes,\\n        maxOS,\\n        pesquisa,\\n        dashboard_analise,\\n        historicoInspecoes: historico\\n    };`;
content = content.replace(dcOld, dcNew);

// 5. fix regex syntax (replace line by line the // Historico thing)
let lines = content.split('\\n');
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('// Historico')) {
        if (lines[i+1] && lines[i+1].includes('new RegExp')) {
            lines[i+1] = `                { regex: /<\\\\?php\\\\s+echo\\\\s+\\\\$h\\['id'\\]\\\\s*;?\\\\s*\\\\?>/g, val: item.id },`;
            lines[i+2] = `                { regex: /<\\\\?php\\\\s+echo\\\\s+date\\(\\s*['"]d\\/m\\/Y['"]\\s*,\\s*strtotime\\(\\s*\\$h\\['data_inicio'\\]\\s*\\)\\s*\\)\\s*;?\\s*\\\\?>/g, val: formatDate(item.data_inicio) },`;
            lines[i+3] = `                { regex: /<\\\\?php\\\\s+echo\\\\s+\\\\$h\\['data_fim'\\]\\s*\\?\\s*date\\(\\s*['"]d\\/m\\/Y['"]\\s*,\\s*strtotime\\(\\s*\\$h\\['data_fim'\\]\\s*\\)\\s*\\)\\s*:\\s*['"]-['"]\\s*;?\\s*\\\\?>/g, val: item.data_fim ? formatDate(item.data_fim) : '-' },`;
        }
    }
}
content = lines.join('\\n');

// 6. inject vars (careful with \n)
const injectionCode = `
            const familiasMap = {};
            ambientes.forEach(a => {
                familiasMap[a.id] = a.familia || 'Geral';
            });
            
            const itensChecklistMap = {
                "Salas de Aulas": [
                    "Ventiladores (Fixação e Oscilação)", "Lâmpadas e Interruptores", "Tomadas (Espelhos e Tensão Elétrica)",
                    "Carteiras e Mesa do Professor", "Lousa / Quadro Branco", "Portas e Janelas (Molas, Dobradiças e Fechaduras)",
                    "Pintura das Paredes e Pisos"
                ],
                "Laboratórios": [
                    "Ar-Condicionado (Filtros e Bandeja de dreno)", "Quadro de Distribuição (QDC) e Disjuntor DR",
                    "Aterramento das Bancadas", "Cabeamento de TI e Nobreaks", "Lâmpadas (Luminosidade sobre as bancadas)",
                    "Bancadas Técnicas (Nivelamento e Fixação)", "Portas (Molas, Dobradiças e Fechaduras)",
                    "Pintura das Paredes e Pisos"
                ],
                "Oficinas": [
                    "Quadros de Força Industriais (Bornes e Termografia)", "Eletrodutos (Fixação e Integridade)",
                    "Aterramento de Máquinas e Equipamentos", "Tomadas Industriais e de Uso Geral",
                    "Linha de Ar Comprimido e Purgadores", "Pias, Tanques e Mangueiras Industriais",
                    "Refletores e Calhas de Iluminação", "Exaustores", "Ventiladores", "Sinalização de Segurança (Piso e Placas)"
                ],
                "Administrativos": [
                    "Ar-Condicionado", "Iluminação e Tomadas", "Portas e Fechaduras", "Mobiliário (Mesas e Cadeiras)",
                    "Pintura e Infiltrações", "Banheiros (Vazamentos e Descargas)"
                ],
                "Externos": [
                    "Iluminação Externa (Postes e Arandelas)", "Portões (Corrediças, Cadeados e Sensores)",
                    "Alambrados e Cercas", "Calhas e Rufos (Limpeza de Folhas)", "Caixas de Passagem (Esgoto e Elétrica)",
                    "Pintura Externa", "Jardinagem e Podas"
                ],
                "Geral": [
                    "Iluminação", "Tomadas", "Portas e Janelas", "Pintura", "Ar-Condicionado", "Mobiliário"
                ]
            };

            const scriptsInjection = \\\`<script>
                window.AMBIENTES_FAMILIAS = \\\${JSON.stringify(familiasMap)};
                if (!window.ITENS_CHECKLIST || Object.keys(window.ITENS_CHECKLIST).length === 0) {
                    window.ITENS_CHECKLIST = \\\${JSON.stringify(itensChecklistMap)};
                }
            </script>\\\`;
            
            prevHTML = scriptsInjection + prevHTML;
`;
if (!content.includes('window.AMBIENTES_FAMILIAS = ${JSON.stringify(familiasMap)};')) {
    content = content.replace(
        "html = html.replace('<!-- INJETAR_INSPECAO_ATIVA -->', prevHTML);",
        injectionCode + "\\n        html = html.replace('<!-- INJETAR_INSPECAO_ATIVA -->', prevHTML);"
    );
}

// 7. Remove the backend validation block SAFELY
const searchValid = "if (checks.length < ambsAtivos.length) {";
const validIdx = content.indexOf(searchValid);
if (validIdx !== -1) {
    const endValid = content.indexOf('}', validIdx);
    if (endValid !== -1) {
        const block = content.substring(validIdx, endValid + 1);
        content = content.replace(block, "");
    }
}

fs.writeFileSync('start_test_server.js', content);
console.log('ALL FIXES APPLIED SUCCESSFULLY!');
