export type ClaimFormType = 'vision' | 'medical' | 'dental';

export const CLAIM_FORM_TYPES = {
    VISION: 'vision' as ClaimFormType,
    MEDICAL: 'medical' as ClaimFormType,
    DENTAL: 'dental' as ClaimFormType,
} as const;

export interface ClaimSubmissionResult {
    success: boolean;
    message: string;
    system: string;
}

export interface ClaimForm {
    submit(data: any): ClaimSubmissionResult;
}

export interface ClaimFormFactory {
    createClaimForm(type: ClaimFormType): ClaimForm;
}
