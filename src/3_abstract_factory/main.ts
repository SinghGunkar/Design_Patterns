import { ABBillingIntegrationFactory } from './provinces/AB/AB_factory.js';
import { BCBillingIntegrationFactory } from './provinces/BC/BC_factory.js';
import { ONBillingIntegrationFactory } from './provinces/ON/ON_factory.js';
import type { BillingIntegrationFactory } from './interfaces/I_billing_factory.js';
import { CLAIM_FORM_TYPES } from './interfaces/I_claim_form.js';
import type { Province, ProvinceData } from './interfaces/I_claim_form.js';

function clientCode<P extends Province>(factory: BillingIntegrationFactory<P>, claimData: ProvinceData[P]) {
    const province = factory.province;
    const claimFormFactory = factory.createClaimFormFactory();
    const visionForm = claimFormFactory.createClaimForm(CLAIM_FORM_TYPES.VISION);
    const medicalForm = claimFormFactory.createClaimForm(CLAIM_FORM_TYPES.MEDICAL);
    const feeSchedule = factory.createFeeSchedule();
    const validationEngine = factory.createValidationEngine();

    console.log(`\n=== ${province} Billing Integration ===`);
    const visionResult = visionForm.submit(claimData);
    console.log('Vision Claim:', visionResult.success ? visionResult.message : visionResult.message, 'via', visionResult.system);
    const medicalResult = medicalForm.submit(claimData);
    console.log('Medical Claim:', medicalResult.success ? medicalResult.message : medicalResult.message, 'via', medicalResult.system);
    console.log('Fee for OPT-EXAM:', feeSchedule.lookupCode('OPT-EXAM'));
    console.log('Validation:', validationEngine.validate(claimData));
}

clientCode(new ABBillingIntegrationFactory(), {
    patientName: 'John Doe',
    isInsured: true,
    serviceCode: 'OPT-EXAM',
    ahcId: 'AB123'
});

clientCode(new BCBillingIntegrationFactory(), {
    patientName: 'Jane Smith',
    isInsured: true,
    serviceCode: 'OPT-EXAM',
    phn: 'BC456'
});

clientCode(new ONBillingIntegrationFactory(), {
    patientName: 'Bob Johnson',
    isInsured: true,
    serviceCode: 'OPT-EXAM',
    ohipId: 'ON789'
});
