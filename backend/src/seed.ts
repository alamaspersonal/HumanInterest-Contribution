import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Clean up existing data
    await prisma.contributionHistory.deleteMany();
    await prisma.contribution.deleteMany();
    await prisma.user.deleteMany();

    // Define multiple demo users with different profiles
    const users = [
        {
            email: 'alex.lewis@company.com',
            name: 'Alex Lewis',
            salary: 75000,
            payFrequency: 26,
            birthDate: new Date('1995-01-01'),
            retirementAge: 65,
            contributionRate: 5,
        },
        {
            email: 'jordan.chen@company.com',
            name: 'Jordan Chen',
            salary: 120000,
            payFrequency: 24,
            birthDate: new Date('1985-06-15'),
            retirementAge: 67,
            contributionRate: 8,
        },
        {
            email: 'sam.patel@company.com',
            name: 'Sam Patel',
            salary: 45000,
            payFrequency: 26,
            birthDate: new Date('2000-03-20'),
            retirementAge: 65,
            contributionRate: 3,
        },
        {
            email: 'morgan.taylor@company.com',
            name: 'Morgan Taylor',
            salary: 95000,
            payFrequency: 26,
            birthDate: new Date('1978-11-08'),
            retirementAge: 65,
            contributionRate: 10,
        },
    ];

    // Create all users
    for (const userData of users) {
        const user = await prisma.user.create({
            data: {
                email: userData.email,
                name: userData.name,
                salary: userData.salary,
                payFrequency: userData.payFrequency,
                birthDate: userData.birthDate,
                retirementAge: userData.retirementAge,
                contribution: {
                    create: {
                        type: 'PERCENTAGE',
                        rate: userData.contributionRate,
                    },
                },
            },
        });

        // Generate contribution history based on user's age
        // Start from 2015 or when user was 22 (whichever is later)
        const historyData = [];
        const currentDate = new Date();
        const userAge = currentDate.getFullYear() - userData.birthDate.getFullYear();
        const yearUserTurned22 = userData.birthDate.getFullYear() + 22;
        const startYear = Math.max(2015, yearUserTurned22);

        const startDate = new Date(startYear, 0, 1); // January 1st of start year
        const yearsOfHistory = currentDate.getFullYear() - startYear;

        const numPaychecks = Math.round(yearsOfHistory * userData.payFrequency);
        const daysPerPaycheck = userData.payFrequency === 26 ? 14 : 15;

        // Simulate contribution rate changes over time
        let currentRate = Math.max(1, userData.contributionRate - 3); // Started lower
        let currentSalary = Math.round(userData.salary * 0.7); // Started with lower salary

        for (let i = 0; i < numPaychecks; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + (i * daysPerPaycheck));

            // Simulate gradual rate increases over the years
            const yearsIn = Math.floor(i / userData.payFrequency);
            if (yearsIn === 2) currentRate = Math.min(currentRate + 1, userData.contributionRate - 1);
            if (yearsIn === 4) currentRate = Math.min(currentRate + 1, userData.contributionRate);
            if (yearsIn === 7) currentRate = userData.contributionRate;

            // Simulate annual salary increases (3-5% per year)
            const yearIndex = Math.floor(i / userData.payFrequency);
            if (i % userData.payFrequency === 13 && yearIndex > 0) { // Every year
                const raisePercent = 0.03 + (Math.random() * 0.02); // 3-5% raise
                currentSalary = Math.round(currentSalary * (1 + raisePercent));
            }

            // Calculate contribution based on current rate and salary
            const paycheckAmount = currentSalary / userData.payFrequency;
            const baseAmount = paycheckAmount * (currentRate / 100);

            // Add realistic variance:
            let amount = baseAmount;

            if (Math.random() < 0.03) {
                // Occasional missed contribution (3% chance)
                amount = 0;
            } else if (Math.random() < 0.08) {
                // Occasional bonus contribution (8% chance)
                amount = baseAmount * (1 + Math.random() * 0.4);
            } else {
                // Normal variance (±2%)
                amount = baseAmount * (1 + (Math.random() * 0.04 - 0.02));
            }

            // Employer match (50% of contribution up to 3% of salary)
            const maxMatch = paycheckAmount * 0.03;
            const match = amount > 0 ? Math.min(amount * 0.5, maxMatch) : 0;

            historyData.push({
                userId: user.id,
                date: date,
                amount: Number(amount.toFixed(2)),
                employerMatch: Number(match.toFixed(2)),
            });
        }

        await prisma.contributionHistory.createMany({
            data: historyData,
        });

        console.log(`Created user: ${user.name} (${user.email})`);
    }

    console.log('\n✅ Seeding finished. All users created successfully.');
    console.log('\nTo switch between users, set DEMO_USER_EMAIL in backend/.env');
    console.log('Available users:');
    users.forEach(u => console.log(`  - ${u.email} (${u.name}, $${u.salary.toLocaleString()})`));
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
