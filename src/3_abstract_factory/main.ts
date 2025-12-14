export interface ClaimForm {
    submit(data: any): string;
}

export interface FeeSchedule {
    lookupCode(serviceCode: string): number | null;
}

export interface ValidationEngine {
    validate(data: any): string;
}

export interface BillingIntegrationFactory {
    createClaimForm(): ClaimForm;
    createFeeSchedule(): FeeSchedule;
    createValidationEngine(): ValidationEngine;
}