import { Card, Text, Group, Stack, ThemeIcon, SimpleGrid, Skeleton } from '@mantine/core';
import { IconChartPie, IconArrowUpRight } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { api } from '../services/api';
import currency from 'currency.js';

interface YTDWidgetProps {
    refreshKey?: number;
}

export function YTDWidget({ refreshKey }: YTDWidgetProps) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await api.getYTD();
                setData(result);
            } catch (error) {
                console.error('Failed to fetch YTD data', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [refreshKey]);

    if (loading) {
        return (
            <Card padding="lg" radius="md" withBorder>
                <Stack>
                    <Skeleton height={30} width="50%" />
                    <SimpleGrid cols={2}>
                        <Skeleton height={80} />
                        <Skeleton height={80} />
                    </SimpleGrid>
                </Stack>
            </Card>
        );
    }

    return (
        <Card padding="lg" radius="md" withBorder>
            <Group justify="space-between" mb="xl">
                <Text fw={700} size="lg">YTD Performance</Text>
                <ThemeIcon variant="light" color="green" size="lg" radius="md">
                    <IconChartPie size="1.2rem" />
                </ThemeIcon>
            </Group>

            <SimpleGrid cols={2} spacing="lg">
                <Stack gap="xs">
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Your Contribution</Text>
                    <Text size="xl" fw={700}>{currency(data?.totalEmployee || 0).format()}</Text>
                    <Group gap={5}>
                        <IconArrowUpRight size="1rem" color="green" />
                        <Text size="xs" c="green" fw={500}>+12% vs last year</Text>
                    </Group>
                </Stack>
                <Stack gap="xs">
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Employer Match</Text>
                    <Text size="xl" fw={700}>{currency(data?.totalEmployer || 0).format()}</Text>
                    <Group gap={5}>
                        <IconArrowUpRight size="1rem" color="green" />
                        <Text size="xs" c="green" fw={500}>+5% vs last year</Text>
                    </Group>
                </Stack>
            </SimpleGrid>
        </Card>
    );
}
