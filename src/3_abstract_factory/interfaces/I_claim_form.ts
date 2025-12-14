export type ClaimFormType = 'vision' | 'medical';

export const CLAIM_FORM_TYPES = {
    VISION: 'vision' as ClaimFormType,
    MEDICAL: 'medical' as ClaimFormType,
} as const;

export interface ClaimForm {
    submit(data: any): string;
}

export interface ClaimFormFactory {
    createClaimForm(type: ClaimFormType): ClaimForm;
}
