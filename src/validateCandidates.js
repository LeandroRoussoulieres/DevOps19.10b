const fs = require('fs');

function validateCandidate(candidate, index, minimumScore) {
  const required = ['registration', 'cpf', 'name', 'score', 'status'];
  const errors = [];
  for (const field of required) {
    if (candidate[field] === undefined || candidate[field] === null || candidate[field] === '') {
      errors.push(`registro ${index + 1}: campo obrigatório ausente: ${field}`);
    }
  }
  if (!/^\d{11}$/.test(String(candidate.cpf ?? ''))) {
    errors.push(`registro ${index + 1}: CPF deve conter exatamente 11 dígitos`);
  }
  if (!Number.isFinite(candidate.score) || candidate.score < 0 || candidate.score > 100) {
    errors.push(`registro ${index + 1}: nota fora do intervalo 0..100`);
  }
  const expectedStatus = candidate.score >= minimumScore ? 'APROVADO' : 'LISTA_ESPERA';
  if (candidate.status !== expectedStatus) {
    errors.push(`registro ${index + 1}: status ${candidate.status} incompatível com nota ${candidate.score}; esperado ${expectedStatus}`);
  }
  return errors;
}

function validateDataset(dataset) {
  const errors = [];
  if (!dataset.metadata || typeof dataset.metadata !== 'object') return ['metadata ausente'];
  if (!Array.isArray(dataset.candidates) || dataset.candidates.length === 0) return ['lista candidates ausente ou vazia'];

  const minimumScore = Number(dataset.metadata.minimumScore);
  if (!Number.isFinite(minimumScore) || minimumScore < 0 || minimumScore > 100) return ['metadata.minimumScore inválido'];

  const cpfs = new Set();
  const registrations = new Set();

  dataset.candidates.forEach((candidate, index) => {
    errors.push(...validateCandidate(candidate, index, minimumScore));
    if (cpfs.has(candidate.cpf)) errors.push(`registro ${index + 1}: CPF duplicado: ${candidate.cpf}`);
    cpfs.add(candidate.cpf);
    if (registrations.has(candidate.registration)) errors.push(`registro ${index + 1}: inscrição duplicada: ${candidate.registration}`);
    registrations.add(candidate.registration);
  });
  return errors;
}

// Execução para o Jenkins
const data = JSON.parse(fs.readFileSync(process.argv[2] || 'data/candidatos.json', 'utf8'));
const errors = validateDataset(data);
if (errors.length > 0) {
  errors.forEach(e => console.error(e));
  process.exit(1);
}