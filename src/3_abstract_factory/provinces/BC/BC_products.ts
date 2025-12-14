import type { FeeSchedule, ValidationEngine } from '../../interfaces/I_billing_factory.js';
import type { ClaimForm, ClaimSubmissionResult, ClaimData, BCClaimData } from '../../interfaces/I_claim_form.js';

const BC_SYSTEM_NAME = "Teleplan";
const STATUS_SUCCESS = "successfully.";
const STATUS_PRIVATE = "submitted as private pay invoice.";
const SERVICE_OPT_EXAM = "OPT-EXAM";
const FEE_OPT_EXAM = 85.00;



export class BCVisionClaimForm implements ClaimForm {
    submit(data: ClaimData): ClaimSubmissionResult {
        if (data.isInsured) {
            return {
                success: true,
                message: `BC VISION Claim Form submitted ${STATUS_SUCCESS}.`,
                system: BC_SYSTEM_NAME
            };
        }
        return {
            success: false,
            message: `BC VISION Claim Form ${STATUS_PRIVATE}`,
            system: BC_SYSTEM_NAME
        };
    }
}

export class BCMedicalClaimForm implements ClaimForm {
    submit(data: ClaimData): ClaimSubmissionResult {
        if (data.isInsured) {
            return {
                success: true,
                message: `BC MEDICAL Claim Form submitted ${STATUS_SUCCESS}.`,
                system: BC_SYSTEM_NAME
            };
        }
        return {
            success: false,
            message: `BC MEDICAL Claim Form ${STATUS_PRIVATE}`,
            system: BC_SYSTEM_NAME
        };
    }
}

export class BCFeeSchedule implements FeeSchedule {
    lookupCode(serviceCode: string): number | null {
        if (serviceCode === SERVICE_OPT_EXAM) {
            return FEE_OPT_EXAM;
        }
        return null;
    }
}

export class BCValidationEngine implements ValidationEngine<'British Columbia'> {
    validate(data: BCClaimData): import('../../interfaces/I_billing_factory.js').ValidationResult {
        const errors: string[] = [];
        if (!data.phn || !data.phn.trim()) {
            errors.push('Personal Health Number is required');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
}
