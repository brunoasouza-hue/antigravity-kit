const fs = require('fs');
let html = fs.readFileSync('public/views/corretivas.php', 'utf8');

const replacement = "onclick='abrirModalTramitacao(<?php echo json_encode([\"id\" => $os->getId(), \"ambiente\" => $os->getAmbienteNome(), \"data_abertura\" => date(\"d/m/Y H:i\", strtotime($os->getDataAbertura() ?? \"\")), \"status\" => $status, \"descricao\" => $os->getDescricaoProblema(), \"relato_servico\" => $os->getRelatoServico()]); ?>)'";

html = html.replace(/onclick="abrirModalValidacao\([^)]+\)"/g, replacement);
html = html.replace(/onclick="abrirModalDespacho\([^)]+\)"/g, replacement);
html = html.replace(/onclick="abrirModalFinalizacao\([^)]+\)"/g, replacement);
html = html.replace(/onclick="visualizarOS\([^)]+\)"/g, replacement);

fs.writeFileSync('public/views/corretivas.php', html);
console.log('Onclicks Atualizados!');
