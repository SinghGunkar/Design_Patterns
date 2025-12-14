import { describe, it, expect } from 'vitest';
import { BCVisionClaimForm, BCMedicalClaimForm, BCFeeSchedule, BCValidationEngine } from './BC_products.js';

describe('British Columbia Products', () => {
    describe('Claim Forms', () => {
        describe('BCVisionClaimForm', () => {
            const form = new BCVisionClaimForm();

            it('should submit successfully for insured patient', () => {
                const result = form.submit({
                    patientName: 'John Doe',
                    isInsured: true,
                    serviceCode: 'OPT-EXAM',
                    phn: '9876543210'
                });

                expect(result).toEqual({
                    success: true,
                    message: 'BC VISION Claim Form submitted successfully..',
                    system: 'Teleplan'
                });
            });

            it('should submit as private pay for uninsured patient', () => {
                const result = form.submit({
                    patientName: 'Jane Smith',
                    isInsured: false,
                    serviceCode: 'OPT-EXAM',
                    phn: '9876543211'
                });

                expect(result).toEqual({
                    success: false,
                    message: 'BC VISION Claim Form submitted as private pay invoice.',
                    system: 'Teleplan'
                });
            });
        });

        describe('BCMedicalClaimForm', () => {
            const form = new BCMedicalClaimForm();

            it('should submit successfully for insured patient', () => {
                const result = form.submit({
                    patientName: 'Bob Johnson',
                    isInsured: true,
                    serviceCode: 'MED-EXAM',
                    phn: '9876543212'
                });

                expect(result).toEqual({
                    success: true,
                    message: 'BC MEDICAL Claim Form submitted successfully..',
                    system: 'Teleplan'
                });
            });

            it('should submit as private pay for uninsured patient', () => {
                const result = form.submit({
                    patientName: 'Alice Brown',
                    isInsured: false,
                    serviceCode: 'MED-EXAM',
                    phn: '9876543213'
                });

                expect(result).toEqual({
                    success: false,
                    message: 'BC MEDICAL Claim Form submitted as private pay invoice.',
                    system: 'Teleplan'
                });
            });
        });
    });

    describe('BCFeeSchedule', () => {
        const feeSchedule = new BCFeeSchedule();

        it('should return correct fee for OPT-EXAM', () => {
            expect(feeSchedule.lookupCode('OPT-EXAM')).toBe(85);
        });

        it('should return null for unknown service codes', () => {
            expect(feeSchedule.lookupCode('UNKNOWN')).toBeNull();
            expect(feeSchedule.lookupCode('')).toBeNull();
            expect(feeSchedule.lookupCode('INVALID')).toBeNull();
        });
    });

    describe('BCValidationEngine', () => {
        const validationEngine = new BCValidationEngine();

        it('should validate data with valid phn', () => {
            const result = validationEngine.validate({
                patientName: 'Test Patient',
                isInsured: true,
                serviceCode: 'OPT-EXAM',
                phn: '9876543210'
            });

            expect(result).toBe('BC Data Valid: Patient Health Number check passed.');
        });

        it('should reject data without phn', () => {
            const result = validationEngine.validate({
                patientName: 'Test Patient',
                isInsured: true,
                serviceCode: 'OPT-EXAM'
                // missing phn
            } as any);

            expect(result).toBe('BC Data Invalid: Missing required PHN.');
        });

        it('should reject data with empty phn', () => {
            const result = validationEngine.validate({
                patientName: 'Test Patient',
                isInsured: true,
                serviceCode: 'OPT-EXAM',
                phn: ''
            });

            expect(result).toBe('BC Data Invalid: Missing required PHN.');
        });
    });
});
