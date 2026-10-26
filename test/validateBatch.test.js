const test = require('node:test');
const assert = require('node:assert');
const { validateBatch } = require('../src/validateBatch.js'); 

// Função auxiliar para gerar um lote válido para os testes
function validBatch() {
    return {
        metadata: {
            batchId: "AUX-2026-10",
            competence: "2026-10",
            budgetLimit: 20000,
            status: "APROVADO PARA PROCESSAMENTO"
        },
        payments: [
            { beneficiaryId: "BEN-001", name: "Ana Souza", amount: 1200, bank: "001", agency: "1234", account: "10001-0", approved: true },
            { beneficiaryId: "BEN-002", name: "Bruno Lima", amount: 1350, bank: "104", agency: "2233", account: "20002-1", approved: true }
        ]
    };
}

test('aprova lote consistente', () => {
    assert.deepEqual(validateBatch(validBatch()).errors, []);
});

test('rejeita beneficiário duplicado', () => {
    const batch = validBatch();
    batch.payments[1].beneficiaryId = batch.payments[0].beneficiaryId;
    assert.match(validateBatch(batch).errors.join('\n'), /beneficiário duplicado/);
});

test('rejeita valor individual acima do teto', () => {
    const batch = validBatch();
    batch.payments[0].amount = 6000;
    assert.match(validateBatch(batch).errors.join('\n'), /valor deve estar/);
});

test('rejeita estouro de orçamento', () => {
    const batch = validBatch();
    batch.metadata.budgetLimit = 1500;
    assert.match(validateBatch(batch).errors.join('\n'), /orçamento/);
});