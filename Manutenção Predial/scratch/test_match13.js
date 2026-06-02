const itemVar = 'os';

const regexStr = `<\\?php\\s+echo\\s+\\$${itemVar}->getId\\(\\)\\s*;?\\s*\\?>`;
const html = '<td style="padding: 15px; text-align: center; font-weight: bold; color: #333;">#<?php echo $os->getId(); ?></td>';

console.log('regexStr:', regexStr);
const r = new RegExp(regexStr, 'g');
console.log('r:', r);
console.log('matches:', html.match(r));

const html2 = '<?=\\s*\\$os->getId\\(\\)\\s*\\?>';
const regexStr2 = `<?=\\s*\\$${itemVar}->getId\\(\\)\\s*\\?>`;
const r2 = new RegExp(regexStr2, 'g');
console.log('r2:', r2);
