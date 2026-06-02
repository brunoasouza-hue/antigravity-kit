const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../public/views');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.php'));

let updatedFiles = 0;

for (const file of files) {
    const filePath = path.join(dir, file);
    let code = fs.readFileSync(filePath, 'utf8');
    
    let originalCode = code;

    // Replace Gestor only conditions
    code = code.replace(/if\s*\(\s*\$usuarioNivel\s*===\s*'Gestor'\s*\)/g, "if ($usuarioNivel === 'Gestor' || $usuarioNivel === 'Administrador')");
    code = code.replace(/if\s*\(\s*\$usuarioModel->getNivelAcesso\(\)\s*===\s*'Gestor'\s*\)/g, "if ($usuarioModel->getNivelAcesso() === 'Gestor' || $usuarioModel->getNivelAcesso() === 'Administrador')");

    // Replace Gestor or Executor conditions
    code = code.replace(/if\s*\(\s*\$usuarioNivel\s*===\s*'Gestor'\s*\|\|\s*\$usuarioNivel\s*===\s*'Executor'\s*\)/g, "if ($usuarioNivel === 'Gestor' || $usuarioNivel === 'Administrador' || $usuarioNivel === 'Executor')");
    code = code.replace(/if\s*\(\s*\$usuarioModel->getNivelAcesso\(\)\s*===\s*'Gestor'\s*\|\|\s*\$usuarioModel->getNivelAcesso\(\)\s*===\s*'Executor'\s*\)/g, "if ($usuarioModel->getNivelAcesso() === 'Gestor' || $usuarioModel->getNivelAcesso() === 'Administrador' || $usuarioModel->getNivelAcesso() === 'Executor')");

    if (code !== originalCode) {
        fs.writeFileSync(filePath, code, 'utf8');
        console.log(`Patched ${file}`);
        updatedFiles++;
    }
}

console.log(`Done. Patched ${updatedFiles} files.`);
