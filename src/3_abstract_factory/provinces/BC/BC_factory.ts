import { BillingIntegrationFactory } from '../../interfaces/I_billing_factory.js';
import type { FeeSchedule, ValidationEngine } from '../../interfaces/I_billing_factory.js';
import type { ClaimFormFactory, ClaimForm, ClaimFormType } from '../../interfaces/I_claim_form.js';
import { CLAIM_FORM_TYPES } from '../../interfaces/I_claim_form.js';
import { BCVisionClaimForm, BCMedicalClaimForm, BCFeeSchedule, BCValidationEngine } from './BC_products.js';

export class BCClaimFormFactory implements ClaimFormFactory {
    createClaimForm(type: ClaimFormType): ClaimForm {
        switch (type) {
            case CLAIM_FORM_TYPES.VISION:
                return new BCVisionClaimForm();
            case CLAIM_FORM_TYPES.MEDICAL:
                return new BCMedicalClaimForm();
            default:
                throw new Error(`Unknown claim form type: ${type}`);
        }
    }
}

export class BCBillingIntegrationFactory extends BillingIntegrationFactory<'British Columbia'> {
    protected readonly _province: 'British Columbia' = 'British Columbia';

    createClaimFormFactory(): ClaimFormFactory {
        return new BCClaimFormFactory();
    }

    createFeeSchedule(): FeeSchedule {
        return new BCFeeSchedule();
    }

    createValidationEngine(): ValidationEngine<'British Columbia'> {
        return new BCValidationEngine();
    }
}
