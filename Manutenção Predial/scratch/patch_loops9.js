const fs = require('fs');
let code = fs.readFileSync('start_test_server.js', 'utf8');

// Replace all \$\${itemVar} with \\$${itemVar} within the getterMatches block
const blockStart = "const getterMatches = [";
const blockEnd = "];";
const startIdx = code.indexOf(blockStart);
const endIdx = code.indexOf(blockEnd, startIdx);

if (startIdx !== -1 && endIdx !== -1) {
    let block = code.substring(startIdx, endIdx);
    
    // Also replace \$idx and \$item
    block = block.replace(/\\\$\\\${itemVar}/g, '\\\\$${itemVar}');
    block = block.replace(/\\\$idx/g, '\\\\$idx');
    block = block.replace(/\\\$1/g, '\\\\$1');
    block = block.replace(/\\\$item/g, '\\\\$item');
    block = block.replace(/\\\$percentual/g, '\\\\$percentual');

    code = code.substring(0, startIdx) + block + code.substring(endIdx);
    fs.writeFileSync('start_test_server.js', code, 'utf8');
    console.log("Restored backslashes correctly!");
} else {
    console.log("Block not found.");
}
