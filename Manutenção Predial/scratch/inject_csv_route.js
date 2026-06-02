const fs = require('fs');

let content = fs.readFileSync('start_test_server.js', 'utf8');

const injectStr = `    // Intercepta exportação de Excel (CSV)
    if (queryParams.action === 'exportar_excel') {
        const db = getDatabase();
        const inicio = queryParams.data_inicio || '2000-01-01';
        const fim = queryParams.data_fim || '2100-01-01';
        
        let csv = "\\uFEFFID Checklist;Ambiente;Data Inspecao;Tecnico Responsavel;Status da Inspecao Mensal\\n";
        
        const checklists = db.checklists || [];
        const inspecoes = db.inspecoes_mensais || [];
        const ambientes = db.ambientes || [];
        const usuarios = db.usuarios || [];
        
        checklists.forEach(c => {
            if (c.data_inspecao >= inicio && c.data_inspecao <= fim) {
                const amb = ambientes.find(a => a.id === c.ambiente_id);
                const nome_amb = amb ? amb.nome_ambiente : 'Desconhecido';
                
                const usr = usuarios.find(u => u.id === c.responsavel_id);
                const nome_usr = usr ? usr.nome : 'Desconhecido';
                
                const insp = inspecoes.find(i => i.id === c.inspecao_mensal_id);
                const status_insp = insp ? insp.status : 'Desconhecido';
                
                const dataSplit = c.data_inspecao.split('-');
                const dataBr = dataSplit.length === 3 ? \`\${dataSplit[2]}/\${dataSplit[1]}/\${dataSplit[0]}\` : c.data_inspecao;
                
                csv += \`\${c.id};\${nome_amb};\${dataBr};\${nome_usr};\${status_insp}\\n\`;
            }
        });
        
        res.writeHead(200, {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': 'attachment; filename="relatorio_preventivas.csv"'
        });
        res.end(csv);
        return;
    }

    // 1. Roteamento de Recursos Estáticos`;

content = content.replace('    // 1. Roteamento de Recursos Estǭticos', injectStr).replace('    // 1. Roteamento de Recursos Estáticos', injectStr);

fs.writeFileSync('start_test_server.js', content);
console.log("Injected CSV handler!");
