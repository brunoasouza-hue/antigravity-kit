const fs = require('fs');
const html = fs.readFileSync('public/views/corretivas.php', 'utf8');

const regex2 = /<\?php\s+if\s*\(empty\(\$ordensServico\)\)/gs;
let match2 = regex2.exec(html);
if (match2) {
    console.log("FOUND empty block at index", match2.index);
    let snippet = html.substring(match2.index, match2.index + 500);
    console.log("Snippet:\\n", snippet);
} else {
    console.log("Not found empty block!");
}
