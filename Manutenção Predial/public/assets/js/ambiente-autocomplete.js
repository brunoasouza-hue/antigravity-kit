/* Enhances the existing PHP select; its name and submitted IDs stay unchanged. */
(() => {
    'use strict';
    const select = document.getElementById('abrir_ambiente_id');
    if (!select || select.dataset.pesquisavel === 'true') return;
    select.dataset.pesquisavel = 'true';
    const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
    const items = Array.from(select.options).filter(option => option.value !== '').map(option => ({
        value: option.value, label: option.textContent.trim(),
        search: normalize(option.value + ' ' + option.textContent.trim())
    }));
    const wrapper = document.createElement('div');
    wrapper.className = 'ambiente-pesquisa';
    const icon = document.createElement('i');
    icon.className = 'bi bi-search';
    icon.setAttribute('aria-hidden', 'true');
    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'abrir_ambiente_pesquisa';
    input.className = 'ambiente-pesquisa__campo';
    input.placeholder = 'Pesquisar ambiente...';
    input.autocomplete = 'off';
    input.required = select.required;
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-expanded', 'false');
    input.setAttribute('aria-controls', 'abrir_ambiente_resultados');
    const list = document.createElement('div');
    list.id = 'abrir_ambiente_resultados';
    list.className = 'ambiente-pesquisa__lista';
    list.setAttribute('role', 'listbox');
    list.setAttribute('aria-label', 'Ambientes disponíveis');
    list.hidden = true;
    wrapper.append(icon, input);
    select.insertAdjacentElement('afterend', wrapper);
    document.body.append(list);
    const label = document.querySelector('label[for="abrir_ambiente_id"]');
    if (label) label.htmlFor = input.id;
    select.hidden = true;
    select.required = false;
    let matches = [];
    let active = -1;
    const close = () => {
        list.hidden = true;
        input.setAttribute('aria-expanded', 'false');
        input.removeAttribute('aria-activedescendant');
        active = -1;
    };
    const position = () => {
        if (list.hidden) return;
        const rect = input.getBoundingClientRect();
        const below = window.innerHeight - rect.bottom - 12;
        const above = rect.top - 12;
        const upward = below < 160 && above > below;
        const height = Math.max(0, Math.min(300, upward ? above : below));
        list.style.left = Math.max(8, rect.left) + 'px';
        list.style.width = Math.min(rect.width, window.innerWidth - 16) + 'px';
        list.style.maxHeight = height + 'px';
        list.style.top = upward ? 'auto' : (rect.bottom + 4) + 'px';
        list.style.bottom = upward ? (window.innerHeight - rect.top + 4) + 'px' : 'auto';
    };
    const highlight = index => {
        active = index;
        const options = list.querySelectorAll('[role="option"]');
        options.forEach((option, i) => option.classList.toggle('is-active', i === active));
        if (options[active]) {
            input.setAttribute('aria-activedescendant', options[active].id);
            options[active].scrollIntoView({ block: 'nearest' });
        }
    };
    const choose = item => {
        select.value = item.value;
        input.value = item.label;
        input.setCustomValidity('');
        select.dispatchEvent(new Event('change', { bubbles: true }));
        close();
        input.focus();
        // focus may open the list; keep a completed selection closed.
        close();
    };
    const render = (query = input.value) => {
        matches = items.filter(item => item.search.includes(normalize(query.trim())));
        list.replaceChildren();
        active = -1;
        input.removeAttribute('aria-activedescendant');
        matches.forEach((item, index) => {
            const option = document.createElement('button');
            option.type = 'button';
            option.tabIndex = -1;
            option.id = 'abrir_ambiente_opcao_' + index;
            option.className = 'ambiente-pesquisa__opcao';
            option.setAttribute('role', 'option');
            option.setAttribute('aria-selected', String(item.value === select.value));
            option.textContent = item.label;
            option.addEventListener('mousedown', event => event.preventDefault());
            option.addEventListener('click', () => choose(item));
            list.append(option);
        });
        if (!matches.length) {
            const empty = document.createElement('p');
            empty.className = 'ambiente-pesquisa__vazio';
            empty.setAttribute('role', 'status');
            empty.textContent = 'Nenhum ambiente encontrado';
            list.append(empty);
        }
        list.hidden = false;
        input.setAttribute('aria-expanded', 'true');
        position();
    };
    input.addEventListener('focus', () => render(select.value ? '' : input.value));
    input.addEventListener('click', () => { if (list.hidden) render(select.value ? '' : input.value); });
    input.addEventListener('input', () => {
        select.value = '';
        input.setCustomValidity('Selecione um ambiente da lista.');
        render();
    });
    input.addEventListener('keydown', event => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            if (list.hidden) render(select.value ? '' : input.value);
            if (matches.length) highlight(active < 0 ? (event.key === 'ArrowDown' ? 0 : matches.length - 1)
                : (active + (event.key === 'ArrowDown' ? 1 : -1) + matches.length) % matches.length);
        } else if (event.key === 'Enter' && !list.hidden) {
            event.preventDefault();
            if (matches[active]) choose(matches[active]);
        } else if (event.key === 'Escape' && !list.hidden) {
            event.preventDefault(); event.stopPropagation(); close();
        } else if (event.key === 'Tab') close();
    });
    input.addEventListener('blur', close);
    document.addEventListener('click', event => {
        if (!wrapper.contains(event.target) && !list.contains(event.target)) close();
    });
    window.addEventListener('resize', position);
    document.addEventListener('scroll', position, true);
    select.form.addEventListener('reset', () => {
        input.value = '';
        input.setCustomValidity('');
        close();
    });
    const modal = document.getElementById('modalAbertura');
    if (modal) new MutationObserver(() => {
        if (modal.style.display === 'none') close();
    }).observe(modal, { attributes: true, attributeFilter: ['style'] });
    const selected = items.find(item => item.value === select.value);
    if (selected) input.value = selected.label;
})();
