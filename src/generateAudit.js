const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const inputPath = path.join(__dirname, '../data/lote.json');
const distDir = path.join(__dirname, '../dist');
const releasePath = path.join(distDir, 'lote-liberado.json');
const auditPath = path.join(distDir, 'auditoria.json');

try {
    // 1. Criar o diretório de distribuição, caso não exista
    if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
    }

    // 2. Ler os dados do lote original
    const rawData = fs.readFileSync(inputPath, 'utf8');
    const lote = JSON.parse(rawData);

    // 3. Calcular o valor total aprovado para o relatório
    const totalAmount = lote.payments.reduce((acc, curr) => acc + (curr.approved ? curr.amount : 0), 0);

    // 4. Gerar o hash SHA-256 para garantir a imutabilidade e integridade dos dados
    const hash = crypto.createHash('sha256').update(rawData).digest('hex');

    // 5. Estruturar o documento de auditoria
    const auditoria = {
        timestamp: new Date().toISOString(),
        batchId: lote.metadata.batchId,
        competence: lote.metadata.competence,
        processedRecords: lote.payments.length,
        totalApprovedAmount: totalAmount,
        fileHashSha256: hash,
        generatedBy: "Pipeline CI/CD - Jenkins"
    };

    // 6. Escrever os artefactos finais na pasta dist/
    fs.writeFileSync(releasePath, rawData); // Mantém o ficheiro original intacto
    fs.writeFileSync(auditPath, JSON.stringify(auditoria, null, 2));

    console.log('✅ Artefactos gerados com sucesso.');
    console.log(` - Lote copiado para: ${releasePath}`);
    console.log(` - Relatório de auditoria criado em: ${auditPath}`);
    
} catch (error) {
    console.error('❌ Erro crítico ao gerar a auditoria:', error.message);
    process.exit(1);
}