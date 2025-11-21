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
    ): Array<{ age: number; savings: number; quarter: number }> {
        if (retirementAge <= currentAge) throw new Error('Retirement age must be greater than current age');
        if (currentSavings < 0) throw new Error('Current savings must be non-negative');
        if (annualContribution < 0) throw new Error('Annual contribution must be non-negative');

        const years = retirementAge - currentAge;
        const projection = [];
        let balance = currency(currentSavings);

        // Monthly return rate derived from 7% annual return
        // (1 + r)^12 = 1.07 => 1 + r = 1.07^(1/12) => r = 1.07^(1/12) - 1
        const monthlyReturnRate = Math.pow(1 + annualReturnRate, 1 / 12) - 1;
        const monthlyContribution = annualContribution / 12;
        const inflationRate = 0.03; // 3% annual inflation

        // Initial point
        projection.push({
            age: currentAge,
            savings: balance.value,
            quarter: 0
        });

        for (let year = 0; year < years; year++) {
            for (let month = 1; month <= 12; month++) {
                // Add monthly contribution and growth
                const growth = balance.multiply(monthlyReturnRate);
                balance = balance.add(growth).add(monthlyContribution);

                // Record data point at the end of each quarter (months 3, 6, 9, 12)
                if (month % 3 === 0) {
                    const quarter = month / 3;

                    // Adjust for inflation to present-day dollars
                    // Discount factor = 1 / (1 + inflation)^years
                    // We use (year + month/12) for precise discounting
                    const timeInYears = year + (month / 12);
                    const discountFactor = 1 / Math.pow(1 + inflationRate, timeInYears);
                    const realValue = balance.multiply(discountFactor).value;

                    projection.push({
                        // Let's make age a float: 30.25, 30.5, 30.75, 31.0
                        age: currentAge + year + (month / 12),
                        savings: realValue,
                        quarter: quarter
                    });
                }
            }
        }

        return projection;
    }
}
