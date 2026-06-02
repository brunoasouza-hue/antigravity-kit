const fs = require('fs');

let code = fs.readFileSync('public/views/corretivas.php', 'utf8');

const filterHtml = `
            <div style="margin-bottom: 20px; display: flex; gap: 10px; flex-wrap: wrap;" id="os-filters">
                <button class="os-filter-btn active" data-filter="todas" style="background: #333; color: white; border: none; padding: 8px 16px; border-radius: 20px; font-weight: bold; cursor: pointer; transition: 0.2s;">Todas as O.S.</button>
                <button class="os-filter-btn" data-filter="minhas" style="background: #f0f0f0; color: #555; border: 1px solid #ccc; padding: 8px 16px; border-radius: 20px; font-weight: bold; cursor: pointer; transition: 0.2s;">Abertas por mim</button>
                <button class="os-filter-btn" data-filter="executar" style="background: #f0f0f0; color: #555; border: 1px solid #ccc; padding: 8px 16px; border-radius: 20px; font-weight: bold; cursor: pointer; transition: 0.2s;">Para eu executar</button>
            </div>
`;

code = code.replace(
    /<div class="table-responsive"/,
    filterHtml + '\n                <div class="table-responsive"'
);

const filterScript = `
                    } else {
                        // Change icon depending on action
                        if (currentUserRole === 'Executor') btnAprovar.innerHTML = '<i class="bi bi-hammer"></i>';
                        if (currentUserRole === 'Solicitante') btnAprovar.innerHTML = '<i class="bi bi-check-all"></i>';
                    }
                }
            });

            // Filter Logic
            const filterBtns = document.querySelectorAll('.os-filter-btn');
            filterBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    // Update Active Style
                    filterBtns.forEach(b => {
                        b.style.background = '#f0f0f0';
                        b.style.color = '#555';
                        b.style.border = '1px solid #ccc';
                        b.classList.remove('active');
                    });
                    this.style.background = '#333';
                    this.style.color = 'white';
                    this.style.border = 'none';
                    this.classList.add('active');

                    const filterType = this.getAttribute('data-filter');
                    
                    rows.forEach(row => {
                        const executorId = row.getAttribute('data-executor-id');
                        const solicitanteId = row.getAttribute('data-solicitante-id');
                        
                        if (filterType === 'todas') {
                            row.style.display = '';
                        } else if (filterType === 'minhas') {
                            row.style.display = (solicitanteId == currentUserId) ? '' : 'none';
                        } else if (filterType === 'executar') {
                            row.style.display = (executorId == currentUserId) ? '' : 'none';
                        }
                    });
                });
`;

code = code.replace(
    /                    } else {\s*\/\/ Change icon depending on action\s*if \(currentUserRole === 'Executor'\) btnAprovar.innerHTML = '<i class="bi bi-hammer"><\/i>';\s*if \(currentUserRole === 'Solicitante'\) btnAprovar.innerHTML = '<i class="bi bi-check-all"><\/i>';\s*}\s*}\s*}\);\s*\/\/ 4\. Hide/s,
    filterScript + '\n            // 4. Hide'
);

fs.writeFileSync('public/views/corretivas.php', code, 'utf8');
console.log('corretivas.php filter pills added!');
