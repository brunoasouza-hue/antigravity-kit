const fs = require('fs');

let content = fs.readFileSync('start_test_server.js', 'utf8');

const startIdx = content.indexOf('function compileConditionals(html, session, localContext = {}) {');
const endIdx = content.indexOf('function compileLoops(html, session, dbContext) {');

if (startIdx !== -1 && endIdx !== -1) {
    const newStr = `function compileConditionals(html, session, localContext = {}) {
    // Resolve if/else/endif
    const ifElseRegex = /<\\?php\\s+if\\s*\\((.*?)\\)\\s*:\\s*\\?>([\\s\\S]*?)<\\?php\\s+else\\s*:\\s*\\?>([\\s\\S]*?)<\\?php\\s+endif\\s*;\\s*\\?>/gs;
    html = html.replace(ifElseRegex, (match, condStr, ifBody, elseBody) => {
        if (ifBody.includes('<?php if') || elseBody.includes('<?php if')) return match;
        const isTrue = evaluatePhpCondition(condStr, session, localContext);
        return isTrue ? ifBody : elseBody;
    });

    // Resolve if/endif
    const ifRegex = /<\\?php\\s+if\\s*\\((.*?)\\)\\s*:\\s*\\?>([\\s\\S]*?)<\\?php\\s+endif\\s*;\\s*\\?>/gs;
    html = html.replace(ifRegex, (match, condStr, body) => {
        if (body.includes('<?php if')) return match;
        const isTrue = evaluatePhpCondition(condStr, session, localContext);
        return isTrue ? body : '';
    });

    return html;
}

  `;
    const oldBlock = content.substring(startIdx, endIdx);
    content = content.replace(oldBlock, newStr);
    fs.writeFileSync('start_test_server.js', content);
    console.log("Successfully replaced compileConditionals by index!");
} else {
    console.log("Could not find start/end.");
}
