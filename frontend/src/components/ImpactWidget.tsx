import { Card, Text, Group, ThemeIcon, Stack, Box, Skeleton } from '@mantine/core';
import { IconTrendingUp } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { api } from '../services/api';
import currency from 'currency.js';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ImpactWidgetProps {
    refreshKey?: number;
}

export function ImpactWidget({ refreshKey }: ImpactWidgetProps) {
    const [projection, setProjection] = useState<Array<{ age: number; savings: number }> | null>(null);
    const [salary, setSalary] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchImpact = async () => {
            try {
                const user = await api.getUser();
                if (user) {
                    setSalary(user.salary);
                    if (user.contribution) {
                        const result = await api.calculateImpact(user.id, user.contribution.type, user.contribution.rate);
                        setProjection(result.projection);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch impact', error);
            } finally {
                setLoading(false);
            }
        };
        fetchImpact();
    }, [refreshKey]);

    if (loading) {
        return (
            <Card padding="lg" radius="md" withBorder h={400}>
                <Skeleton height={350} />
            </Card>
        );
    }

    const finalAmount = projection && projection.length > 0 ? projection[projection.length - 1].savings : 0;
    // Normalize Y-axis to 50x salary to provide a stable frame of reference
    const yDomainMax = salary * 50;

    const formatYAxis = (value: number) => {
        if (value >= 1000000) {
            return `$${(value / 1000000).toFixed(1)}M`;
        }
        return `$${(value / 1000).toFixed(0)}k`;
    };

    return (
        <Card padding="lg" radius="md" withBorder>
            <Group justify="space-between" mb="md">
                <Box>
                    <Text fw={700} size="lg">Projected Savings</Text>
                    <Text size="sm" c="dimmed">At age 65</Text>
                </Box>
                <Stack gap={0} align="flex-end">
                    <Text fw={700} size="xl" c="brand-blue">{currency(finalAmount, { precision: 0 }).format()}</Text>
                    <ThemeIcon variant="light" color="brand-blue" size="md" radius="md">
                        <IconTrendingUp size="1rem" />
                    </ThemeIcon>
                </Stack>
            </Group>

            <Box h={300} mt="lg">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={projection || []}
                        margin={{
                            top: 10,
                            right: 30,
                            left: 0,
                            bottom: 0,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey="age"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9b9fa8', fontSize: 12 }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9b9fa8', fontSize: 12 }}
                            tickFormatter={formatYAxis}
                            domain={[0, yDomainMax]}
                        />
                        <Tooltip
                            formatter={(value: number) => [currency(value, { precision: 0 }).format(), 'Savings']}
                            labelFormatter={(label) => `Age ${label}`}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="savings"
                            stroke="#0077ff"
                            fill="#e5f4ff"
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </Box>

            <Text size="sm" c="dimmed" mt="md" ta="center">
                This projection assumes a 7% annual return. Actual results will vary.
            </Text>
        </Card>
    );
}
