import { describe, it, expect } from 'vitest';
import { ONBillingIntegrationFactory } from './ON_factory.js';
import { CLAIM_FORM_TYPES, PROVINCES } from '../../interfaces/I_claim_form.js';

describe('ONBillingIntegrationFactory', () => {
    const factory = new ONBillingIntegrationFactory();

    it('should have correct province', () => {
        expect(factory.province).toBe(PROVINCES.ONTARIO);
    });

    describe('ClaimFormFactory', () => {
        const claimFormFactory = factory.createClaimFormFactory();

        it('should create vision claim form', () => {
            const form = claimFormFactory.createClaimForm(CLAIM_FORM_TYPES.VISION);
            const result = form.submit({
                patientName: 'John Doe',
                isInsured: true,
                serviceCode: 'OPT-EXAM',
                ohipId: '1234567890'
            });
            expect(result.success).toBe(true);
            expect(result.message).toContain('ON VISION Claim Form submitted');
            expect(result.system).toBe('Health Card System');
        });

        it('should create medical claim form', () => {
            const form = claimFormFactory.createClaimForm(CLAIM_FORM_TYPES.MEDICAL);
            const result = form.submit({
                patientName: 'Jane Smith',
                isInsured: true,
                serviceCode: 'MED-EXAM',
                ohipId: '1234567891'
            });
            expect(result.success).toBe(true);
            expect(result.message).toContain('ON MEDICAL Claim Form submitted');
        });

        it('should create dental claim form', () => {
            const form = claimFormFactory.createClaimForm(CLAIM_FORM_TYPES.DENTAL);
            const result = form.submit({
                patientName: 'Diana Davis',
                isInsured: false,
                serviceCode: 'DENTAL-EXAM',
                ohipId: '1234567895'
            });
            expect(result.success).toBe(false);
            expect(result.message).toContain('submitted as private pay invoice');
        });

        it('should throw error for unknown claim form type', () => {
            expect(() => {
                claimFormFactory.createClaimForm('invalid' as any);
            }).toThrow('Unknown claim form type: invalid');
        });
    });

    describe('FeeSchedule', () => {
        const feeSchedule = factory.createFeeSchedule();

        it('should return correct fee for OPT-EXAM', () => {
            expect(feeSchedule.lookupCode('OPT-EXAM')).toBe(70);
        });

        it('should return null for unknown service', () => {
            expect(feeSchedule.lookupCode('UNKNOWN')).toBeNull();
        });
    });

    describe('ValidationEngine', () => {
        const validationEngine = factory.createValidationEngine();

        it('should validate correct ON data', () => {
            const result = validationEngine.validate({
                patientName: 'Test Patient',
                isInsured: true,
                serviceCode: 'OPT-EXAM',
                ohipId: '1234567890'
            });
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should reject data without ohipId', () => {
            const result = validationEngine.validate({
                patientName: 'Test Patient',
                isInsured: true,
                serviceCode: 'OPT-EXAM'
                // missing ohipId
            } as any);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('OHIP ID is required');
        });
    });
});
