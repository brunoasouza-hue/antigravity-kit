const html = '<tr><td style="padding: 15px;">#<?php echo $os->getId(); ?></td></tr>';
const itemVar = 'os';

const regexStr1 = `\\$${itemVar}`; // \$os
const r1 = new RegExp(`<\\?php\\s+echo\\s+${regexStr1}->getId\\(\\)\\s*;?\\s*\\?>`, 'g');
console.log('r1 Match?', r1.test(html));

const regexStr2 = `\\\\\\$${itemVar}`; // \\\$os -> ?
const r2 = new RegExp(`<\\?php\\s+echo\\s+${regexStr2}->getId\\(\\)\\s*;?\\s*\\?>`, 'g');
console.log('r2 Match?', r2.test(html));
