export type Severity = 'red' | 'amber' | 'green' | 'unknown';

export interface BillLineItem {
    id: string;
    description: string;
    cptCode: string | null;
    chargeAmount: number;
    insuranceAdjustment: number | null;
    insurancePaid: number | null;
    patientResponsibility: number | null;
    dateOfService: string | null;
    quantity: number;
    category: string | null;
    severity: Severity;
    severityReason: string;
    typicalRange: [number, number] | null;
    medianPrice: number | null;
    chargeRatio: number | null;
    rangeSource: 'turquoise_health' | null;
    sampleSize: number | null;
    resolvedProcedureName: string | null;
    duplicateFlag: { type: string; severity: string; items: string[]; message: string } | null;
    plainExplanation: string | null;
    whatThisCovers: string | null;
    whyFlagged: string | null;
    suggestedQuestion: string | null;
}

export interface ActionItem {
    id: string;
    severity: 'red' | 'amber';
    description: string;
    amount: number;
    reason: string;
}

export interface RecapData {
    totalItems: number;
    totalCharges: number;
    redCount: number;
    amberCount: number;
    greenCount: number;
    flaggedTotal: number;
    potentialSavings: number;
    actionItems: ActionItem[];
    isCleanBill: boolean;
}

export interface BillAnalysis {
    provider: string | null;
    dateOfService: string | null;
    patientName: string | null;
    totalBilled: number;
    totalInsurancePaid: number | null;
    totalPatientOwes: number | null;
    potentialSavings: number;
    items: BillLineItem[];
    recap: RecapData;
}
