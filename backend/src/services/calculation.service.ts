import currency from 'currency.js';

export class CalculationService {
    static calculatePerPaycheck(
        salary: number,
        payFrequency: number,
        type: string,
        rate: number
    ): { employee: number; employer: number } {
        if (salary < 0) throw new Error('Salary must be non-negative');
        if (payFrequency <= 0) throw new Error('Pay frequency must be positive');
        if (rate < 0) throw new Error('Contribution rate must be non-negative');
        if (!['PERCENTAGE', 'FIXED'].includes(type)) throw new Error('Invalid contribution type');

        const grossPay = currency(salary).divide(payFrequency);

        let employeeContribution;
        if (type === 'PERCENTAGE') {
            employeeContribution = grossPay.multiply(rate / 100);
        } else {
            employeeContribution = currency(rate);
        }

        // Employer match logic: 50% match up to 6% of salary
        // This means max match is 3% of salary (50% of 6%)
        const maxMatchable = grossPay.multiply(0.06);
        const matchableAmount = employeeContribution.value > maxMatchable.value
            ? maxMatchable
            : employeeContribution;

        const employerContribution = matchableAmount.multiply(0.5);

        return {
            employee: employeeContribution.value,
            employer: employerContribution.value
        };
    }

    static calculateProjection(
        currentAge: number,
        retirementAge: number,
        currentSavings: number,
        annualContribution: number,
        annualReturnRate: number = 0.07
    ): Array<{ age: number; savings: number }> {
        if (retirementAge <= currentAge) throw new Error('Retirement age must be greater than current age');
        if (currentSavings < 0) throw new Error('Current savings must be non-negative');
        if (annualContribution < 0) throw new Error('Annual contribution must be non-negative');

        const years = retirementAge - currentAge;
        const projection = [];
        let balance = currency(currentSavings);

        for (let i = 0; i <= years; i++) {
            projection.push({
                age: currentAge + i,
                savings: balance.value
            });

            // Add annual contribution and growth
            const growth = balance.multiply(annualReturnRate);
            balance = balance.add(growth).add(annualContribution);
        }

        return projection;
    }
}
