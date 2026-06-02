const fs = require('fs');

let php = fs.readFileSync('public/views/preventivas.php', 'utf8');

const regex = /function abrirModalChecklistRapido\(inspecaoId, ambId, ambNome\) \{[\s\S]*?\}\s*function finalizarInspecao/s;

const replacement = `function abrirModalChecklistRapido(inspecaoId, ambId, ambNome) {
            inspecaoAtualId = inspecaoId;
            abrirModalChecklist(ambId);
            
            // Se for um select visível, forçamos o valor e desabilitamos para o usuário não trocar
            let inpHiddenAmb = document.getElementById('ambiente_id');
            if(inpHiddenAmb && inpHiddenAmb.tagName === 'SELECT') {
                inpHiddenAmb.style.pointerEvents = 'none';
                inpHiddenAmb.style.opacity = '0.7';
            }
        }

        function finalizarInspecao`;

if (regex.test(php)) {
    php = php.replace(regex, replacement);
    fs.writeFileSync('public/views/preventivas.php', php);
    console.log('abrirModalChecklistRapido updated successfully!');
} else {
    console.log('Regex did not match. Trying alternative...');
    const regex2 = /function abrirModalChecklistRapido[\s\S]*?document\.getElementById\('modalNovoChecklist'\)\.style\.display = 'flex';\s*\}/s;
    if (regex2.test(php)) {
        php = php.replace(regex2, `function abrirModalChecklistRapido(inspecaoId, ambId, ambNome) {
            inspecaoAtualId = inspecaoId;
            abrirModalChecklist(ambId);
            
            let inpHiddenAmb = document.getElementById('ambiente_id');
            if(inpHiddenAmb && inpHiddenAmb.tagName === 'SELECT') {
                inpHiddenAmb.style.pointerEvents = 'none';
                inpHiddenAmb.style.opacity = '0.7';
            }
        }`);
        fs.writeFileSync('public/views/preventivas.php', php);
        console.log('Alternative replacement succeeded.');
    } else {
        console.log('Failed to update abrirModalChecklistRapido');
    }
}
