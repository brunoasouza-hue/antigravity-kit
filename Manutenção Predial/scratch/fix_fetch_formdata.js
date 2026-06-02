const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../public/views');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.php'));

let updatedFiles = 0;

for (const file of files) {
    const filePath = path.join(dir, file);
    let code = fs.readFileSync(filePath, 'utf8');
    let originalCode = code;

    // Replace FormData instantiation
    code = code.replace(/const formData = new FormData\(form\);/g, "const formData = new URLSearchParams(new FormData(form));");

    // Replace Headers
    code = code.replace(/headers:\s*\{\s*'X-Requested-With':\s*'XMLHttpRequest'\s*\}/g, "headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest' }");

    if (code !== originalCode) {
        fs.writeFileSync(filePath, code, 'utf8');
        console.log(`Patched ${file}`);
        updatedFiles++;
    }
}

console.log(`Done. Patched ${updatedFiles} files.`);
