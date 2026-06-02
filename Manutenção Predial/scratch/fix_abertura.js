const fs = require('fs');
const path = 'public/views/corretivas.php';
let html = fs.readFileSync(path, 'utf8');

// I need to reconstruct the deleted block!
const deletedBlock = `
                    <div class="modal-input" style="margin-bottom: 15px;">
                        <label for="abrir_ambiente_id" style="font-weight: bold; display: block; margin-bottom: 8px;">Ambiente (Sala / Bloco):</label>
                        <div class="input-wrapper">
                            <select name="ambiente_id" id="abrir_ambiente_id" required style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--corBorda); outline: none; background: var(--corFundo); color: var(--corTxt3);">
                                <option value="" disabled selected>Selecione o ambiente com problema...</option>
                                <?php foreach ($ambientesAtivos as $amb): ?>
                                    <option value="<?php echo $amb->getId(); ?>">
                                        #<?php echo $amb->getId(); ?> - <?php echo htmlspecialchars($amb->getNomeAmbiente()); ?>
                                    </option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                    </div>
`;

// Insert it back exactly where it was: between `<input type="hidden" name="acao" value="abrir">` and `<div class="modal-input" style="margin-bottom: 15px;">` of Nível de Prioridade
html = html.replace(
    /<input type="hidden" name="acao" value="abrir">[\s\n\r]*<div class="modal-input" style="margin-bottom: 15px;">\s*<label for="abrir_prioridade"/,
    `<input type="hidden" name="acao" value="abrir">\n${deletedBlock}\n                    <div class="modal-input" style="margin-bottom: 15px;">\n                        <label for="abrir_prioridade"`
);

fs.writeFileSync(path, html, 'utf8');
console.log('Restored the dropdown block and fixed getNomeAmbiente');
