export interface Contribution {
    id: number;
    userId: number;
    type: 'PERCENTAGE' | 'FIXED';
    rate: number;
}

export interface User {
    id: number;
    name: string;
    email: string;
    salary: number;
    payFrequency: number;
    birthDate: string;
    retirementAge: number;
    contribution?: Contribution;
}

export interface ContributionHistoryEntry {
    id: number;
    userId: number;
    date: string;
    amount: number;
    employerMatch: number;
}

export interface YTDData {
    totalEmployee: number;
    totalEmployer: number;
    total: number;
    history: ContributionHistoryEntry[];
}
