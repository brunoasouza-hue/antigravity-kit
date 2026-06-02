const http = require('http');

http.get('http://localhost:8000/public/views/corretivas.php', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const lines = data.split('\n');
    lines.forEach(l => {
      if (l.includes('<td') && l.includes('#')) {
        console.log(l.trim());
      }
    });
  });
});
