import type { FeeSchedule, ValidationEngine } from '../../interfaces/I_billing_factory.js';
import type { ClaimForm, ClaimSubmissionResult, ClaimData, BCClaimData } from '../../interfaces/I_claim_form.js';

const BC_SYSTEM_NAME = "Teleplan";
const STATUS_SUCCESS = "successfully.";
const STATUS_PRIVATE = "submitted as private pay invoice.";
const SERVICE_OPT_EXAM = "OPT-EXAM";
const FEE_OPT_EXAM = 85.00;
const VALIDATION_PASSED = "BC Data Valid: Patient Health Number check passed.";
const VALIDATION_FAILED = "BC Data Invalid: Missing required PHN.";


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
    validate(data: BCClaimData): string {
        if (data.phn) {
            return VALIDATION_PASSED;
        }
        return VALIDATION_FAILED;
    }
}
