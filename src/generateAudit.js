const fs = require('fs');
const crypto = require('crypto');
const { validateBatch } = require('./validateBatch.js');

// 1. Ler o ficheiro de entrada
const raw = fs.readFileSync('data/lote.json', 'utf8');
const batch = JSON.parse(raw);

// 2. Executar a validação para obter os erros e o total
const validation = validateBatch(batch);

// 3. Função para gerar o SHA-256
function sha256(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
}

// 4. Garantir que a pasta dist/ existe
if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
}

// 5. Montar o objeto de auditoria exatamente como no slide
const audit = {
    batchId: batch.metadata.batchId,
    competence: batch.metadata.competence,
    status: validation.errors.length === 0 ? 'APROVADO' : 'REPROVADO',
    paymentCount: batch.payments.length,
    total: validation.totalAmount,
    budgetLimit: batch.metadata.budgetLimit,
    errors: validation.errors,
    warnings: validation.warnings || [],
    fileHashSha256: sha256(raw), // Corrigido de inputSha256 para fileHashSha256
    commit: process.env.GIT_COMMIT || 'local',
    buildNumber: process.env.BUILD_NUMBER || 'local',
    generatedAt: new Date().toISOString()
};

// 6. Escrever o ficheiro de auditoria
fs.writeFileSync('dist/auditoria.json', `${JSON.stringify(audit, null, 2)}\n`);

// 7. Escrever o lote liberado apenas se não houver erros (como sugerido pela linha 33 cortada)
if (validation.errors.length === 0) {
    fs.writeFileSync('dist/lote-liberado.json', raw);
    console.log('✅ Auditoria gerada: LOTE APROVADO.');
} else {
    console.log('❌ Auditoria gerada: LOTE REPROVADO.');
}