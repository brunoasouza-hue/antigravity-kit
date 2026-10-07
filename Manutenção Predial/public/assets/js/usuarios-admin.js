(() => {
    'use strict';
    const modal = document.getElementById('modalResetSenha');
    if (!modal) return;
    let origem;
    const cancelar = document.getElementById('cancelar-reset-senha');
    const fechar = () => { modal.style.display = 'none'; if (origem) origem.focus(); };
    document.querySelectorAll('.btn-reset-senha').forEach(button => {
        button.addEventListener('click', () => {
            origem = button;
            document.getElementById('reset-usuario-id').value = button.dataset.id;
            document.getElementById('reset-usuario-nome').textContent = button.dataset.nome;
            modal.style.display = 'flex';
            cancelar.focus();
        });
    });
    cancelar.addEventListener('click', fechar);
    modal.addEventListener('click', event => { if (event.target === modal) fechar(); });
    modal.addEventListener('keydown', event => { if (event.key === 'Escape') fechar(); });
})();
