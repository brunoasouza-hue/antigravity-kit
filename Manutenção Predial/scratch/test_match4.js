const html = '<tr><td style="padding: 15px;">#<?php echo $os->getId(); ?></td></tr>';

// literal Regex:
const r1 = /<\?php\s+echo\s+\$os->getId\(\)\s*;?\s*\?>/g;
console.log('Literal Match?', r1.test(html));

const r2 = new RegExp('<\\\\?php\\\\s+echo\\\\s+\\\\$os->getId\\\\(\\\\)\\\\s*;?\\\\s*\\\\?>', 'g');
console.log('String Match?', r2.test(html));
