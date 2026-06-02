const fs = require('fs');

const famData = {
    "Salas de Aulas": [
        "Ventiladores (Fixação e Oscilação)",
        "Lâmpadas e Interruptores",
        "Tomadas (Espelhos e Tensão Elétrica)",
        "Carteiras e Mesa do Professor",
        "Lousa / Quadro Branco",
        "Portas e Janelas (Molas, Dobradiças e Fechaduras)",
        "Pintura das Paredes e Pisos"
    ],
    "Laboratórios": [
        "Ar-Condicionado (Filtros e Bandeja de dreno)",
        "Quadro de Distribuição (QDC) e Disjuntor DR",
        "Aterramento das Bancadas",
        "Cabeamento de TI e Nobreaks",
        "Lâmpadas (Luminosidade sobre as bancadas)",
        "Bancadas Técnicas (Nivelamento e Fixação)",
        "Portas (Molas, Dobradiças e Fechaduras)",
        "Pintura das Paredes e Pisos"
    ],
    "Oficinas": [
        "Quadros de Força Industriais (Bornes e Termografia)",
        "Eletrodutos (Fixação e Integridade)",
        "Aterramento de Máquinas e Equipamentos",
        "Tomadas Industriais e de Uso Geral",
        "Linha de Ar Comprimido e Purgadores",
        "Pias, Tanques e Mangueiras Industriais",
        "Refletores e Calhas de Iluminação",
        "Exaustores",
        "Ventiladores",
        "Sinalização de Segurança no Piso",
        "Portas (Trilhos de Enrolar/Correr, Molas, Dobradiças e Fechaduras)",
        "Pintura das Paredes e Pisos"
    ],
    "Administrativos": [
        "Ar-Condicionado (Filtros e Dreno)",
        "Lâmpadas e Calhas",
        "Tomadas e Réguas de Energia",
        "Sifões e Torneiras (Copas e Banheiros Internos)",
        "Armários e Gaveteiros (Dobradiças e Puxadores)",
        "Portas (Molas Aéreas, Dobradiças e Fechaduras)",
        "Pintura das Paredes e Pisos"
    ],
    "Externos": [
        "Válvulas de Descarga, Mictórios e Assentos Sanitários",
        "Pias e Torneiras",
        "Papeleiras, Saboneteiras e Dispensers",
        "Bebedouros (Elemento Filtrante e Refrigeração)",
        "Calhas, Rufos e Telhas",
        "Luzes de Emergência",
        "Postes, Refletores e Fotocélulas",
        "Piso (Calçamentos, Pátios e Passarelas)",
        "Pintura das Paredes e Pisos"
    ],
    "Geral": [
        "Tomadas",
        "Iluminação",
        "Paredes"
    ]
};

let dbStr = fs.readFileSync('mock_database.json', 'utf8');
let db = JSON.parse(dbStr);

db.itens_checklist = famData;

fs.writeFileSync('mock_database.json', JSON.stringify(db, null, 4));
console.log('mock_database.json updated with new checklist items.');

// Update start_test_server.js injected HTML script if needed.
// start_test_server.js injects db.itens_checklist, so if we restart the server, it will pick up the new database!
