import type { BillingIntegrationFactory, FeeSchedule, ValidationEngine } from '../../interfaces/I_billing_factory.js';
import type { ClaimFormFactory, ClaimForm, ClaimFormType } from '../../interfaces/I_claim_form.js';
import { CLAIM_FORM_TYPES } from '../../interfaces/I_claim_form.js';
import { ABVisionClaimForm, ABMedicalClaimForm, ABDentalClaimForm, ABFeeSchedule, ABValidationEngine } from './AB_products.js';

export class ABClaimFormFactory implements ClaimFormFactory {
    createClaimForm(type: ClaimFormType): ClaimForm {
        switch (type) {
            case CLAIM_FORM_TYPES.VISION:
                return new ABVisionClaimForm();
            case CLAIM_FORM_TYPES.MEDICAL:
                return new ABMedicalClaimForm();
            case CLAIM_FORM_TYPES.DENTAL:
                return new ABDentalClaimForm();
            default:
                throw new Error(`Unknown claim form type: ${type}`);
        }
    }
}

export class ABBillingIntegrationFactory implements BillingIntegrationFactory<'Alberta'> {
    readonly province: 'Alberta' = 'Alberta';

    createClaimFormFactory(): ClaimFormFactory {
        return new ABClaimFormFactory();
    }

    createFeeSchedule(): FeeSchedule {
        return new ABFeeSchedule();
    }

    createValidationEngine(): ValidationEngine<'Alberta'> {
        return new ABValidationEngine();
    }
}
