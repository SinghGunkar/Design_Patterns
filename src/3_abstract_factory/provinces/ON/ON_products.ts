import type { FeeSchedule, ValidationEngine } from '../../interfaces/I_billing_factory.js';
import type { ClaimForm } from '../../interfaces/I_claim_form.js';


const ON_SYSTEM_NAME = "Health Card System";
const STATUS_SUCCESS = "successfully.";
const STATUS_PRIVATE = "submitted as private pay invoice.";
const SERVICE_OPT_EXAM = "OPT-EXAM";
const FEE_OPT_EXAM = 70.00;
const VALIDATION_KEY = "OHIP_ID";
const VALIDATION_PASSED = "ON Data Valid: OHIP check passed.";
const VALIDATION_FAILED = "ON Data Invalid: Missing required OHIP_ID.";

export class ONVisionClaimForm implements ClaimForm {
    submit(data: any): string {
        if (data.isInsured) {
            return `ON VISION Claim Form submitted to ${ON_SYSTEM_NAME} ${STATUS_SUCCESS}.`;
        }
        return `ON VISION Claim Form ${STATUS_PRIVATE}`;
    }
}

export class ONMedicalClaimForm implements ClaimForm {
    submit(data: any): string {
        if (data.isInsured) {
            return `ON MEDICAL Claim Form submitted to ${ON_SYSTEM_NAME} ${STATUS_SUCCESS}.`;
        }
        return `ON MEDICAL Claim Form ${STATUS_PRIVATE}`;
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

export class ONValidationEngine implements ValidationEngine {
    validate(data: any): string {
        if (data[VALIDATION_KEY]) {
            return VALIDATION_PASSED;
        }
        return VALIDATION_FAILED;
    }
}