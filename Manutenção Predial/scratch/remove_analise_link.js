const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, '..', 'public', 'views');
const files = fs.readdirSync(viewsDir).filter(f => f.endsWith('.php') && f !== 'dashboard_analise.php');

// Pattern: the full <a> tag block for dashboard_analise (single or double quotes, with the 2-3 lines)
const patterns = [
    // Multi-line block: \n + indent + <a href=...dashboard_analise...> + newline + icon text + newline + </a> + newline
    /\n[ \t]*<a href="\.\/dashboard_analise\.php"[^>]*>\s*<i[^>]*><\/i>[^\n]*Anál[^\n]*\n[ \t]*<\/a>/g,
    /\n[ \t]*<a href="\.\/dashboard_analise\.php"[^>]*>[^\n]*\n[ \t]*<i[^>]*><\/i>[^\n]*\n[ \t]*<\/a>/g,
    // Inline variant
    /\n[ \t]*<a href="\.\/dashboard_analise\.php"[^>]*>[^<]*<i[^>]*><\/i>[^\n]*<\/a>/g,
    // Fallback: any line containing dashboard_analise (just comment it)
];

let totalRemoved = 0;
files.forEach(file => {
    const filePath = path.join(viewsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    const before = content.length;

    // Strategy: remove the exact 3-line block OR inline block
    // Use a broad regex that captures the full anchor tag
    content = content.replace(
        /[ \t]*<a href="\.\/dashboard_analise\.php"[^>]*>[\s\S]*?<\/a>\r?\n/g,
        ''
    );

    if (content.length !== before) {
        fs.writeFileSync(filePath, content);
        totalRemoved++;
        console.log(`✅ Removed from: ${file}`);
    } else {
        console.log(`⚠️  No match found in: ${file}`);
    }
});

console.log(`\nDone. Cleaned ${totalRemoved} files.`);
