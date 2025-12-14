import { describe, it, expect } from 'vitest';
import { BCBillingIntegrationFactory } from './BC_factory.js';
import { CLAIM_FORM_TYPES, PROVINCES } from '../../interfaces/I_claim_form.js';

describe('BCBillingIntegrationFactory', () => {
    const factory = new BCBillingIntegrationFactory();

    it('should have correct province', () => {
        expect(factory.province).toBe(PROVINCES.BRITISH_COLUMBIA);
    });

    describe('ClaimFormFactory', () => {
        const claimFormFactory = factory.createClaimFormFactory();

        it('should create vision claim form', () => {
            const form = claimFormFactory.createClaimForm(CLAIM_FORM_TYPES.VISION);
            const result = form.submit({
                patientName: 'John Doe',
                isInsured: true,
                serviceCode: 'OPT-EXAM',
                phn: '9876543210'
            });
            expect(result.success).toBe(true);
            expect(result.message).toContain('BC VISION Claim Form submitted');
            expect(result.system).toBe('Teleplan');
        });

        it('should create medical claim form', () => {
            const form = claimFormFactory.createClaimForm(CLAIM_FORM_TYPES.MEDICAL);
            const result = form.submit({
                patientName: 'Jane Smith',
                isInsured: true,
                serviceCode: 'MED-EXAM',
                phn: '9876543211'
            });
            expect(result.success).toBe(true);
            expect(result.message).toContain('BC MEDICAL Claim Form submitted');
        });

        it('should throw error for dental claim form', () => {
            expect(() => {
                claimFormFactory.createClaimForm(CLAIM_FORM_TYPES.DENTAL);
            }).toThrow('Unknown claim form type');
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
            expect(feeSchedule.lookupCode('OPT-EXAM')).toBe(85);
        });

        it('should return null for unknown service', () => {
            expect(feeSchedule.lookupCode('UNKNOWN')).toBeNull();
        });
    });

    describe('ValidationEngine', () => {
        const validationEngine = factory.createValidationEngine();

        it('should validate correct BC data', () => {
            const result = validationEngine.validate({
                patientName: 'Test Patient',
                isInsured: true,
                serviceCode: 'OPT-EXAM',
                phn: '9876543210'
            });
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should reject data without phn', () => {
            const result = validationEngine.validate({
                patientName: 'Test Patient',
                isInsured: true,
                serviceCode: 'OPT-EXAM'
                // missing phn
            } as any);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Personal Health Number is required');
        });
    });
});
