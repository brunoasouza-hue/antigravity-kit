const itemVar = 'os';

const tests = [
    { name: '1 backslash', str: `<\\?php\\s+echo\\s+\\$${itemVar}->getId\\(\\)\\s*;?\\s*\\?>` },
    { name: 'test_3_slash_on_dollar', str: `<\\?php\\s+echo\\s+\\\\$${itemVar}->getId\\(\\)\\s*;?\\s*\\?>` }
];

const html = '<tr><td style="padding: 15px;">#<?php echo $os->getId(); ?></td></tr>';

tests.forEach(t => {
    try {
        const r = new RegExp(t.str, 'g');
        console.log(`\nTest: ${t.name}`);
        console.log(`Regex string evaluated as: ${t.str}`);
        console.log(`Matches:`, html.match(r));
    } catch (e) {
        console.log(`\nTest: ${t.name} failed with ${e.message}`);
    }
});
