const fs = require('fs');

function readText(path) {
  return fs.readFileSync(path, 'utf8').trim();
}

const versionFile = readText('version.txt');
const packageVersion = JSON.parse(readText('package.json')).version;
const dataVersion = JSON.parse(readText('data/candidatos.json')).metadata.version;
const html = readText('public/index.html');

const htmlMatch = html.match(/data-release-version="([^"]+)"/);
const htmlVersion = htmlMatch ? htmlMatch[1] : null;

const versions = {
  'version.txt': versionFile,
  'package.json': packageVersion,
  'data/candidatos.json': dataVersion,
  'public/index.html': htmlVersion
};

console.log('VERSÕES ENCONTRADAS');
Object.entries(versions).forEach(([file, version]) => console.log(`${file}: ${version}`));

const unique = new Set(Object.values(versions));
if (unique.has(null) || unique.size !== 1) {
  console.error('SINCRONIZAÇÃO DE VERSÃO REPROVADA');
  console.error('Todos os artefatos devem declarar a mesma versão.');
  process.exit(1);
}

if (!html.includes(`Versão publicada: ${versionFile}`)) {
  console.error('SINCRONIZAÇÃO DE CONTEÚDO REPROVADA');
  console.error('O texto visível da página não corresponde ao version.txt.');
  process.exit(1);
}

console.log(`SINCRONIZAÇÃO APROVADA: ${versionFile}`);