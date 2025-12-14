import type { FeeSchedule, ValidationEngine } from '../../interfaces/I_billing_factory.js';
import type { ClaimForm, ClaimSubmissionResult, ClaimData, ONClaimData } from '../../interfaces/I_claim_form.js';

const ON_SYSTEM_NAME = "Health Card System";
const STATUS_SUCCESS = "successfully.";
const STATUS_PRIVATE = "submitted as private pay invoice.";
const SERVICE_OPT_EXAM = "OPT-EXAM";
const FEE_OPT_EXAM = 70.00;
const VALIDATION_PASSED = "ON Data Valid: OHIP check passed.";
const VALIDATION_FAILED = "ON Data Invalid: Missing required OHIP_ID.";

export class ONVisionClaimForm implements ClaimForm {
    submit(data: ClaimData): ClaimSubmissionResult {
        if (data.isInsured) {
            return {
                success: true,
                message: `ON VISION Claim Form submitted ${STATUS_SUCCESS}.`,
                system: ON_SYSTEM_NAME
            };
        }
        return {
            success: false,
            message: `ON VISION Claim Form ${STATUS_PRIVATE}`,
            system: ON_SYSTEM_NAME
        };
    }
}

export class ONMedicalClaimForm implements ClaimForm {
    submit(data: ClaimData): ClaimSubmissionResult {
        if (data.isInsured) {
            return {
                success: true,
                message: `ON MEDICAL Claim Form submitted ${STATUS_SUCCESS}.`,
                system: ON_SYSTEM_NAME
            };
        }
        return {
            success: false,
            message: `ON MEDICAL Claim Form ${STATUS_PRIVATE}`,
            system: ON_SYSTEM_NAME
        };
    }
}

export class ONDentalClaimForm implements ClaimForm {
    submit(data: ClaimData): ClaimSubmissionResult {
        if (data.isInsured) {
            return {
                success: true,
                message: `ON DENTAL Claim Form submitted ${STATUS_SUCCESS}.`,
                system: ON_SYSTEM_NAME
            };
        }
        return {
            success: false,
            message: `ON DENTAL Claim Form ${STATUS_PRIVATE}`,
            system: ON_SYSTEM_NAME
        };
    }
}

export class ONFeeSchedule implements FeeSchedule {
    lookupCode(serviceCode: string): number | null {
        if (serviceCode === SERVICE_OPT_EXAM) {
            return FEE_OPT_EXAM;
        }
        return null;
    }
}

export class ONValidationEngine implements ValidationEngine<'Ontario'> {
    validate(data: ONClaimData): import('../../interfaces/I_billing_factory.js').ValidationResult {
        const errors: string[] = [];
        if (!data.ohipId || !data.ohipId.trim()) {
            errors.push('OHIP ID is required');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
}
