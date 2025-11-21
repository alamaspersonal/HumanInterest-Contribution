import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Clean up existing data
    await prisma.contributionHistory.deleteMany();
    await prisma.contribution.deleteMany();
    await prisma.user.deleteMany();

    // Create a user
    const user = await prisma.user.create({
        data: {
            email: 'demo@humaninterest.com',
            name: 'Alex Johnson',
            salary: 75000,
            payFrequency: 26, // Bi-weekly
            birthDate: new Date('1995-01-01'),
            retirementAge: 65,
            contribution: {
                create: {
                    type: 'PERCENTAGE',
                    rate: 5
                }
            }
        }
    });

    // Generate mock history for the last 2 years (approx 52 pay periods)
    const historyData = [];
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 2);

    for (let i = 0; i < 52; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + (i * 14)); // Every 2 weeks

        // Vary the amount slightly to look realistic
        const baseAmount = (75000 / 26) * 0.05;
        const amount = baseAmount + (Math.random() * 20 - 10);

        // Employer match (50% of contribution up to 3% of salary)
        // Max match = (75000 / 26) * 0.03 = 86.53
        const match = Math.min(amount * 0.5, (75000 / 26) * 0.03);

        historyData.push({
            userId: user.id,
            date: date,
            amount: Number(amount.toFixed(2)),
            employerMatch: Number(match.toFixed(2))
        });
    }

    await prisma.contributionHistory.createMany({
        data: historyData
    });

    console.log({ user });
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
