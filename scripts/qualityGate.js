const fs = require('fs');
const reportFile = process.argv[2] || 'dist/relatorio.json';
const report = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
const errors = [];

if (report.summary.total < 5) errors.push('o lote deve conter pelo menos 5 candidatos');
if (report.summary.approved + report.summary.waiting !== report.summary.total) errors.push('totais do relatório são inconsistentes');
if (!Array.isArray(report.approved)) errors.push('lista de aprovados ausente');
if (report.approved.length !== report.summary.approved) errors.push('quantidade de aprovados não corresponde ao resumo');

if (errors.length > 0) {
  console.error('QUALITY GATE REPROVADO');
  errors.forEach((error) => console.error(` ${error}`));
  process.exit(1);
}
console.log('QUALITY GATE APROVADO');