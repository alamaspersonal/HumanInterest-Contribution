import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '../api';
import axios from 'axios';

vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('API Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getUser', () => {
        it('should fetch user data successfully', async () => {
            const mockUser = { id: 1, name: 'Test User' };
            mockedAxios.get.mockResolvedValueOnce({ data: mockUser });

            const result = await api.getUser();

            expect(result).toEqual(mockUser);
            expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:3001/api/user');
        });

        it('should handle errors gracefully', async () => {
            mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));

            await expect(api.getUser()).rejects.toThrow('Network Error');
        });
    });

    describe('updateContribution', () => {
        it('should send correct data for update', async () => {
            const updateData = { userId: 1, type: 'PERCENTAGE', rate: 10 };
            mockedAxios.post.mockResolvedValueOnce({ data: { success: true } });

            await api.updateContribution(1, 'PERCENTAGE', 10);

            expect(mockedAxios.post).toHaveBeenCalledWith('http://localhost:3001/api/contribution', updateData);
        });
    });

    describe('calculateImpact', () => {
        it('should fetch projection data', async () => {
            const mockResponse = { projection: [] };
            mockedAxios.post.mockResolvedValueOnce({ data: mockResponse });

            const result = await api.calculateImpact(1, 'PERCENTAGE', 10);

            expect(result).toEqual(mockResponse);
            expect(mockedAxios.post).toHaveBeenCalledWith('http://localhost:3001/api/contribution/calculate-impact', {
                userId: 1,
                type: 'PERCENTAGE',
                rate: 10
            });
        });
    });
});
