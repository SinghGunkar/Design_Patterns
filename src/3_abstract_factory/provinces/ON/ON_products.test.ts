import { describe, it, expect } from 'vitest';
import { ONVisionClaimForm, ONMedicalClaimForm, ONDentalClaimForm, ONFeeSchedule, ONValidationEngine } from './ON_products.js';

describe('Ontario Products', () => {
    describe('Claim Forms', () => {
        describe('ONVisionClaimForm', () => {
            const form = new ONVisionClaimForm();

            it('should submit successfully for insured patient', () => {
                const result = form.submit({
                    patientName: 'John Doe',
                    isInsured: true,
                    serviceCode: 'OPT-EXAM',
                    ohipId: '1234567890'
                });

                expect(result).toEqual({
                    success: true,
                    message: 'ON VISION Claim Form submitted successfully..',
                    system: 'Health Card System'
                });
            });

            it('should submit as private pay for uninsured patient', () => {
                const result = form.submit({
                    patientName: 'Jane Smith',
                    isInsured: false,
                    serviceCode: 'OPT-EXAM',
                    ohipId: '1234567891'
                });

                expect(result).toEqual({
                    success: false,
                    message: 'ON VISION Claim Form submitted as private pay invoice.',
                    system: 'Health Card System'
                });
            });
        });

        describe('ONMedicalClaimForm', () => {
            const form = new ONMedicalClaimForm();

            it('should submit successfully for insured patient', () => {
                const result = form.submit({
                    patientName: 'Bob Johnson',
                    isInsured: true,
                    serviceCode: 'MED-EXAM',
                    ohipId: '1234567892'
                });

                expect(result).toEqual({
                    success: true,
                    message: 'ON MEDICAL Claim Form submitted successfully..',
                    system: 'Health Card System'
                });
            });

            it('should submit as private pay for uninsured patient', () => {
                const result = form.submit({
                    patientName: 'Alice Brown',
                    isInsured: false,
                    serviceCode: 'MED-EXAM',
                    ohipId: '1234567893'
                });

                expect(result).toEqual({
                    success: false,
                    message: 'ON MEDICAL Claim Form submitted as private pay invoice.',
                    system: 'Health Card System'
                });
            });
        });

        describe('ONDentalClaimForm', () => {
            const form = new ONDentalClaimForm();

            it('should submit successfully for insured patient', () => {
                const result = form.submit({
                    patientName: 'Charlie Wilson',
                    isInsured: true,
                    serviceCode: 'DENTAL-EXAM',
                    ohipId: '1234567894'
                });

                expect(result).toEqual({
                    success: true,
                    message: 'ON DENTAL Claim Form submitted successfully..',
                    system: 'Health Card System'
                });
            });

            it('should submit as private pay for uninsured patient', () => {
                const result = form.submit({
                    patientName: 'Diana Davis',
                    isInsured: false,
                    serviceCode: 'DENTAL-EXAM',
                    ohipId: '1234567895'
                });

                expect(result).toEqual({
                    success: false,
                    message: 'ON DENTAL Claim Form submitted as private pay invoice.',
                    system: 'Health Card System'
                });
            });
        });
    });

    describe('ONFeeSchedule', () => {
        const feeSchedule = new ONFeeSchedule();

        it('should return correct fee for OPT-EXAM', () => {
            expect(feeSchedule.lookupCode('OPT-EXAM')).toBe(70);
        });

        it('should return null for unknown service codes', () => {
            expect(feeSchedule.lookupCode('UNKNOWN')).toBeNull();
            expect(feeSchedule.lookupCode('')).toBeNull();
            expect(feeSchedule.lookupCode('INVALID')).toBeNull();
        });
    });

    describe('ONValidationEngine', () => {
        const validationEngine = new ONValidationEngine();

        it('should validate data with valid ohipId', () => {
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

        it('should reject data with empty ohipId', () => {
            const result = validationEngine.validate({
                patientName: 'Test Patient',
                isInsured: true,
                serviceCode: 'OPT-EXAM',
                ohipId: ''
            });

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('OHIP ID is required');
        });
    });
});
