const fs = require('fs');

let content = fs.readFileSync('start_test_server.js', 'utf8');

const target = `function compileConditionals(html, session, localContext = {}) {
    console.log("EVAL COND:", condStr, "->", js);
      const fn = new Function('session', 'localContext', \\\`return (\\\${js});\\\`);`;
// wait, I changed it using inject_log_all.js

content = content.replace(
/function compileConditionals\(html, session, localContext = \{\}\) \{[\s\S]*?return html;\n  \}/g,
`function compileConditionals(html, session, localContext = {}) {
    const ifElseRegex = /<\\?php\\s+if\\s*\\((.*?)\\)\\s*:\\s*\\?>([\\s\\S]*?)<\\?php\\s+else\\s*:\\s*\\?>([\\s\\S]*?)<\\?php\\s+endif\\s*;\\s*\\?>/gs;
    html = html.replace(ifElseRegex, (match, condStr, ifBody, elseBody) => {
        if (ifBody.includes('<?php if') || elseBody.includes('<?php if')) return match;
        const isTrue = evaluatePhpCondition(condStr, session, localContext);
        return isTrue ? ifBody : elseBody;
    });

    const ifRegex = /<\\?php\\s+if\\s*\\((.*?)\\)\\s*:\\s*\\?>([\\s\\S]*?)<\\?php\\s+endif\\s*;\\s*\\?>/gs;
    html = html.replace(ifRegex, (match, condStr, body) => {
        if (body.includes('<?php if')) return match;
        const isTrue = evaluatePhpCondition(condStr, session, localContext);
        return isTrue ? body : '';
    });
    return html;
  }`
);

fs.writeFileSync('start_test_server.js', content);
console.log("Replaced compileConditionals!");
