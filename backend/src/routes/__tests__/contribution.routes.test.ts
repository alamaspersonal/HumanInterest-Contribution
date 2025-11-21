// Mock Prisma
const mockPrisma = {
    user: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
    },
    contribution: {
        update: jest.fn(),
    },
    contributionHistory: {
        findMany: jest.fn(),
    },
};

// Important: Mock the module BEFORE importing routes
jest.mock('../../index', () => ({
    __esModule: true,
    prisma: mockPrisma,
}));

import request from 'supertest';
import express from 'express';
// Import routes AFTER mocking
import contributionRoutes from '../contribution.routes';

const app = express();
app.use(express.json());
app.use('/api', contributionRoutes);

describe('Contribution Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/user', () => {
        it('should return user data when found', async () => {
            const mockUser = {
                id: 1,
                name: 'Test User',
                email: 'test@example.com',
                salary: 100000,
                contribution: { type: 'PERCENTAGE', rate: 5 },
            };

            mockPrisma.user.findFirst.mockResolvedValue(mockUser);

            const res = await request(app).get('/api/user');

            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockUser);
        });

        it('should return 404 when user not found', async () => {
            mockPrisma.user.findFirst.mockResolvedValue(null);

            const res = await request(app).get('/api/user');

            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('error', 'User not found');
        });
    });

    describe('POST /api/contribution', () => {
        it('should update contribution successfully', async () => {
            const updateData = {
                userId: 1,
                type: 'FIXED',
                rate: 500,
            };

            const updatedContribution = {
                id: 1,
                userId: 1,
                type: 'FIXED',
                rate: 500,
            };

            mockPrisma.contribution.update.mockResolvedValue(updatedContribution);

            const res = await request(app)
                .post('/api/contribution')
                .send(updateData);

            expect(res.status).toBe(200);
            expect(res.body).toEqual(updatedContribution);
            expect(mockPrisma.contribution.update).toHaveBeenCalledWith({
                where: { userId: 1 },
                data: { type: 'FIXED', rate: 500 },
            });
        });

        // Edge case: Missing userId (intentional failure expected)
        it('should return 400 for missing userId', async () => {
            const res = await request(app)
                .post('/api/contribution')
                .send({ type: 'FIXED', rate: 500 });

            // Current implementation returns 500 because it crashes on missing userId
            expect(res.status).toBe(400);
        });

        // Edge case: Invalid contribution type (intentional failure expected)
        it('should return 400 for invalid contribution type', async () => {
            const res = await request(app)
                .post('/api/contribution')
                .send({ userId: 1, type: 'INVALID', rate: 500 });

            // Current implementation tries to save 'INVALID' to DB which might fail or pass depending on DB constraints
            // Ideally API should validate before hitting DB
            expect(res.status).toBe(400);
        });

        // Edge case: Negative fixed amount (intentional failure expected)
        it('should return 400 for negative fixed contribution amount', async () => {
            const res = await request(app)
                .post('/api/contribution')
                .send({ userId: 1, type: 'FIXED', rate: -100 });

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('error');
            expect(res.body.error).toMatch(/negative/i);
        });
    });
});
