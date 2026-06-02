const fs = require('fs');

const rawData = `
20770001 RECEPCAO 1098549 Victor Izaias Arantes
20770002 COORDPEDAG 76287 Silvio Ronei Marchetti
20770003 COORDRELAIND 76287 Silvio Ronei Marchetti
20770004 SECRETARIA 1098549 Victor Izaias Arantes
20770005 SERVIDORPABX 1098549 Victor Izaias Arantes
20770006 ARQUIVOSECR 1098549 Victor Izaias Arantes
20770007 REUNIAO 1101401 Natalia Gomes dos Santos
20770008 DIRETORIA 76139 Cesar Ferraiolo Batista
20770010 BIBLIOTECA 76293 Luciana Flores
20770012 ALMOXARIFADO 1024101 Bruna Regina Bianchini Roveda
20770013 DOCENTES 76749 Antônio Carlos Morettin
20770014 AAPM 76511 Claudemir Aparecido Flores
20770015 ANQUALVIDA 1072990 Adriana Cristina de Jesus Rosa
20770017 REFEITORIO 1000380 Geovane Roberto da Silva
20770018 ALMOXMECANIC 1024101 Bruna Regina Bianchini Roveda
20770019 DEPMECANICA 73107 Flavio Alves da Silva
20770020 DEPSOLDAGEM 1089780 Marcelo Vinicius Oliveira Dionisio
20770021 ORIENPRATPRO 73107 Flavio Alves da Silva
20770022 CASEOCMECAN 1049580 Alexandre Felix de Araujo
20770023 LABHIDRAPNEU 1021959 Wellington Gonçalves Norberto
20770024 LABMETROLOG 77149 Sergio Eduardo Brunassi
20770025 LABINFORMAT 1021529 Bruno Alves de Souza
20770026 LABCAMCNCMEC 1021529 Wellington Gonçalves Norberto
20770027 ESMERILHAMEN 1089780 Marcelo Vinicius Oliveira Dionisio
20770028 OFSOLDAGEM 1089780 Marcelo Vinicius Oliveira Dionisio
20770029 TRATTERMICO 77149 Sergio Eduardo Brunassi
20770030 OFMECEICPES 1064602 Cleiton Cezar Monteiro
20770031 OFTORNEARIA 1021529 Wellington Gonçalves Norberto
20770032 OFFRESAAJUST 1049580 Alexandre Felix de Araujo
20770033 OFMAQCNCMEC 77149 Sergio Eduardo Brunassi
20770034 SALATECMEC 1089780 Marcelo Vinicius Oliveira Dionisio
20770035 SALAAULA 1064602 Cleiton Cezar Monteiro
20770036 SALAAULA 1064602 Cleiton Cezar Monteiro
20770037 SALAAULA 1021529 Bruno Alves de Souza
20770038 SALAAULA 1045838 Angelica Affonso Bassan
20770039 SALADESENHO 1012867 Gustavo Antonio Marchiori
20770040 COORDTECNICA 76511 Claudemir Aparecido Flores
20770042 CASEOCMARCEN 76929 Marcio Donizete Gasparoto
20770043 DEPMOVACAB 1011457 Everton Luiz Cerantula
20770044 DEPFERRAMARC 1045309 Diego Soares de Oliveira
20770045 DEPTINTAS 1000380 Geovane Roberto da Silva
20770047 LABELETRCLP 1067061 Almir Lotito Lima
20770048 LABCOMAQELET 1067061 Almir Lotito Lima
20770049 CABPINTURA 76929 Marcio Donizete Gasparoto
20770050 OFMAQCNCMAD 1011457 Everton Luiz Cerantula
20770051 OFMAQCONVMAD 76750 Marcio Garcia
20770052 OFINSTALELET 1067061 Almir Lotito Lima
20770053 OFTAPECARIA 76929 Marcio Donizete Gasparoto
20770054 OFCOSTURAIND 76929 Marcio Donizete Gasparoto
20770055 SALAAULA 76750 Marcio Garcia
20770056 SALATECCOST 76929 Marcio Donizete Gasparoto
20770057 SALATECMAD 76750 Marcio Garcia
20770058 AUDITFOYER 76511 Claudemir Aparecido Flores
20770059 BXABREMPILH 76511 Claudemir Aparecido Flores
20770060 ALMOXFERRAG 1024101 Bruna Regina Bianchini Roveda
20770061 ABREMPILHA 73107 Flavio Alves da Silva
20770062 DEPJARDINAG 1000380 Geovane Roberto da Silva
20770063 DEPLIMPEZA 1000380 Geovane Roberto da Silva
20770064 ZELADORIA 1000380 Geovane Roberto da Silva
20770065 ABRCOMPRESS 76750 Marcio Garcia
20770066 PORTARIA 1101401 Natalia Gomes dos Santos
20770071 ALMOXMADEIRA 1024101 Bruna Regina Bianchini Roveda
20770073 INFORMATICA 76749 Antônio Carlos Morettin
20770074 PATIO 1072990 Adriana Cristina de Jesus Rosa
20770075 COSTURA 76287 Silvio Ronei Marchetti
20770078 SANITARIOFEM 1000380 Geovane Roberto da Silva
20770079 SANITARIOMAS 1000380 Geovane Roberto da Silva
20770080 SANITARIOFEM 1000380 Geovane Roberto da Silva
20770081 SANITARIOMAS 1000380 Geovane Roberto da Silva
20770086 COZINHA 73107 Flavio Alves da Silva
20770095 PANIFICACAO 73107 Flavio Alves da Silva
20770096 LABTI 1081562 Rafael Marangoni Paixão
20770100 REFRIGERAÇÃO 1067061 Almir Lotito Lima
20770101 CADCAMTI 1068806 Roberto de Souza Ribeiro Moraes Junior
20770102 ARQUIVOPERM 1101401 Natalia Gomes dos Santos
20770103 SLIMPRESSOES 1098549 Victor Izaias Arantes
20770104 LABTIB 1081852 Renan Junior de Almeida Silva
20770105 SESIFERNAND 1081871 Rafael Forti Scalfi
20770106 CONSTCIVIL 1103298 Rogerio Monteiro da Silva
`;

const lines = rawData.trim().split('\n');
const ambientesList = [];

for (const line of lines) {
    if (!line.trim()) continue;
    
    // Formato: 20770001 RECEPCAO 1098549 Victor Izaias Arantes
    // Regex para pegar: (id) (nome_ambiente) (nif) (nome_responsavel)
    const match = line.trim().match(/^(\d+)\s+(\S+)\s+(\d+)\s+(.+)$/);
    if (match) {
        ambientesList.push({
            id: parseInt(match[1]),
            nome_ambiente: match[2],
            responsavel_nif: match[3],
            responsavel_nome: match[4],
            status: 'Ativo'
        });
    } else {
        // Para REFRIGERAÇÃO que pode ter sido pego estranho, ou outros casos
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 4) {
            const id = parseInt(parts[0]);
            const nifIndex = parts.findIndex((p, i) => i > 1 && /^\d+$/.test(p));
            if (nifIndex !== -1) {
                const nome_amb = parts.slice(1, nifIndex).join(' ');
                const nif = parts[nifIndex];
                const resp = parts.slice(nifIndex + 1).join(' ');
                ambientesList.push({
                    id: id,
                    nome_ambiente: nome_amb,
                    responsavel_nif: nif,
                    responsavel_nome: resp,
                    status: 'Ativo'
                });
            }
        }
    }
}

const dbFile = 'mock_database.json';
const db = JSON.parse(fs.readFileSync(dbFile, 'utf8'));

db.ambientes = ambientesList;
fs.writeFileSync(dbFile, JSON.stringify(db, null, 4));
console.log('Updated mock_database.json with ' + ambientesList.length + ' ambientes!');
