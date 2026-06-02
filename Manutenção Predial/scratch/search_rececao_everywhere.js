const fs = require('fs');
const path = require('path');

function searchDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.git' && file !== '.gemini' && file !== 'brain') {
                searchDir(fullPath);
            }
        } else {
            if (file.endsWith('.js') || file.endsWith('.json') || file.endsWith('.php') || file.endsWith('.sql') || file.endsWith('.md')) {
                const content = fs.readFileSync(fullPath, 'utf8');
                if (content.toLowerCase().includes('recpção') || content.toLowerCase().includes('recepção') || content.toLowerCase().includes('rececao')) {
                    console.log(`Found match in: ${fullPath}`);
                    const lines = content.split('\n');
                    lines.forEach((line, idx) => {
                        if (line.toLowerCase().includes('recpção') || line.toLowerCase().includes('recepção') || line.toLowerCase().includes('rececao')) {
                            console.log(`  Line ${idx+1}: ${line.trim()}`);
                        }
                    });
                }
            }
        }
    }
}

searchDir('c:\\Users\\Instrutor\\OneDrive - SESISENAISP - Corporativo\\PESSOAL\\Documents\\ANTIGRAVITY\\Manutenção Predial');
console.log("Search finished.");
