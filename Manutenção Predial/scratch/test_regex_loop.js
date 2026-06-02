const str = '<?php foreach($executores as $exe): ?>\n<option></option>\n<?php endforeach; ?>';
const regex = /<\?php\s+foreach\s*\(\$executores\s+as\s+\$exe\)\s*:\s*\?>[\s\S]*?<\?php\s+endforeach;\s*\?>/g;
console.log(str.replace(regex, 'REPLACED'));
