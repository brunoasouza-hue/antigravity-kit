const fs = require('fs');
let code = fs.readFileSync('start_test_server.js', 'utf8');

// The file currently has \$${itemVar} (one backslash)
// I want it to have \\$${itemVar} (two backslashes)
// In a regex replacement string, to write two backslashes, I need FOUR backslashes. 
// Oh wait, string replace without regex doesn't need double escaping for the output if I use a function!

let newCode = code.split('\\$\\${itemVar}').join('\\\\$\\${itemVar}');
newCode = newCode.split('\\$idx').join('\\\\$idx');
newCode = newCode.split('\\$1').join('\\\\$1');
newCode = newCode.split('\\$item').join('\\\\$item');
newCode = newCode.split('\\$percentual').join('\\\\$percentual');

fs.writeFileSync('start_test_server.js', newCode, 'utf8');
console.log("Replaced single backslash with double backslash using split/join!");
