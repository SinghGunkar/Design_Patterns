import type { FeeSchedule, ValidationEngine } from '../../interfaces/I_billing_factory.js';
import type { ClaimForm } from '../../interfaces/I_claim_form.js';

const AB_SYSTEM_NAME = "Alberta Health System";
const STATUS_SUCCESS = "successfully.";
const STATUS_PRIVATE = "submitted as private pay invoice.";
const SERVICE_OPT_EXAM = "OPT-EXAM";
const FEE_OPT_EXAM = 80.00;
const VALIDATION_KEY = "AHC_ID";
const VALIDATION_PASSED = "AB Data Valid: Alberta Health Care check passed.";
const VALIDATION_FAILED = "AB Data Invalid: Missing required AHC_ID.";

export class ABVisionClaimForm implements ClaimForm {
    submit(data: any): string {
        if (data.isInsured) {
            return `AB VISION Claim Form submitted to ${AB_SYSTEM_NAME} ${STATUS_SUCCESS}.`;
        }
        return `AB VISION Claim Form ${STATUS_PRIVATE}`;
    }
}

export class ABMedicalClaimForm implements ClaimForm {
    submit(data: any): string {
        if (data.isInsured) {
            return `AB MEDICAL Claim Form submitted to ${AB_SYSTEM_NAME} ${STATUS_SUCCESS}.`;
        }
        return `AB MEDICAL Claim Form ${STATUS_PRIVATE}`;
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

export class ABValidationEngine implements ValidationEngine {
    validate(data: any): string {
        if (data[VALIDATION_KEY]) {
            return VALIDATION_PASSED;
        }
        return VALIDATION_FAILED;
    }
}
