import { ABBillingIntegrationFactory } from './provinces/AB/AB_factory.js';
import { BCBillingIntegrationFactory } from './provinces/BC/BC_factory.js';
import { ONBillingIntegrationFactory } from './provinces/ON/ON_factory.js';
import type { BillingIntegrationFactory } from './interfaces/I_billing_factory.js';
import { CLAIM_FORM_TYPES } from './interfaces/I_claim_form.js';

function clientCode(factory: BillingIntegrationFactory, province: string, validationData: any) {
    const claimFormFactory = factory.createClaimFormFactory();
    const visionForm = claimFormFactory.createClaimForm(CLAIM_FORM_TYPES.VISION);
    const medicalForm = claimFormFactory.createClaimForm(CLAIM_FORM_TYPES.MEDICAL);
    const feeSchedule = factory.createFeeSchedule();
    const validationEngine = factory.createValidationEngine();

    console.log(`\n=== ${province} Billing Integration ===`);
    console.log('Vision Claim:', visionForm.submit({ isInsured: true }));
    console.log('Medical Claim:', medicalForm.submit({ isInsured: false }));
    console.log('Fee for OPT-EXAM:', feeSchedule.lookupCode('OPT-EXAM'));
    console.log('Validation:', validationEngine.validate(validationData));
}

// Usage
clientCode(new ABBillingIntegrationFactory(), 'Alberta', { AHC_ID: 'AB123' });
clientCode(new BCBillingIntegrationFactory(), 'British Columbia', { PHN: 'BC456' });
clientCode(new ONBillingIntegrationFactory(), 'Ontario', { OHIP_ID: 'ON789' });
