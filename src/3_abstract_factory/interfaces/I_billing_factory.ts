import type { ClaimFormFactory, Province, ProvinceData } from './I_claim_form.js';

export interface FeeSchedule {
    lookupCode(serviceCode: string): number | null;
}

export interface ValidationEngine<P extends Province> {
    validate(data: ProvinceData[P]): string;
}

export interface BillingIntegrationFactory<P extends Province> {
    readonly province: P;
    createClaimFormFactory(): ClaimFormFactory;
    createFeeSchedule(): FeeSchedule;
    createValidationEngine(): ValidationEngine<P>;
}
