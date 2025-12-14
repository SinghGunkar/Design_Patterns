import type { ClaimFormFactory } from './I_claim_form.js';

export interface FeeSchedule {
    lookupCode(serviceCode: string): number | null;
}

export interface ValidationEngine {
    validate(data: any): string;
}

export interface BillingIntegrationFactory {
    createClaimFormFactory(): ClaimFormFactory;
    createFeeSchedule(): FeeSchedule;
    createValidationEngine(): ValidationEngine;
}