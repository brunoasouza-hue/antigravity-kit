const fs = require('fs');

let content = fs.readFileSync('start_test_server.js', 'utf8');

const target = "const fn = new Function('session', 'localContext', `return (${js});`);";
const repl = `const fn = new Function('session', 'localContext', \`return (\${js});\`);
          if (js.includes('historicoInspecoes')) console.log("PHP COND EVAL:", js, "=>", !!fn(session, localContext), "localContext:", localContext);`;

if (content.includes(target)) {
    content = content.replace(target, repl);
    fs.writeFileSync('start_test_server.js', content);
    console.log("Injected log for cond eval!");
} else {
    console.log("Could not find target string.");
}
