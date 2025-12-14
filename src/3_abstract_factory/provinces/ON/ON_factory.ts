import type { BillingIntegrationFactory, FeeSchedule, ValidationEngine } from '../../interfaces/I_billing_factory.js';
import type { ClaimFormFactory, ClaimForm, ClaimFormType } from '../../interfaces/I_claim_form.js';
import { CLAIM_FORM_TYPES } from '../../interfaces/I_claim_form.js';
import { ONVisionClaimForm, ONMedicalClaimForm, ONDentalClaimForm, ONFeeSchedule, ONValidationEngine } from './ON_products.js';

export class ONClaimFormFactory implements ClaimFormFactory {
    createClaimForm(type: ClaimFormType): ClaimForm {
        switch (type) {
            case CLAIM_FORM_TYPES.VISION:
                return new ONVisionClaimForm();
            case CLAIM_FORM_TYPES.MEDICAL:
                return new ONMedicalClaimForm();
            case CLAIM_FORM_TYPES.DENTAL:
                return new ONDentalClaimForm();
            default:
                throw new Error(`Unknown claim form type: ${type}`);
        }
    }
}

export class ONBillingIntegrationFactory implements BillingIntegrationFactory {
    createClaimFormFactory(): ClaimFormFactory {
        return new ONClaimFormFactory();
    }

    createFeeSchedule(): FeeSchedule {
        return new ONFeeSchedule();
    }

    createValidationEngine(): ValidationEngine {
        return new ONValidationEngine();
    }
}
