import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

export const api = {
    getUser: async () => {
        const response = await axios.get(`${API_URL}/user`);
        return response.data;
    },
    updateContribution: async (userId: number, type: string, rate: number) => {
        const response = await axios.post(`${API_URL}/contribution`, { userId, type, rate });
        return response.data;
    },
    getYTD: async () => {
        const response = await axios.get(`${API_URL}/contribution/ytd`);
        return response.data;
    },
    calculateImpact: async (userId: number, type: string, rate: number) => {
        const response = await axios.post(`${API_URL}/contribution/calculate-impact`, { userId, type, rate });
        return response.data;
    }
};
