import type { ClaimFormFactory, Province, ProvinceData } from './I_claim_form.js';

export interface FeeSchedule {
    lookupCode(serviceCode: string): number | null;
}

export interface ValidationEngine<P extends Province> {
    validate(data: ProvinceData[P]): ValidationResult;
}

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

export abstract class BillingIntegrationFactory<P extends Province> {
    protected abstract readonly _province: P;

    get province(): P {
        return this._province;
    }

    abstract createClaimFormFactory(): ClaimFormFactory;
    abstract createFeeSchedule(): FeeSchedule;
    abstract createValidationEngine(): ValidationEngine<P>;
}
