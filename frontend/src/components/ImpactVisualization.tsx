import { Paper, Text, Stack, Skeleton, Group, ThemeIcon } from '@mantine/core';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { IconChartDots3 } from '@tabler/icons-react';
import { ImpactData } from '../types';
import currency from 'currency.js';

interface ImpactVisualizationProps {
    data: ImpactData | null;
    loading: boolean;
}

export function ImpactVisualization({ data, loading }: ImpactVisualizationProps) {
    if (loading || !data) {
        return <Skeleton height={400} radius="lg" />;
    }

    const formattedData = (data.yearlyData || []).map(item => ({
        ...item,
        total: item.total,
        formattedTotal: currency(item.total).format(),
    }));

    const finalAmount = currency(data.finalAmount);

    return (
        <Paper p="xl" radius="lg" withBorder shadow="sm" h="100%">
            <Stack gap="lg" h="100%">
                <Group justify="space-between" align="flex-start">
                    <div>
                        <Text size="lg" fw={700} c="brand-navy.5">Projected Growth</Text>
                        <Text size="sm" c="dimmed">
                            Estimated retirement savings over {data.years} years
                        </Text>
                    </div>
                    <ThemeIcon size="xl" radius="md" variant="light" color="brand-blue.5">
                        <IconChartDots3 />
                    </ThemeIcon>
                </Group>

                <div style={{ flex: 1, minHeight: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0077ff" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#0077ff" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9ecef" />
                            <XAxis
                                dataKey="year"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#868e96', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                tickFormatter={(value) => `$${value / 1000}k`}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#868e96', fontSize: 12 }}
                            />
                            <Tooltip
                                formatter={(value: number) => [currency(value).format(), 'Total Savings']}
                                contentStyle={{
                                    borderRadius: '8px',
                                    border: 'none',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="total"
                                stroke="#0077ff"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorTotal)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <Paper bg="brand-blue.0" p="md" radius="md">
                    <Group justify="space-between" align="center">
                        <Text size="sm" fw={500} c="brand-navy.5">Projected Total at Retirement</Text>
                        <Text size="xl" fw={700} c="brand-blue.6">{finalAmount.format()}</Text>
                    </Group>
                </Paper>
            </Stack>
        </Paper>
    );
}
