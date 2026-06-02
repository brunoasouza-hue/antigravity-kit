const html = '<tr><td style="padding: 15px;">#<?php echo $os->getId(); ?></td></tr>';
const itemVar = 'os';

// This is what the mock server evaluates:
const r = new RegExp(`<\\\\?php\\\\s+echo\\\\s+\\\\$${itemVar}->getId\\\\(\\\\)\\\\s*;?\\\\s*\\\\?>`, 'g');
console.log('Regex:', r.source);
console.log('Match?', r.test(html));
