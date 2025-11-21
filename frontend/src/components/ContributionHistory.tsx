import { Card, Text, Table, Pagination, Group, Skeleton, Stack } from '@mantine/core';
import { useState, useEffect } from 'react';
import { api } from '../services/api';
import currency from 'currency.js';

interface HistoryEntry {
    id: number;
    date: string;
    amount: number;
    employerMatch: number;
}

interface ContributionHistoryProps {
    refreshKey?: number;
}

export function ContributionHistory({ refreshKey }: ContributionHistoryProps) {
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const result = await api.getYTD();
                // Sort by date descending
                const sortedHistory = result.history.sort((a: any, b: any) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                );
                setHistory(sortedHistory);
            } catch (error) {
                console.error('Failed to fetch history', error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [refreshKey]);

    if (loading) {
        return (
            <Card padding="lg" radius="md" withBorder mt="lg">
                <Stack>
                    <Skeleton height={30} width="40%" />
                    <Skeleton height={200} />
                </Stack>
            </Card>
        );
    }

    const totalPages = Math.ceil(history.length / itemsPerPage);
    const paginatedData = history.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    return (
        <Card padding="lg" radius="md" withBorder mt="lg">
            <Text fw={700} size="lg" mb="md">Contribution History</Text>

            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Date</Table.Th>
                        <Table.Th>You Contributed</Table.Th>
                        <Table.Th>Employer Match</Table.Th>
                        <Table.Th>Total</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {paginatedData.map((entry) => (
                        <Table.Tr key={entry.id}>
                            <Table.Td>{new Date(entry.date).toLocaleDateString()}</Table.Td>
                            <Table.Td>{currency(entry.amount).format()}</Table.Td>
                            <Table.Td>{currency(entry.employerMatch).format()}</Table.Td>
                            <Table.Td fw={500}>{currency(entry.amount + entry.employerMatch).format()}</Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>

            {totalPages > 1 && (
                <Group justify="center" mt="md">
                    <Pagination total={totalPages} value={page} onChange={setPage} />
                </Group>
            )}
        </Card>
    );
}
