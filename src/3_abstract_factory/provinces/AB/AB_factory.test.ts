import { describe, it, expect } from 'vitest';
import { ABBillingIntegrationFactory } from './AB_factory.js';
import { CLAIM_FORM_TYPES, PROVINCES } from '../../interfaces/I_claim_form.js';

describe('ABBillingIntegrationFactory', () => {
    const factory = new ABBillingIntegrationFactory();

    it('should have correct province', () => {
        expect(factory.province).toBe(PROVINCES.ALBERTA);
    });

    describe('ClaimFormFactory', () => {
        const claimFormFactory = factory.createClaimFormFactory();

        it('should create vision claim form', () => {
            const form = claimFormFactory.createClaimForm(CLAIM_FORM_TYPES.VISION);
            const result = form.submit({
                patientName: 'John Doe',
                isInsured: true,
                serviceCode: 'OPT-EXAM',
                ahcId: 'AB123'
            });
            expect(result.success).toBe(true);
            expect(result.message).toContain('AB VISION Claim Form submitted');
            expect(result.system).toBe('Alberta Health System');
        });

        it('should create medical claim form', () => {
            const form = claimFormFactory.createClaimForm(CLAIM_FORM_TYPES.MEDICAL);
            const result = form.submit({
                patientName: 'Jane Smith',
                isInsured: true,
                serviceCode: 'MED-EXAM',
                ahcId: 'AB456'
            });
            expect(result.success).toBe(true);
            expect(result.message).toContain('AB MEDICAL Claim Form submitted');
        });

        it('should create dental claim form', () => {
            const form = claimFormFactory.createClaimForm(CLAIM_FORM_TYPES.DENTAL);
            const result = form.submit({
                patientName: 'Bob Johnson',
                isInsured: false,
                serviceCode: 'DENTAL-EXAM',
                ahcId: 'AB789'
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
            expect(feeSchedule.lookupCode('OPT-EXAM')).toBe(80);
        });

        it('should return null for unknown service', () => {
            expect(feeSchedule.lookupCode('UNKNOWN')).toBeNull();
        });
    });

    describe('ValidationEngine', () => {
        const validationEngine = factory.createValidationEngine();

        it('should validate correct AB data', () => {
            const result = validationEngine.validate({
                patientName: 'Test Patient',
                isInsured: true,
                serviceCode: 'OPT-EXAM',
                ahcId: 'AB123'
            });
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should reject data without ahcId', () => {
            const result = validationEngine.validate({
                patientName: 'Test Patient',
                isInsured: true,
                serviceCode: 'OPT-EXAM',
                ahcId: ''
            });
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Alberta Health Care ID is required');
        });
    });
});
