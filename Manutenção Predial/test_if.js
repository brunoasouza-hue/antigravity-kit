const fs = require('fs');

let html = `
<?php if (empty($ordensServico)): ?>
    <tr id="linha-vazia"><td>Vazia</td></tr>
<?php else: ?>
    ROW_MOCK_RENDERED
<?php endif; ?>
`;

const ifElseRegex = /<\?php\s+if\s*\((.*?)\)\s*:\s*\?>(.*?)<\?php\s+else\s*:\s*\?>(.*?)<\?php\s+endif\s*;\s*\?>/gs;

html = html.replace(ifElseRegex, (match, cond, ifBody, elseBody) => {
    console.log("MATCHED IF-ELSE!");
    console.log("cond:", cond);
    console.log("ifBody:", ifBody.trim());
    console.log("elseBody:", elseBody.trim());
    return elseBody; // Since it throws, returns false -> elseBody
});

console.log("FINAL HTML:", html);
