import { describe, it, expect } from 'vitest';
import { ABBillingIntegrationFactory } from './provinces/AB/AB_factory.js';
import { BCBillingIntegrationFactory } from './provinces/BC/BC_factory.js';
import { ONBillingIntegrationFactory } from './provinces/ON/ON_factory.js';
import { PROVINCES } from './interfaces/I_claim_form.js';

describe('Abstract Factory Integration', () => {
    describe('Alberta Factory', () => {
        const factory = new ABBillingIntegrationFactory();

        it('should process AB claim data correctly', () => {
            const claimFormFactory = factory.createClaimFormFactory();
            const feeSchedule = factory.createFeeSchedule();
            const validationEngine = factory.createValidationEngine();

            const visionForm = claimFormFactory.createClaimForm('vision');
            const result = visionForm.submit({
                patientName: 'John Doe',
                isInsured: true,
                serviceCode: 'OPT-EXAM',
                ahcId: 'AB123'
            });

            expect(result.success).toBe(true);
            expect(result.system).toBe('Alberta Health System');
            expect(feeSchedule.lookupCode('OPT-EXAM')).toBe(80);
            const validation = validationEngine.validate({
                patientName: 'John Doe',
                isInsured: true,
                serviceCode: 'OPT-EXAM',
                ahcId: 'AB123'
            });
            expect(validation.isValid).toBe(true);
        });
    });

    describe('British Columbia Factory', () => {
        const factory = new BCBillingIntegrationFactory();

        it('should process BC claim data correctly', () => {
            const claimFormFactory = factory.createClaimFormFactory();
            const feeSchedule = factory.createFeeSchedule();
            const validationEngine = factory.createValidationEngine();

            const medicalForm = claimFormFactory.createClaimForm('medical');
            const result = medicalForm.submit({
                patientName: 'Jane Smith',
                isInsured: true,
                serviceCode: 'MED-EXAM',
                phn: '9876543210'
            });

            expect(result.success).toBe(true);
            expect(result.system).toBe('Teleplan');
            expect(feeSchedule.lookupCode('OPT-EXAM')).toBe(85);
            const validation = validationEngine.validate({
                patientName: 'Jane Smith',
                isInsured: true,
                serviceCode: 'MED-EXAM',
                phn: '9876543210'
            });
            expect(validation.isValid).toBe(true);
        });
    });

    describe('Ontario Factory', () => {
        const factory = new ONBillingIntegrationFactory();

        it('should process ON claim data correctly', () => {
            const claimFormFactory = factory.createClaimFormFactory();
            const feeSchedule = factory.createFeeSchedule();
            const validationEngine = factory.createValidationEngine();

            const dentalForm = claimFormFactory.createClaimForm('dental');
            const result = dentalForm.submit({
                patientName: 'Bob Johnson',
                isInsured: false,
                serviceCode: 'DENTAL-EXAM',
                ohipId: '1234567890'
            });

            expect(result.success).toBe(false); // not insured
            expect(result.system).toBe('Health Card System');
            expect(feeSchedule.lookupCode('OPT-EXAM')).toBe(70);
            const validation = validationEngine.validate({
                patientName: 'Bob Johnson',
                isInsured: false,
                serviceCode: 'DENTAL-EXAM',
                ohipId: '1234567890'
            });
            expect(validation.isValid).toBe(true);
        });
    });

    describe('Factory Type Safety', () => {
        it('should enforce province-specific data types', () => {
            const abFactory = new ABBillingIntegrationFactory();
            const bcFactory = new BCBillingIntegrationFactory();
            const onFactory = new ONBillingIntegrationFactory();

            // Each factory should only accept its specific data type
            expect(abFactory.province).toBe(PROVINCES.ALBERTA);
            expect(bcFactory.province).toBe(PROVINCES.BRITISH_COLUMBIA);
            expect(onFactory.province).toBe(PROVINCES.ONTARIO);
        });
    });
});
