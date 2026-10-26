const fs = require('fs');
const path = require('path');

function main() {
  const dataset = JSON.parse(fs.readFileSync('data/candidatos.json', 'utf8'));
  if (!fs.existsSync('dist')) fs.mkdirSync('dist');
  
  const approved = dataset.candidates.filter(c => c.status === 'APROVADO').map(({ registration, name, score }) => ({ registration, name, score }));
  const summary = { total: dataset.candidates.length, approved: approved.length, waiting: dataset.candidates.length - approved.length };

  fs.copyFileSync('public/index.html', path.join('dist', 'index.html'));
  const report = {
    process: dataset.metadata.processo,
    version: dataset.metadata.version,
    generatedAt: new Date().toISOString(),
    summary,
    approved
  };
  
  fs.writeFileSync('dist/relatorio.json', JSON.stringify(report, null, 2) + '\n');
  console.log(`RELATÓRIO GERADO: ${approved.length} aprovados de ${summary.total} candidatos`);
}
main();