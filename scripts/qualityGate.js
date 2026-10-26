const fs = require('fs');
const path = require('path');

const auditPath = path.join(__dirname, '../dist/auditoria.json');

try {
    console.log('Iniciando verificação do Quality Gate Financeiro...');

    // 1. Verifica se o ficheiro de auditoria existe
    if (!fs.existsSync(auditPath)) {
        throw new Error('Ficheiro de auditoria não encontrado. O estágio anterior falhou?');
    }

    const rawData = fs.readFileSync(auditPath, 'utf8');
    const auditoria = JSON.parse(rawData);

    // 2. Regra do Gate: O lote não pode estar vazio
    if (auditoria.processedRecords === 0) {
        throw new Error('Quality Gate reprovou: O lote não contém registos processados.');
    }

    // 3. Regra do Gate: O valor total não pode ser nulo ou negativo
    if (auditoria.totalApprovedAmount <= 0) {
        throw new Error('Quality Gate reprovou: O valor total aprovado é inválido (zero ou negativo).');
    }

    // 4. Regra do Gate: Integridade garantida (Hash presente)
    if (!auditoria.fileHashSha256 || auditoria.fileHashSha256.trim() === '') {
        throw new Error('Quality Gate reprovou: Assinatura de integridade (Hash SHA-256) ausente.');
    }

    console.log('✅ Quality Gate financeiro aprovado com sucesso!');
    console.log(` - Registos processados: ${auditoria.processedRecords}`);
    console.log(` - Valor total validado: R$ ${auditoria.totalApprovedAmount}`);
    console.log(` - Assinatura do lote confirmada.`);
    
    process.exit(0); // Sucesso, permite que a pipeline avance

} catch (error) {
    console.error('❌', error.message);
    process.exit(1); // Falha, bloqueia a pipeline do Jenkins imediatamente
}