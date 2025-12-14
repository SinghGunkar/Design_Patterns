import { describe, it, expect } from 'vitest';
import { ABVisionClaimForm, ABMedicalClaimForm, ABDentalClaimForm, ABFeeSchedule, ABValidationEngine } from './AB_products.js';

describe('Alberta Products', () => {
    describe('Claim Forms', () => {
        describe('ABVisionClaimForm', () => {
            const form = new ABVisionClaimForm();

            it('should submit successfully for insured patient', () => {
                const result = form.submit({
                    patientName: 'John Doe',
                    isInsured: true,
                    serviceCode: 'OPT-EXAM',
                    ahcId: 'AB123'
                });

                expect(result).toEqual({
                    success: true,
                    message: 'AB VISION Claim Form submitted successfully..',
                    system: 'Alberta Health System'
                });
            });

            it('should submit as private pay for uninsured patient', () => {
                const result = form.submit({
                    patientName: 'Jane Smith',
                    isInsured: false,
                    serviceCode: 'OPT-EXAM',
                    ahcId: 'AB456'
                });

                expect(result).toEqual({
                    success: false,
                    message: 'AB VISION Claim Form submitted as private pay invoice.',
                    system: 'Alberta Health System'
                });
            });
        });

        describe('ABMedicalClaimForm', () => {
            const form = new ABMedicalClaimForm();

            it('should submit successfully for insured patient', () => {
                const result = form.submit({
                    patientName: 'Bob Johnson',
                    isInsured: true,
                    serviceCode: 'MED-EXAM',
                    ahcId: 'AB789'
                });

                expect(result).toEqual({
                    success: true,
                    message: 'AB MEDICAL Claim Form submitted successfully..',
                    system: 'Alberta Health System'
                });
            });

            it('should submit as private pay for uninsured patient', () => {
                const result = form.submit({
                    patientName: 'Alice Brown',
                    isInsured: false,
                    serviceCode: 'MED-EXAM',
                    ahcId: 'AB101'
                });

                expect(result).toEqual({
                    success: false,
                    message: 'AB MEDICAL Claim Form submitted as private pay invoice.',
                    system: 'Alberta Health System'
                });
            });
        });

        describe('ABDentalClaimForm', () => {
            const form = new ABDentalClaimForm();

            it('should submit successfully for insured patient', () => {
                const result = form.submit({
                    patientName: 'Charlie Wilson',
                    isInsured: true,
                    serviceCode: 'DENTAL-EXAM',
                    ahcId: 'AB202'
                });

                expect(result).toEqual({
                    success: true,
                    message: 'AB DENTAL Claim Form submitted successfully..',
                    system: 'Alberta Health System'
                });
            });

            it('should submit as private pay for uninsured patient', () => {
                const result = form.submit({
                    patientName: 'Diana Davis',
                    isInsured: false,
                    serviceCode: 'DENTAL-EXAM',
                    ahcId: 'AB303'
                });

                expect(result).toEqual({
                    success: false,
                    message: 'AB DENTAL Claim Form submitted as private pay invoice.',
                    system: 'Alberta Health System'
                });
            });
        });
    });

    describe('ABFeeSchedule', () => {
        const feeSchedule = new ABFeeSchedule();

        it('should return correct fee for OPT-EXAM', () => {
            expect(feeSchedule.lookupCode('OPT-EXAM')).toBe(80);
        });

        it('should return null for unknown service codes', () => {
            expect(feeSchedule.lookupCode('UNKNOWN')).toBeNull();
            expect(feeSchedule.lookupCode('')).toBeNull();
            expect(feeSchedule.lookupCode('INVALID')).toBeNull();
        });

        it('should handle case sensitivity', () => {
            expect(feeSchedule.lookupCode('opt-exam')).toBeNull();
            expect(feeSchedule.lookupCode('OPT-exam')).toBeNull();
        });
    });

    describe('ABValidationEngine', () => {
        const validationEngine = new ABValidationEngine();

        it('should validate data with valid ahcId', () => {
            const result = validationEngine.validate({
                patientName: 'Test Patient',
                isInsured: true,
                serviceCode: 'OPT-EXAM',
                ahcId: 'AB123456789'
            });

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should reject data without ahcId', () => {
            const result = validationEngine.validate({
                patientName: 'Test Patient',
                isInsured: true,
                serviceCode: 'OPT-EXAM'
                // missing ahcId
            } as any);

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Alberta Health Care ID is required');
        });

        it('should reject data with empty ahcId', () => {
            const result = validationEngine.validate({
                patientName: 'Test Patient',
                isInsured: true,
                serviceCode: 'OPT-EXAM',
                ahcId: ''
            });

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Alberta Health Care ID is required');
        });

        it('should reject data with whitespace ahcId', () => {
            const result = validationEngine.validate({
                patientName: 'Test Patient',
                isInsured: true,
                serviceCode: 'OPT-EXAM',
                ahcId: '   '
            });

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Alberta Health Care ID is required');
        });
    });
});
