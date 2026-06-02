const r1 = new RegExp('<\\?php');
const r2 = new RegExp('<\\\\?php');
const r3 = new RegExp('<\\\\\\?php');

console.log('r1:', r1, r1.test('<?php'));
console.log('r2:', r2, r2.test('<?php'));
console.log('r3:', r3, r3.test('<?php'));
