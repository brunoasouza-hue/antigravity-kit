const fs = require('fs');

const db = JSON.parse(fs.readFileSync('mock_database.json', 'utf8'));

const inspecaoAtiva = db.inspecoes_mensais.find(i => i.status === 'Em Andamento');

if (!inspecaoAtiva) {
    console.log("Nenhuma inspeção em andamento.");
    process.exit(0);
}

const familiasMap = {};
db.ambientes.forEach(a => {
    familiasMap[a.id] = a.familia || 'Geral';
});

const itensChecklistMap = {
    "Salas de Aulas": [
        "Ventiladores (Fixação e Oscilação)", "Lâmpadas e Interruptores", "Tomadas (Espelhos e Tensão Elétrica)",
        "Carteiras e Mesa do Professor", "Lousa / Quadro Branco", "Portas e Janelas (Molas, Dobradiças e Fechaduras)",
        "Pintura das Paredes e Pisos"
    ],
    "Laboratórios": [
        "Ar-Condicionado (Filtros e Bandeja de dreno)", "Quadro de Distribuição (QDC) e Disjuntor DR",
        "Aterramento das Bancadas", "Cabeamento de TI e Nobreaks", "Lâmpadas (Luminosidade sobre as bancadas)",
        "Bancadas Técnicas (Nivelamento e Fixação)", "Portas (Molas, Dobradiças e Fechaduras)",
        "Pintura das Paredes e Pisos"
    ],
    "Oficinas": [
        "Quadros de Força Industriais (Bornes e Termografia)", "Eletrodutos (Fixação e Integridade)",
        "Aterramento de Máquinas e Equipamentos", "Tomadas Industriais e de Uso Geral",
        "Linha de Ar Comprimido e Purgadores", "Pias, Tanques e Mangueiras Industriais",
        "Refletores e Calhas de Iluminação", "Exaustores", "Ventiladores", "Sinalização de Segurança (Piso e Placas)"
    ],
    "Administrativos": [
        "Ar-Condicionado", "Iluminação e Tomadas", "Portas e Fechaduras", "Mobiliário (Mesas e Cadeiras)",
        "Pintura e Infiltrações", "Banheiros (Vazamentos e Descargas)"
    ],
    "Externos": [
        "Iluminação Externa (Postes e Arandelas)", "Portões (Corrediças, Cadeados e Sensores)",
        "Alambrados e Cercas", "Calhas e Rufos (Limpeza de Folhas)", "Caixas de Passagem (Esgoto e Elétrica)",
        "Pintura Externa", "Jardinagem e Podas"
    ],
    "Geral": [
        "Iluminação", "Tomadas", "Portas e Janelas", "Pintura", "Ar-Condicionado", "Mobiliário"
    ]
};

const ambsAtivos = db.ambientes.filter(a => a.status === 'Ativo');
let added = 0;

ambsAtivos.forEach(amb => {
    const existing = db.checklists.find(c => c.inspecao_mensal_id === inspecaoAtiva.id && c.ambiente_id === amb.id);
    if (!existing) {
        const familia = amb.familia || 'Geral';
        const itens = itensChecklistMap[familia] || itensChecklistMap['Geral'];
        const itensObj = {};
        itens.forEach(item => {
            itensObj[item] = 'ok';
        });

        db.checklists.push({
            id: db.checklists.length > 0 ? Math.max(...db.checklists.map(c => c.id)) + 1 : 1,
            inspecao_mensal_id: inspecaoAtiva.id,
            ambiente_id: amb.id,
            ambiente_nome: amb.nome_ambiente,
            responsavel_id: 1,
            responsavel_nome: "Sistema Automático",
            data_inspecao: new Date().toISOString(),
            itens: itensObj,
            observacoes: "Preenchimento automático"
        });
        added++;
    }
});

fs.writeFileSync('mock_database.json', JSON.stringify(db, null, 4));
console.log(`Preenchidos ${added} ambientes pendentes com sucesso!`);
