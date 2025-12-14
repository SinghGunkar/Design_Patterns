import type { FeeSchedule, ValidationEngine } from '../../interfaces/I_billing_factory.js';
import type { ClaimForm, ClaimSubmissionResult, ClaimData, ABClaimData } from '../../interfaces/I_claim_form.js';

const AB_SYSTEM_NAME = "Alberta Health System";
const STATUS_SUCCESS = "successfully.";
const STATUS_PRIVATE = "submitted as private pay invoice.";
const SERVICE_OPT_EXAM = "OPT-EXAM";
const FEE_OPT_EXAM = 80.00;
const VALIDATION_PASSED = "AB Data Valid: Alberta Health Care check passed.";
const VALIDATION_FAILED = "AB Data Invalid: Missing required AHC_ID.";

export class ABVisionClaimForm implements ClaimForm {
    submit(data: ClaimData): ClaimSubmissionResult {
        if (data.isInsured) {
            return {
                success: true,
                message: `AB VISION Claim Form submitted ${STATUS_SUCCESS}.`,
                system: AB_SYSTEM_NAME
            };
        }
        return {
            success: false,
            message: `AB VISION Claim Form ${STATUS_PRIVATE}`,
            system: AB_SYSTEM_NAME
        };
    }
}

export class ABMedicalClaimForm implements ClaimForm {
    submit(data: ClaimData): ClaimSubmissionResult {
        if (data.isInsured) {
            return {
                success: true,
                message: `AB MEDICAL Claim Form submitted ${STATUS_SUCCESS}.`,
                system: AB_SYSTEM_NAME
            };
        }
        return {
            success: false,
            message: `AB MEDICAL Claim Form ${STATUS_PRIVATE}`,
            system: AB_SYSTEM_NAME
        };
    }
}

export class ABDentalClaimForm implements ClaimForm {
    submit(data: ClaimData): ClaimSubmissionResult {
        if (data.isInsured) {
            return {
                success: true,
                message: `AB DENTAL Claim Form submitted ${STATUS_SUCCESS}.`,
                system: AB_SYSTEM_NAME
            };
        }
        return {
            success: false,
            message: `AB DENTAL Claim Form ${STATUS_PRIVATE}`,
            system: AB_SYSTEM_NAME
        };
    }
}

export class ABFeeSchedule implements FeeSchedule {
    lookupCode(serviceCode: string): number | null {
        if (serviceCode === SERVICE_OPT_EXAM) {
            return FEE_OPT_EXAM;
        }
        return null;
    }
}

export class ABValidationEngine implements ValidationEngine<'Alberta'> {
    validate(data: ABClaimData): import('../../interfaces/I_billing_factory.js').ValidationResult {
        const errors: string[] = [];
        if (!data.ahcId || !data.ahcId.trim()) {
            errors.push('Alberta Health Care ID is required');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
}
