const fs = require('fs');

let content = fs.readFileSync('start_test_server.js', 'utf8');

const injectionCode = `
            const familiasMap = {};
            ambientes.forEach(a => {
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

            const scriptsInjection = \`<script>
                window.AMBIENTES_FAMILIAS = \${JSON.stringify(familiasMap)};
                if (!window.ITENS_CHECKLIST || Object.keys(window.ITENS_CHECKLIST).length === 0) {
                    window.ITENS_CHECKLIST = \${JSON.stringify(itensChecklistMap)};
                }
            </script>\`;
            
            prevHTML = scriptsInjection + prevHTML;
`;

if (!content.includes('window.AMBIENTES_FAMILIAS = ${JSON.stringify(familiasMap)};')) {
    content = content.replace(
        "html = html.replace('<!-- INJETAR_INSPECAO_ATIVA -->', prevHTML);",
        injectionCode + "\\n        html = html.replace('<!-- INJETAR_INSPECAO_ATIVA -->', prevHTML);"
    );
    fs.writeFileSync('start_test_server.js', content);
    console.log('Injected scripts properly!');
}
