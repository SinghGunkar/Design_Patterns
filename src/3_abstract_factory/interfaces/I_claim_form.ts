export const PROVINCES = {
    ALBERTA: 'Alberta',
    BRITISH_COLUMBIA: 'British Columbia',
    ONTARIO: 'Ontario',
} as const;

export type Province = typeof PROVINCES[keyof typeof PROVINCES];

export const CLAIM_FORM_TYPES = {
    VISION: 'vision',
    MEDICAL: 'medical',
    DENTAL: 'dental',
} as const;

export type ClaimFormType = typeof CLAIM_FORM_TYPES[keyof typeof CLAIM_FORM_TYPES];

export interface BaseClaimData {
    patientName: string;
    isInsured: boolean;
    serviceCode: string;
}

export interface ABClaimData extends BaseClaimData {
    ahcId: string;
}

export interface BCClaimData extends BaseClaimData {
    phn: string;
}

export interface ONClaimData extends BaseClaimData {
    ohipId: string;
}

export type ProvinceData = {
    [PROVINCES.ALBERTA]: ABClaimData;
    [PROVINCES.BRITISH_COLUMBIA]: BCClaimData;
    [PROVINCES.ONTARIO]: ONClaimData;
};

export type ClaimData = ProvinceData[keyof ProvinceData];

export interface ClaimSubmissionResult {
    success: boolean;
    message: string;
    system: string;
}

export interface ClaimForm {
    submit(data: ClaimData): ClaimSubmissionResult;
}

export interface ClaimFormFactory {
    createClaimForm(type: ClaimFormType): ClaimForm;
}
