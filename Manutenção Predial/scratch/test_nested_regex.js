const fs = require('fs');

let html = fs.readFileSync('public/views/preventivas.php', 'utf8');

const ifElseRegex = /<\?php\s+if\s*\((.*?)\)\s*:\s*\?>((?:(?!<\?php\s+if)[\s\S])*?)<\?php\s+else\s*:\s*\?>((?:(?!<\?php\s+if)[\s\S])*?)<\?php\s+endif\s*;\s*\?>/gs;

html = html.replace(ifElseRegex, (match, condStr, ifBody, elseBody) => {
    console.log("MATCHED COND:", condStr);
    return "[[REPLACED]]";
});

const ifRegex = /<\?php\s+if\s*\((.*?)\)\s*:\s*\?>((?:(?!<\?php\s+if)[\s\S])*?)<\?php\s+endif\s*;\s*\?>/gs;

html = html.replace(ifRegex, (match, condStr, body) => {
    console.log("MATCHED IF COND:", condStr);
    return "[[REPLACED IF]]";
});
