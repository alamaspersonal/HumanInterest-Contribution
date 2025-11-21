import express from 'express';
import { prisma } from '../index';
import { CalculationService } from '../services/calculation.service';

const router = express.Router();

// Get user and current contribution
router.get('/user', async (req, res) => {
    try {
        // In a real app, we'd get userId from auth token
        // For demo, we fetch the first user (seeded user)
        const user = await prisma.user.findFirst({
            include: { contribution: true }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update contribution
router.post('/contribution', async (req, res) => {
    try {
        const { userId, type, rate } = req.body;

        const contribution = await prisma.contribution.update({
            where: { userId },
            data: { type, rate }
        });

        res.json(contribution);
    } catch (error) {
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

        const totalEmployee = history.reduce((sum, entry) => sum + entry.amount, 0);
        const totalEmployer = history.reduce((sum, entry) => sum + entry.employerMatch, 0);

        res.json({
            totalEmployee,
            totalEmployer,
            total: totalEmployee + totalEmployer,
            history
        });
    } catch (error) {
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
        const currentSavings = history.reduce((sum, h) => sum + h.amount + h.employerMatch, 0);

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
        res.status(500).json({ error: 'Calculation failed' });
    }
});

export default router;
