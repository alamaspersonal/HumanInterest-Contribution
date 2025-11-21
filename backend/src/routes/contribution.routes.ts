import express from 'express';
import { prisma } from '../index';
import type { ContributionHistory } from '@prisma/client';
import { CalculationService } from '../services/calculation.service';

const router = express.Router();

// Get user and current contribution
router.get('/user', async (req, res) => {
    try {
        // In a real app, we'd get userId from auth token
        // For demo, we fetch user by email from env variable or first user
        const demoUserEmail = process.env.DEMO_USER_EMAIL;

        const user = demoUserEmail
            ? await prisma.user.findUnique({
                where: { email: demoUserEmail },
                include: { contribution: true }
            })
            : await prisma.user.findFirst({
                include: { contribution: true }
            });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Failed to fetch user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update contribution
router.post('/contribution', async (req, res) => {
    try {
        const { userId, type, rate } = req.body;

        if (!userId) return res.status(400).json({ error: 'Missing userId' });
        if (!type) return res.status(400).json({ error: 'Missing contribution type' });
        if (!['PERCENTAGE', 'FIXED'].includes(type)) return res.status(400).json({ error: 'Invalid contribution type' });

        // Specific validation: prevent negative dollar amounts for fixed contributions
        if (type === 'FIXED' && rate < 0) {
            return res.status(400).json({ error: 'Fixed contribution amount cannot be negative' });
        }

        // General validation for all types
        if (rate === undefined || rate < 0) return res.status(400).json({ error: 'Invalid contribution rate' });

        // For fixed contributions, validate 100% limit (cannot exceed paycheck)
        if (type === 'FIXED') {
            const user = await prisma.user.findUnique({
                where: { id: userId }
            });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            const maxAmount = user.salary / user.payFrequency;
            if (rate > maxAmount) {
                return res.status(400).json({
                    error: `Fixed contribution amount cannot exceed ${maxAmount.toFixed(2)} (100% of your paycheck)`
                });
            }
        }

        const contribution = await prisma.contribution.update({
            where: { userId },
            data: { type, rate }
        });

        res.json(contribution);
    } catch (error) {
        console.error('Update contribution error:', error);
        res.status(500).json({ error: 'Failed to update contribution' });
    }
});

// Get YTD stats
router.get('/contribution/ytd', async (req, res) => {
    try {
        const user = await prisma.user.findFirst();
        if (!user) return res.status(404).json({ error: 'User not found' });

        const history = await prisma.contributionHistory.findMany({
            where: { userId: user.id }
        });

        const currentYear = new Date().getFullYear();
        const currentYearHistory = history.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate.getFullYear() === currentYear;
        });

        const totalEmployee = currentYearHistory.reduce((sum: number, entry: ContributionHistory) => sum + entry.amount, 0);
        const totalEmployer = currentYearHistory.reduce((sum: number, entry: ContributionHistory) => sum + entry.employerMatch, 0);

        res.json({
            totalEmployee,
            totalEmployer,
            total: totalEmployee + totalEmployer,
            history
        });
    } catch (error) {
        console.error('Failed to fetch YTD data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update user details
router.put('/user/:id', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const { salary, name } = req.body;

        const user = await prisma.user.update({
            where: { id: userId },
            data: { salary, name }
        });

        res.json(user);
    } catch (error) {
        console.error('Failed to update user:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// Clear contribution history
router.delete('/contribution/history/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);

        await prisma.contributionHistory.deleteMany({
            where: { userId }
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Failed to clear history:', error);
        res.status(500).json({ error: 'Failed to clear history' });
    }
});

// Calculate impact
router.post('/contribution/calculate-impact', async (req, res) => {
    try {
        const { userId, type, rate } = req.body;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const { employee, employer } = CalculationService.calculatePerPaycheck(
            user.salary,
            user.payFrequency,
            type,
            rate
        );

        const annualContribution = (employee + employer) * user.payFrequency;

        // Get current YTD as starting balance for projection
        // In reality, this should include total portfolio value
        const history = await prisma.contributionHistory.findMany({
            where: { userId: user.id }
        });
        const currentSavings = history.reduce((sum: number, h: ContributionHistory) => sum + h.amount + h.employerMatch, 0);

        const projection = CalculationService.calculateProjection(
            new Date().getFullYear() - user.birthDate.getFullYear(),
            user.retirementAge,
            currentSavings,
            annualContribution
        );

        res.json({
            perPaycheck: { employee, employer },
            projection
        });
    } catch (error) {
        console.error('Impact calculation failed:', error);
        res.status(500).json({ error: 'Calculation failed' });
    }
});

export default router;
