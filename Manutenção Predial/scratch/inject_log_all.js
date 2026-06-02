const fs = require('fs');
let content = fs.readFileSync('start_test_server.js', 'utf8');

const target = `const fn = new Function('session', 'localContext', \\\`return (\\\${js});\\\`);`;
const newCode = `console.log("EVAL COND:", condStr, "->", js);
      const fn = new Function('session', 'localContext', \\\`return (\\\${js});\\\`);`;

content = content.replace(target, newCode);
fs.writeFileSync('start_test_server.js', content);
