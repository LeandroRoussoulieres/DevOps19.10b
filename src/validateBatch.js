const fs = require('fs');

function validateBatch(batch) {
    const errors = [];
    let totalAmount = 0;
    const seenBeneficiaries = new Set();

    batch.payments.forEach(payment => {
        // Validação de duplicidade
        if (seenBeneficiaries.has(payment.beneficiaryId)) {
            errors.push(`Erro: beneficiário duplicado encontrado (${payment.beneficiaryId}).`);
        }
        seenBeneficiaries.add(payment.beneficiaryId);

        // Validação de teto individual (limite de 5000)
        if (payment.amount <= 0 || payment.amount > 5000) {
            errors.push(`Erro: O valor deve estar entre 0 e 5000 para o beneficiário ${payment.beneficiaryId}.`);
        }

        if (payment.approved) {
            totalAmount += payment.amount;
        }
    });

    // Validação de estouro de orçamento
    if (totalAmount > batch.metadata.budgetLimit) {
        errors.push(`Erro: estouro de orçamento. O total processado (${totalAmount}) excede o limite estipulado (${batch.metadata.budgetLimit}).`);
    }

    return {
        isValid: errors.length === 0,
        errors,
        totalAmount
    };
}

// Execução via terminal (CLI) pelo Jenkins
if (require.main === module) {
    const file = process.argv[2];
    if (!file) {
        console.error('Uso: node src/validateBatch.js <caminho_para_lote.json>');
        process.exit(1);
    }

    try {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        const result = validateBatch(data);

        if (result.isValid) {
            console.log(`✅ Lote validado com sucesso. Valor total aprovado: R$ ${result.totalAmount}`);
            process.exit(0);
        } else {
            console.error('❌ Falha na validação do lote financeiro:');
            result.errors.forEach(err => console.error(' -', err));
            process.exit(1); // O exit code 1 faz a pipeline do Jenkins falhar no estágio "Validar lote"
        }
    } catch (error) {
        console.error('Erro crítico ao processar o ficheiro do lote:', error.message);
        process.exit(1);
    }
}

module.exports = { validateBatch };