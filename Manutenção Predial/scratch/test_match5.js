const html = '<tr><td style="padding: 15px;">#<?php echo $os->getId(); ?></td></tr>';

const r3 = new RegExp('<\\\\?php\\\\s+echo\\\\s+\\\\$os->getId\\\\(\\\\)\\\\s*;?\\\\s*\\\\?>', 'g');
console.log('r3 Match?', r3.test(html));
