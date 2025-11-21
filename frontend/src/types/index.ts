export interface User {
    id: number;
    email: string;
    name: string;
    salary: number;
    payFrequency: number;
    birthDate: string;
    retirementAge: number;
    contribution?: Contribution;
}

export interface Contribution {
    id: number;
    userId: number;
    type: 'PERCENTAGE' | 'FIXED';
    rate: number;
    updatedAt: string;
}

export interface ContributionHistory {
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
    history: ContributionHistory[];
}

export interface ImpactData {
    perPaycheck: {
        employee: number;
        employer: number;
    };
    yearlyData: Array<{
        year: number;
        age: number;
        total: number;
        contributions: number;
    }>;
    finalAmount: number;
    years: number;
}
