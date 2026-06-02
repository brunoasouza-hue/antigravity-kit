const html = '<tr><td style="padding: 15px;">#<?php echo $os->getId(); ?></td></tr>';
const itemVar = 'os';
const item = { id: 1 };

let r1 = html.replace(new RegExp(`<\\\\?php\\\\s+echo\\\\s+\\\\$${itemVar}->getId\\\\(\\\\)\\\\s*;?\\\\s*\\\\?>`, 'g'), item.id);
console.log('Regex 1 (with \\\\):', r1);

let r2 = html.replace(new RegExp(`<\\?php\\s+echo\\s+\\$${itemVar}->getId\\(\\)\\s*;?\\s*\\?>`, 'g'), item.id);
console.log('Regex 2 (current in server):', r2);

let r3 = html.replace(new RegExp(`\\$${itemVar}->getId\\(\\)`, 'g'), item.id);
console.log('Regex 3 (fallback in server):', r3);
