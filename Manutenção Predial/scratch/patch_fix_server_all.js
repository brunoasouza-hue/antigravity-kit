const fs = require('fs');

let serverCode = fs.readFileSync('start_test_server.js', 'utf8');

// 1. Re-apply the fix for session_role (usuario_nivel)
const regexVars = `        { regex: /<\\?php\\s+echo\\s+\\$_SESSION\\['usuario_id'\\]\\s*;?\\s*\\?>/g, val: context.usuarioId },
        { regex: /<\\?php\\s+echo\\s+\\$_SESSION\\["usuario_id"\\]\\s*;?\\s*\\?>/g, val: context.usuarioId },
        { regex: /<\\?php\\s+echo\\s+\\$_SESSION\\['usuario_nivel'\\]\\s*;?\\s*\\?>/g, val: context.usuarioNivel },
        { regex: /<\\?php\\s+echo\\s+\\$_SESSION\\["usuario_nivel"\\]\\s*;?\\s*\\?>/g, val: context.usuarioNivel },`;

serverCode = serverCode.replace(
    /\{\s*regex:\s*\/<\?php\\s\+echo\\s\+\$_SESSION\['usuario_id'\]\\s\*;\\?\\s\*\\\?>\/g,\s*val:\s*context\.usuarioId\s*\},\s*\{\s*regex:\s*\/<\?php\\s\+echo\\s\+\$_SESSION\["usuario_id"\]\\s\*;\\?\\s\*\\\?>\/g,\s*val:\s*context\.usuarioId\s*\}/,
    regexVars
);

// 2. Fix the getExecutorId empty attribute rendering problem
const origRegexHtml = `            itemHtml = itemHtml.replace(new RegExp(\`\\\\$\\\${itemVar}->getStatus\\\\(\\\\)\`, 'g'), \`'\\\${item.status}'\`);
            itemHtml = itemHtml.replace(new RegExp(\`\\\\$\\\${itemVar}->getId\\\\(\\\\)\`, 'g'), item.id);
            itemHtml = itemHtml.replace(new RegExp(\`\\\\$\\\${itemVar}->getExecutorId\\\\(\\\\)\`, 'g'), item.executor_atual_id || 'null');
            itemHtml = itemHtml.replace(new RegExp(\`\\\\$\\\${itemVar}->getSolicitanteId\\\\(\\\\)\`, 'g'), item.solicitante_id || 'null');
            
            itemHtml = itemHtml.replace(new RegExp(\`<\\\\?php\\\\s+echo\\\\s+\\\\$\\\${itemVar}->getId\\\\(\\\\)\\\\s*;?\\\\s*\\\\?>\`, 'g'), item.id);
            itemHtml = itemHtml.replace(new RegExp(\`<\\\\?php\\\\s+echo\\\\s+htmlspecialchars\\\\(\\\\s*\\\\$\\\${itemVar}->getNomeAmbiente\\\\(\\\\)\\\\s*\\\\)\\\\s*;?\\\\s*\\\\?>\`, 'g'), escapeHtml(item.nome_ambiente || ''));`;

const replaceWith = `            itemHtml = itemHtml.replace(new RegExp(\`\\\\$\\\${itemVar}->getStatus\\\\(\\\\)\`, 'g'), \`'\\\${item.status}'\`);
            itemHtml = itemHtml.replace(new RegExp(\`\\\\$\\\${itemVar}->getId\\\\(\\\\)\`, 'g'), item.id);
            itemHtml = itemHtml.replace(new RegExp(\`\\\\$\\\${itemVar}->getExecutorId\\\\(\\\\)\`, 'g'), item.executor_atual_id || 'null');
            itemHtml = itemHtml.replace(new RegExp(\`\\\\$\\\${itemVar}->getSolicitanteId\\\\(\\\\)\`, 'g'), item.solicitante_id || 'null');
            
            itemHtml = itemHtml.replace(new RegExp(\`<\\\\?php\\\\s+echo\\\\s+\\\\$\\\${itemVar}->getId\\\\(\\\\)\\\\s*;?\\\\s*\\\\?>\`, 'g'), item.id);
            itemHtml = itemHtml.replace(new RegExp(\`<\\\\?php\\\\s+echo\\\\s+\\\\$\\\${itemVar}->getExecutorId\\\\(\\\\)\\\\s*;?\\\\s*\\\\?>\`, 'g'), item.executor_atual_id || 'null');
            itemHtml = itemHtml.replace(new RegExp(\`<\\\\?php\\\\s+echo\\\\s+\\\\$\\\${itemVar}->getSolicitanteId\\\\(\\\\)\\\\s*;?\\\\s*\\\\?>\`, 'g'), item.solicitante_id || 'null');
            itemHtml = itemHtml.replace(new RegExp(\`<\\\\?php\\\\s+echo\\\\s+htmlspecialchars\\\\(\\\\s*\\\\$\\\${itemVar}->getNomeAmbiente\\\\(\\\\)\\\\s*\\\\)\\\\s*;?\\\\s*\\\\?>\`, 'g'), escapeHtml(item.nome_ambiente || ''));`;

serverCode = serverCode.replace(origRegexHtml, replaceWith);

fs.writeFileSync('start_test_server.js', serverCode, 'utf8');

console.log('Fixed session role AND getExecutorId rendering!');
