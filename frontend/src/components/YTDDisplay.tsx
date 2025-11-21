import { Paper, Text, Group, RingProgress, Stack, SimpleGrid, Skeleton, ThemeIcon } from '@mantine/core';
import { IconUser, IconBuilding } from '@tabler/icons-react';
import { YTDData } from '../types';
import currency from 'currency.js';

interface YTDDisplayProps {
    data: YTDData | null;
    loading: boolean;
}

export function YTDDisplay({ data, loading }: YTDDisplayProps) {
    if (loading || !data) {
        return <Skeleton height={240} radius="lg" />;
    }

    const total = currency(data.total);
    const employee = currency(data.totalEmployee);
    const employer = currency(data.totalEmployer);

    return (
        <Paper p="xl" radius="lg" withBorder shadow="sm">
            <Text size="lg" fw={700} mb="xl" c="brand-navy.5">Year-to-Date Summary</Text>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl">
                <Group justify="center">
                    <RingProgress
                        size={180}
                        thickness={16}
                        roundCaps
                        sections={[
                            { value: (employee.value / total.value) * 100, color: 'brand-blue.5', tooltip: 'Your Contributions' },
                            { value: (employer.value / total.value) * 100, color: 'teal.5', tooltip: 'Employer Match' },
                        ]}
                        label={
                            <Stack gap={0} align="center">
                                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Total Saved</Text>
                                <Text fw={700} size="xl" c="brand-navy.5">{total.format()}</Text>
                            </Stack>
                        }
                    />
                </Group>

                <Stack justify="center" gap="md">
                    <Group justify="space-between" align="center">
                        <Group gap="sm">
                            <ThemeIcon color="brand-blue.5" variant="light" radius="xl" size="sm">
                                <IconUser size={12} />
                            </ThemeIcon>
                            <Text size="sm" fw={500}>Your Contributions</Text>
                        </Group>
                        <Text fw={700} c="brand-navy.5">{employee.format()}</Text>
                    </Group>

                    <Group justify="space-between" align="center">
                        <Group gap="sm">
                            <ThemeIcon color="teal.5" variant="light" radius="xl" size="sm">
                                <IconBuilding size={12} />
                            </ThemeIcon>
                            <Text size="sm" fw={500}>Employer Match</Text>
                        </Group>
                        <Text fw={700} c="brand-navy.5">{employer.format()}</Text>
                    </Group>

                    <Text size="xs" c="dimmed" mt="sm" ta="center">
                        Based on {data.history.length} contributions this year
                    </Text>
                </Stack>
            </SimpleGrid>
        </Paper>
    );
}
