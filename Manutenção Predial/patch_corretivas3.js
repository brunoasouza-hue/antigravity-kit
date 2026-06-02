const fs = require('fs');
let file = fs.readFileSync('public/views/corretivas.php', 'utf8');

const regexActionJS = /<button class="btn-visualizar" type="button" title="Abrir O\.S\." onclick="visualizarOS\(\$\{data\.id\}\)".*?<\/button>/s;
const replActionJS = `\${'<?php echo $usuarioNivel; ?>' === 'Gestor' ? \`
                    <div style="display: flex; gap: 5px; justify-content: center; align-items: center;">
                        <button class="btn-visualizar" type="button" title="Visualizar Detalhes" onclick="visualizarOS(\${data.id})" style="background-color: #00C5FF; border: none; color: white; padding: 5px; border-radius: 4px; width: 32px; height: 32px; cursor: pointer; display: flex; justify-content: center; align-items: center;"><i class="bi bi-eye-fill"></i></button>
                        <button class="btn-aprovar" type="button" title="Aprovar/Finalizar" onclick="visualizarOS(\${data.id})" style="background-color: #00E676; border: none; color: white; padding: 5px; border-radius: 4px; width: 32px; height: 32px; cursor: pointer; display: flex; justify-content: center; align-items: center;"><i class="bi bi-check-lg"></i></button>
                        <button class="btn-excluir" type="button" title="Excluir/Cancelar" onclick="alert('Funcionalidade de cancelamento a ser implementada.');" style="background-color: #FF1744; border: none; color: white; padding: 5px; border-radius: 4px; width: 32px; height: 32px; cursor: pointer; display: flex; justify-content: center; align-items: center;"><i class="bi bi-trash-fill"></i></button>
                    </div>
                    \` : \`
                    <button class="btn-visualizar" type="button" title="Abrir O.S." onclick="visualizarOS(\${data.id})" style="background-color: #f1f3f5; border: 1px solid #dee2e6; color: var(--corTxt2); padding: 8px 16px; border-radius: 8px; font-weight: bold; font-size: 13px; cursor: pointer; transition: 0.2s;">
                        Abrir <i class="bi bi-arrow-right-short" style="vertical-align: middle; font-size: 1.2em;"></i>
                    </button>
                    \`}`;

if (regexActionJS.test(file)) {
    file = file.replace(regexActionJS, replActionJS);
    console.log('Replaced action JS');
} else {
    console.error('Action JS NOT FOUND');
}

fs.writeFileSync('public/views/corretivas.php', file);
