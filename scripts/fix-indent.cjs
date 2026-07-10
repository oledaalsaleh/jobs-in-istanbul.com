const fs = require('fs');
let lines = fs.readFileSync('src/routes/ai-features.ts', 'utf8').split('\n');
let result = [];
for (let line of lines) {
    let s = line.trimEnd();
    if (s === '}[locale];') result.push('  }[locale];');
    else if (s === 'const html = `') result.push('  const html = `');
    else if (s === 'return c.html(renderLayout(c, t.title, html, locale));') result.push('  return c.html(renderLayout(c, t.title, html, locale));');
    else if (s === 'let jobs: any[] = [];') result.push('  let jobs: any[] = [];');
    else if (s.startsWith('const preselectedJobId = c.req.query') && !s.startsWith('  ')) result.push('  ' + s);
    else result.push(line);
}
fs.writeFileSync('src/routes/ai-features.ts', result.join('\n'));
console.log('Fixed indentation for', lines.length, 'lines');