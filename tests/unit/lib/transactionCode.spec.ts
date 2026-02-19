import { generateTransactionCode } from '@/lib/transactionCode';

describe('Transaction Code Generator', () => {
    it('should generate code with correct format PREFIX-DATE-RANDOM', () => {
        const code = generateTransactionCode('PCK');
        const parts = code.split('-');

        // Check structure: PREFIX-DDMMYYYY-RANDOM
        expect(parts.length).toBe(3);
        expect(parts[0]).toBe('PCK');

        // Check date part (DDMMYYYY = 8 chars)
        expect(parts[1]).toMatch(/^\d{8}$/);

        // Check random part (8 chars based on source code)
        expect(parts[2]).toHaveLength(8);
    });

    it('should generate unique codes on multiple calls', () => {
        const code1 = generateTransactionCode('RDM');
        const code2 = generateTransactionCode('RDM');
        expect(code1).not.toBe(code2);
    });

    it('should respect different prefixes', () => {
        const code = generateTransactionCode('SUB');
        expect(code.startsWith('SUB-')).toBe(true);
    });
});
