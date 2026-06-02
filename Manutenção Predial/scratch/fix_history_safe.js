const fs = require('fs');

let content = fs.readFileSync('start_test_server.js', 'utf8');

const regexesOld = `// Ranking
                { regex: new RegExp(\`<\\\\?php\\\\s+echo\\\\s+\\\\$idx\\\\s*\\\\+\\\\s*1\\\\s*;?\\\\s*\\\\?>\`, 'g'), val: idx + 1 },`;
const regexesNew = `// Historico
                { regex: /<\\\\?php\\\\s+echo\\\\s+\\\\$h\\['id'\\]\\\\s*;?\\\\s*\\\\?>/g, val: item.id },
                { regex: /<\\\\?php\\\\s+echo\\\\s+date\\(\\s*['"]d\\/m\\/Y['"]\\s*,\\s*strtotime\\(\\s*\\$h\\['data_inicio'\\]\\s*\\)\\s*\\)\\s*;?\\s*\\\\?>/g, val: formatDate(item.data_inicio) },
                { regex: /<\\\\?php\\\\s+echo\\\\s+\\\\$h\\['data_fim'\\]\\s*\\?\\s*date\\(\\s*['"]d\\/m\\/Y['"]\\s*,\\s*strtotime\\(\\s*\\$h\\['data_fim'\\]\\s*\\)\\s*\\)\\s*:\\s*['"]-['"]\\s*;?\\s*\\\\?>/g, val: item.data_fim ? formatDate(item.data_fim) : '-' },

                // Ranking
                { regex: new RegExp(\`<\\\\?php\\\\s+echo\\\\s+\\\\$idx\\\\s*\\\\+\\\\s*1\\\\s*;?\\\\s*\\\\?>\`, 'g'), val: idx + 1 },`;

if (content.includes(regexesOld) && !content.includes(`{ regex: /<\\\\?php\\\\s+echo\\\\s+\\\\$h\\['id'\\]\\\\s*;?\\\\s*\\\\?>/g, val: item.id },`)) {
    content = content.replace(regexesOld, regexesNew);
}

// Pass dbContext to compileConditionals
const ccOld = `html = compileConditionals(html, session);`;
const ccNew = `html = compileConditionals(html, session, { historicoInspecoes: dbContext.historicoInspecoes });`;
if (content.includes(ccOld)) {
    content = content.replace(/html = compileConditionals\(html, session\);/g, ccNew);
}

// Pass it in evaluatePhpCondition
const epOld = `.replace(/\\$erro/g, 'localContext.erro')`;
const epNew = `.replace(/\\$erro/g, 'localContext.erro')
        .replace(/\\$historicoInspecoes/g, 'localContext.historicoInspecoes')`;
if (content.includes(epOld)) {
    content = content.replace(epOld, epNew);
}

// Add dbInspecoes to dbContext
const dcOld = `const dbContext = {
        ambientes: filteredAmbientes,
        currentChecklists,
        currentOS,
        executores,
        rankingAmbientes,
        maxOS,
        pesquisa,
        dashboard_analise
    };`;
const dcNew = `
    const historico = dbInspecoes.filter(i => i.status === 'Finalizada').sort((a,b) => b.id - a.id);
    const dbContext = {
        ambientes: filteredAmbientes,
        currentChecklists,
        currentOS,
        executores,
        rankingAmbientes,
        maxOS,
        pesquisa,
        dashboard_analise,
        historicoInspecoes: historico
    };`;
if (content.includes(dcOld)) {
    content = content.replace(dcOld, dcNew);
}

fs.writeFileSync('start_test_server.js', content);
console.log('Safe history fix applied!');
