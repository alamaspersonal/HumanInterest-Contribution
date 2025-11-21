import { CalculationService } from '../calculation.service';

describe('CalculationService', () => {
    describe('calculatePerPaycheck', () => {
        const testCases = [
            {
                description: 'Standard case: 100k salary, bi-weekly, 10% contribution',
                input: { salary: 100000, payFrequency: 26, type: 'PERCENTAGE', rate: 10 },
                expected: { employee: 384.62, employer: 115.38 }
            },
            {
                description: 'High earner: 200k salary, bi-weekly, 5% contribution',
                input: { salary: 200000, payFrequency: 26, type: 'PERCENTAGE', rate: 5 },
                expected: { employee: 384.62, employer: 192.31 }
            },
            {
                description: 'Fixed amount: $500 per paycheck',
                input: { salary: 100000, payFrequency: 26, type: 'FIXED', rate: 500 },
                expected: { employee: 500.00, employer: 115.38 }
            },
            {
                description: 'Zero contribution',
                input: { salary: 100000, payFrequency: 26, type: 'PERCENTAGE', rate: 0 },
                expected: { employee: 0.00, employer: 0.00 }
            }
        ];

        test.each(testCases)('$description', ({ input, expected }) => {
            const result = CalculationService.calculatePerPaycheck(
                input.salary,
                input.payFrequency,
                input.type,
                input.rate
            );

            expect(result.employee).toBeCloseTo(expected.employee, 2);
            expect(result.employer).toBeCloseTo(expected.employer, 1);
        });

        // Edge cases
        it('should throw error for negative salary', () => {
            expect(() => {
                CalculationService.calculatePerPaycheck(-50000, 26, 'PERCENTAGE', 5);
            }).toThrow('Salary must be non-negative');
        });

        it('should throw error for zero pay frequency', () => {
            expect(() => {
                CalculationService.calculatePerPaycheck(100000, 0, 'PERCENTAGE', 5);
            }).toThrow('Pay frequency must be positive');
        });
    });

    describe('calculateProjection', () => {
        it('should calculate projection correctly', () => {
            // Age 30 to 35 (5 years), $10,000 initial, $5,000 annual, 7% return
            const result = CalculationService.calculateProjection(30, 35, 10000, 5000, 0.07);

            expect(result).toHaveLength(6); // 0 to 5 years
            expect(result[0].age).toBe(30);
            expect(result[0].savings).toBe(10000);

            // Year 1: (10000 * 1.07) + 5000 = 15700
            expect(result[1].savings).toBeCloseTo(15700, 2);
        });

        it('should throw error if retirement age is before current age', () => {
            expect(() => {
                CalculationService.calculateProjection(65, 60, 10000, 5000);
            }).toThrow('Retirement age must be greater than current age');
        });
    });
});
