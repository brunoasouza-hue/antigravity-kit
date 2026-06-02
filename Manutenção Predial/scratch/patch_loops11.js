const fs = require('fs');
let code = fs.readFileSync('start_test_server.js', 'utf8');

const blockStart = "const getterMatches = [";
const blockEnd = "];";
const startIdx = code.indexOf(blockStart);
const endIdx = code.indexOf(blockEnd, startIdx);

if (startIdx !== -1 && endIdx !== -1) {
    let block = code.substring(startIdx, endIdx);
    
    // We want to replace \$${itemVar} with \\$${itemVar}
    // We can do this by splitting on the exact sequence '\\$' and joining with '\\\\$'
    // This turns a single backslash + dollar into double backslash + dollar.
    block = block.split('\\$').join('\\\\$');

    code = code.substring(0, startIdx) + block + code.substring(endIdx);
    fs.writeFileSync('start_test_server.js', code, 'utf8');
    console.log("Fixed backslashes with split join!");
} else {
    console.log("Block not found.");
}
