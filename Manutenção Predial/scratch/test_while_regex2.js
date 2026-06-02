const fs = require('fs');
let html = fs.readFileSync('public/views/preventivas.php', 'utf8');

function compileConditionals(html) {
    let previousHtml;
    do {
        previousHtml = html;
        
        const ifElseRegex = /<\?php\s+if\s*\(([^?]+?)\)\s*:\s*\?>((?:(?!<\?php\s+if)[\s\S])*?)<\?php\s+else\s*:\s*\?>((?:(?!<\?php\s+if)[\s\S])*?)<\?php\s+endif\s*;\s*\?>/gs;
        html = html.replace(ifElseRegex, (match, condStr, ifBody, elseBody) => {
            console.log("RESOLVING IF-ELSE:", condStr);
            if (condStr.includes('empty($historicoInspecoes)')) return "[[ROWS]]";
            return "[[ELSE_BODY]]";
        });

        const ifRegex = /<\?php\s+if\s*\(([^?]+?)\)\s*:\s*\?>((?:(?!<\?php\s+if)[\s\S])*?)<\?php\s+endif\s*;\s*\?>/gs;
        html = html.replace(ifRegex, (match, condStr, body) => {
            console.log("RESOLVING IF:", condStr);
            return "[[IF_BODY]]";
        });
        
    } while (html !== previousHtml);

    return html;
}

const compiled = compileConditionals(html);
const tbodyStart = compiled.indexOf('<tbody id="tabela-historico">');
if (tbodyStart !== -1) {
    console.log(compiled.substring(tbodyStart, compiled.indexOf('</tbody>', tbodyStart) + 8));
} else {
    console.log("Not found.");
}
