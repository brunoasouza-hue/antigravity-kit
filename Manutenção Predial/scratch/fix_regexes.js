const fs = require('fs');

let content = fs.readFileSync('start_test_server.js', 'utf8');

const regexBad1 = `new RegExp(\`<\\\\?php\\\\s+echo\\\\s+\\\\$h\\\\\\['id'\\]\\\\s*;?\\\\s*\\\\?>\`, 'g')`;
const regexBad2 = `new RegExp(\`<\\\\?php\\\\s+echo\\\\s+date\\\\(\\\\s*['"]d/m/Y['"]\\\\s*,\\\\s*strtotime\\\\(\\\\s*\\\\$h\\\\\\['data_inicio'\\]\\\\s*\\\\)\\\\s*\\\\)\\\\s*;?\\\\s*\\\\?>\`, 'g')`;
const regexBad3 = `new RegExp(\`<\\\\?php\\\\s+echo\\\\s+\\\\$h\\\\\\['data_fim'\\]\\\\s*\\\\?\\\\s*date\\\\(\\\\s*['"]d/m/Y['"]\\\\s*,\\\\s*strtotime\\\\(\\\\s*\\\\$h\\\\\\['data_fim'\\]\\\\s*\\\\)\\\\s*\\\\)\\\\s*:\\s*['"]-['"]\\\\s*;?\\\\s*\\\\?>\`, 'g')`;

// A better way is to replace the whole block
const searchStr = `// Historico
                { regex: new RegExp(\`<\\?php\\s+echo\\s+\\$h\\['id'\\]\\s*;?\\s*\\?>\`, 'g'), val: item.id },`;
// wait, the string in the file actually looks like this:
// { regex: new RegExp(`<\\?php\\s+echo\\s+\\$h\\[\'id\'\\]\\s*;?\\s*\\?>`, 'g'), val: item.id },

content = content.replace(
    /\{ regex: new RegExp\(`<\\\\(\?)php\\\\s\+echo\\\\s\+\\\\\$h\\\\\[\\?['"]id['"]\\\]\\\\s\*;\\?\\\\s\*\\\\(\?)>`, 'g'\), val: item\.id \},/,
    "{ regex: /<\\\\?php\\\\s+echo\\\\s+\\\\$h\\['id'\\]\\\\s*;?\\\\s*\\\\?>/g, val: item.id },"
);

// Actually, let's just do a string replacement on the exact lines:
let lines = content.split('\\n');
for (let i=0; i<lines.length; i++) {
    if (lines[i].includes('// Historico')) {
        lines[i+1] = `                { regex: /<\\\\?php\\\\s+echo\\\\s+\\\\$h\\['id'\\]\\\\s*;?\\\\s*\\\\?>/g, val: item.id },`;
        lines[i+2] = `                { regex: /<\\\\?php\\\\s+echo\\\\s+date\\(\\s*['"]d\\/m\\/Y['"]\\s*,\\s*strtotime\\(\\s*\\$h\\['data_inicio'\\]\\s*\\)\\s*\\)\\s*;?\\s*\\\\?>/g, val: formatDate(item.data_inicio) },`;
        lines[i+3] = `                { regex: /<\\\\?php\\\\s+echo\\\\s+\\\\$h\\['data_fim'\\]\\s*\\?\\s*date\\(\\s*['"]d\\/m\\/Y['"]\\s*,\\s*strtotime\\(\\s*\\$h\\['data_fim'\\]\\s*\\)\\s*\\)\\s*:\\s*['"]-['"]\\s*;?\\s*\\\\?>/g, val: item.data_fim ? formatDate(item.data_fim) : '-' },`;
    }
}
fs.writeFileSync('start_test_server.js', lines.join('\\n'));
console.log('Fixed regex literals in start_test_server.js!');
