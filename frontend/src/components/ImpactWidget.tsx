import { Card, Text, Group, Stack, Box, Skeleton, useComputedColorScheme } from '@mantine/core';
import { useState, useEffect } from 'react';
import { api } from '../services/api';
import currency from 'currency.js';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ImpactWidgetProps {
    refreshKey?: number;
    proposedRate?: number;
    proposedType?: string;
}

export function ImpactWidget({ refreshKey, proposedRate, proposedType }: ImpactWidgetProps) {
    const [currentProjection, setCurrentProjection] = useState<Array<{ age: number; savings: number }> | null>(null);
    const [proposedProjection, setProposedProjection] = useState<Array<{ age: number; savings: number }> | null>(null);
    const [salary, setSalary] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<number | null>(null);
    const [maxProjection, setMaxProjection] = useState<number>(0);
    const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
    const isDark = computedColorScheme === 'dark';

    // Fetch initial user data and current projection
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const user = await api.getUser();
                if (user) {
                    setUserId(user.id);
                    setSalary(user.salary);
                    if (user.contribution) {
                        const result = await api.calculateImpact(user.id, user.contribution.type, user.contribution.rate);
                        setCurrentProjection(result.projection);
                        // Initialize proposed projection to match current
                        setProposedProjection(result.projection);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch initial data', error);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [refreshKey]);

    // Fetch proposed projection when props change
    useEffect(() => {
        const fetchProposed = async () => {
            if (!userId || proposedRate === undefined || !proposedType) return;
            try {
                const result = await api.calculateImpact(userId, proposedType, proposedRate);
                setProposedProjection(result.projection);
            } catch (error) {
                console.error('Failed to fetch proposed impact', error);
            }
        };

        // Debounce slightly to avoid too many requests while sliding
        const timer = setTimeout(fetchProposed, 200);
        return () => clearTimeout(timer);
    }, [userId, proposedRate, proposedType]);

    // Fetch maximum projection for Y-axis normalization (30% contribution)
    useEffect(() => {
        const fetchMaxProjection = async () => {
            if (!userId) return;
            try {
                // Calculate maximum potential with 30% contribution
                const result = await api.calculateImpact(userId, 'PERCENTAGE', 30);
                if (result.projection && result.projection.length > 0) {
                    const maxValue = result.projection[result.projection.length - 1].savings;
                    setMaxProjection(maxValue);
                }
            } catch (error) {
                console.error('Failed to fetch max projection', error);
                // Fallback to salary-based calculation
                setMaxProjection(salary * 50);
            }
        };
        fetchMaxProjection();
    }, [userId, salary]);

    if (loading) {
        return (
            <Card padding="lg" radius="md" withBorder h={400}>
                <Skeleton height={350} />
            </Card>
        );
    }

    const finalCurrent = currentProjection && currentProjection.length > 0 ? currentProjection[currentProjection.length - 1].savings : 0;
    const finalProposed = proposedProjection && proposedProjection.length > 0 ? proposedProjection[proposedProjection.length - 1].savings : 0;
    const difference = finalProposed - finalCurrent;

    const yDomainMax = maxProjection || salary * 50;

    const formatYAxis = (value: number) => {
        if (value >= 1000000) {
            return `$${(value / 1000000).toFixed(1)}M`;
        }
        return `$${(value / 1000).toFixed(0)}k`;
    };

    // Merge data for chart
    const chartData = currentProjection?.map((point, index) => ({
        age: point.age,
        current: point.savings,
        proposed: proposedProjection ? proposedProjection[index]?.savings : point.savings
    })) || [];

    const axisColor = isDark ? '#909296' : '#9b9fa8';
    const gridColor = isDark ? '#373A40' : '#e9ecef';
    const tooltipBg = isDark ? '#25262b' : '#fff';
    const tooltipBorder = isDark ? '#373A40' : '#e9ecef';

    return (
        <Box>
            <Group justify="space-between" mb="md">
                <Box>
                    <Text fw={700} size="lg">Projected Savings</Text>
                    <Text size="sm" c="dimmed">At age 65</Text>
                    <Group gap="lg" mt="xs">
                        <Group gap={5}>
                            <Box w={12} h={12} style={{ backgroundColor: '#0077ff', borderRadius: 2 }} />
                            <Text size="xs" c="dimmed">Current Plan</Text>
                        </Group>
                        <Group gap={5}>
                            <Box w={12} h={12} style={{ backgroundColor: '#12b886', borderRadius: 2 }} />
                            <Text size="xs" c="dimmed">Proposed</Text>
                        </Group>
                    </Group>
                </Box>
                <Stack gap={0} align="flex-end">
                    <Text fw={700} size="xl" c={difference >= 0 ? "teal" : "red"}>
                        {currency(finalProposed, { precision: 0 }).format()}
                    </Text>
                    {difference !== 0 && (
                        <Text size="xs" c={difference > 0 ? "teal" : "red"} fw={500}>
                            {difference > 0 ? '+' : ''}{currency(difference, { precision: 0 }).format()} vs current plan

                        </Text>
                    )}
                </Stack>
            </Group>

            <Box h={300} mt="lg">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={chartData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                        <XAxis
                            dataKey="age"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: axisColor, fontSize: 12 }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: axisColor, fontSize: 12 }}
                            tickFormatter={formatYAxis}
                            domain={[0, yDomainMax]}
                        />
                        <Tooltip
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    const current = payload[0].value as number;
                                    const proposed = payload[1]?.value as number;
                                    const diff = proposed - current;

                                    return (
                                        <Card padding="xs" radius="md" shadow="sm" withBorder style={{ backgroundColor: tooltipBg, borderColor: tooltipBorder }}>
                                            <Text size="xs" fw={700} mb={5}>Age {label}</Text>
                                            <Group justify="space-between" gap="xl" mb={5}>
                                                <Text size="xs" c="dimmed">Current:</Text>
                                                <Text size="xs" fw={500} c="brand-blue">{currency(current, { precision: 0 }).format()}</Text>
                                            </Group>
                                            <Group justify="space-between" gap="xl" mb={5}>
                                                <Text size="xs" c="dimmed">Proposed:</Text>
                                                <Text size="xs" fw={500} c="teal">{currency(proposed, { precision: 0 }).format()}</Text>
                                            </Group>
                                            {diff !== 0 && (
                                                <Group justify="space-between" gap="xl">
                                                    <Text size="xs" c="dimmed">Difference:</Text>
                                                    <Text size="xs" fw={700} c={diff > 0 ? "teal" : "red"}>
                                                        {diff > 0 ? '+' : ''}{currency(diff, { precision: 0 }).format()}
                                                    </Text>
                                                </Group>
                                            )}
                                        </Card>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="current"
                            stroke="#0077ff"
                            fill="#0077ff"
                            fillOpacity={0.1}
                            strokeWidth={2}
                            name="Current"
                        />
                        <Area
                            type="monotone"
                            dataKey="proposed"
                            stroke="#12b886"
                            fill="#12b886"
                            fillOpacity={0.2}
                            strokeWidth={2}
                            name="Proposed"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </Box>

            <Text size="sm" c="dimmed" mt="md" ta="center">
                Move the slider to see how changes affect your retirement savings.
            </Text>
        </Box>
    );
}
