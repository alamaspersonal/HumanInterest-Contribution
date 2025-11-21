import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Create mock user
    const user = await prisma.user.upsert({
        where: { email: 'demo@humaninterest.com' },
        update: {},
        create: {
            email: 'demo@humaninterest.com',
            name: 'Alex Johnson',
            salary: 75000,
            payFrequency: 26, // Bi-weekly
            birthDate: new Date('1995-01-01'), // 30 years old approx
            retirementAge: 65,
            contribution: {
                create: {
                    type: 'PERCENTAGE',
                    rate: 5, // 5%
                },
            },
        },
    });

    console.log({ user });

    // Create mock history for YTD
    // Assume 10 paychecks so far this year
    const currentYear = new Date().getFullYear();
    const salaryPerPaycheck = 75000 / 26;

    // Clear existing history for demo
    await prisma.contributionHistory.deleteMany({
        where: { userId: user.id }
    });

    for (let i = 0; i < 10; i++) {
        const date = new Date(currentYear, 0, 1 + (i * 14)); // Every 2 weeks
        const amount = salaryPerPaycheck * 0.05; // 5% contribution
        const employerMatch = Math.min(amount, salaryPerPaycheck * 0.03); // Match up to 3%

        await prisma.contributionHistory.create({
            data: {
                userId: user.id,
                date,
                amount,
                employerMatch,
            },
        });
    }

    console.log('Seeding finished.');
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
