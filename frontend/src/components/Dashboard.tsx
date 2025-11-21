import { Card, Title, Text, Box, Stack, Divider, SimpleGrid, Group, SegmentedControl, Slider, NumberInput, Button, LoadingOverlay, Notification, ThemeIcon, Table, Pagination, Skeleton } from '@mantine/core';
import { IconCurrencyDollar, IconPercentage, IconCheck, IconChartPie } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { api } from '../services/api';
import currency from 'currency.js';
import { ImpactWidget } from './ImpactWidget';
import type { YTDData, ContributionHistoryEntry } from '../types';

export function Dashboard() {
    const [refreshKey, setRefreshKey] = useState(0);
    const [proposedRate, setProposedRate] = useState<number | string>(5);
    const [proposedType, setProposedType] = useState<string>('PERCENTAGE');

    // Contribution widget state
    const [userId, setUserId] = useState<number | null>(null);
    const [type, setType] = useState('PERCENTAGE');
    const [rate, setRate] = useState<number | string>(5);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState<string>('');
    const [salary, setSalary] = useState<number>(0);
    const [payFrequency, setPayFrequency] = useState<number>(26);
    const [userName, setUserName] = useState<string>('User');
    const [isEditingRate, setIsEditingRate] = useState(false);

    // YTD widget state
    const [ytdData, setYtdData] = useState<YTDData | null>(null);
    const [ytdLoading, setYtdLoading] = useState(true);

    // History state
    const [history, setHistory] = useState<ContributionHistoryEntry[]>([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [page, setPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        loadYTDAndHistory();
    }, [refreshKey]);

    const loadData = async () => {
        try {
            const user = await api.getUser();
            setUserId(user.id);
            setSalary(user.salary);
            setPayFrequency(user.payFrequency);
            // Extract first name for welcome message
            const firstName = user.name.split(' ')[0];
            setUserName(firstName);
            if (user.contribution) {
                setType(user.contribution.type);
                setRate(user.contribution.rate);
                setProposedType(user.contribution.type);
                setProposedRate(user.contribution.rate);
            }
        } catch (error) {
            console.error('Failed to load user data', error);
            setError('Failed to load user data. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const loadYTDAndHistory = async () => {
        try {
            const result = await api.getYTD();
            setYtdData(result);

            const sortedHistory = result.history.sort((a: ContributionHistoryEntry, b: ContributionHistoryEntry) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            setHistory(sortedHistory);
        } catch (error) {
            console.error('Failed to fetch YTD data and history', error);
        } finally {
            setYtdLoading(false);
            setHistoryLoading(false);
        }
    };

    const handleUpdate = () => {
        setRefreshKey(prev => prev + 1);
    };

    const handleTypeChange = (newType: string) => {
        const paycheckAmount = salary / payFrequency;

        // Convert between types
        if (newType === 'PERCENTAGE' && type === 'FIXED') {
            // Converting from FIXED to PERCENTAGE
            // Calculate what percentage the fixed amount represents
            const percentageEquivalent = paycheckAmount > 0 ? (Number(rate) / paycheckAmount) * 100 : 0;
            const roundedPercentage = Math.round(percentageEquivalent * 100) / 100; // Round to 2 decimals
            setRate(roundedPercentage);
            setProposedRate(roundedPercentage);
        } else if (newType === 'FIXED' && type === 'PERCENTAGE') {
            // Converting from PERCENTAGE to FIXED
            // Calculate the dollar amount from the percentage
            const fixedEquivalent = (Number(rate) / 100) * paycheckAmount;
            const roundedFixed = Math.round(fixedEquivalent * 100) / 100; // Round to 2 decimals
            setRate(roundedFixed);
            setProposedRate(roundedFixed);
        }

        setType(newType);
        setProposedType(newType);
    };

    const handleRateChange = (newRate: number | string) => {
        // Validate percentage doesn't exceed 30% or go below 0%
        if (type === 'PERCENTAGE') {
            if (Number(newRate) > 30) {
                setError('Maximum contribution is 30%');
                return; // Don't update the rate
            }
            if (Number(newRate) < 0) {
                setError('Contribution cannot be negative');
                return; // Don't update the rate
            }
        }

        // Validate fixed amount doesn't exceed 30% of paycheck
        if (type === 'FIXED') {
            const maxAmount = (salary / payFrequency) * 0.3;
            if (Number(newRate) > maxAmount) {
                setError(`Maximum contribution is ${currency(maxAmount).format()} (30% of your paycheck)`);
                return; // Don't update the rate
            }
        }

        setRate(newRate);
        setProposedRate(newRate);
        setError(''); // Clear error when user changes value
    };

    const handleSave = async () => {
        if (!userId) return;

        // Validate fixed amount doesn't exceed 30% of paycheck
        if (type === 'FIXED') {
            const maxAmount = (salary / payFrequency) * 0.3;
            if (Number(rate) > maxAmount) {
                setError(`Maximum contribution is ${currency(maxAmount).format()} (30% of your paycheck)`);
                return;
            }
        }

        setSaving(true);
        setError('');
        try {
            await api.updateContribution(userId, type, Number(rate));
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
            handleUpdate();
        } catch (error: any) {
            console.error('Failed to save contribution', error);
            // Show specific backend error message if available
            const errorMessage = error?.response?.data?.error || 'Failed to save changes. Please try again.';
            setError(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    const totalPages = Math.ceil(history.length / itemsPerPage);
    const paginatedData = history.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    return (
        <Box>
            <Box mb="xl">
                <Title order={2}>Welcome Back, {userName}</Title>
                <Text c="dimmed">Here's an overview of your retirement savings.</Text>
            </Box>

            <Card padding="xl" radius="lg" withBorder>
                <Stack gap="xl">
                    {/* Graph & Contribution Controls - Always visible together */}
                    <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="xl">
                        {/* Projected Savings Graph */}
                        <Box>
                            <ImpactWidget
                                refreshKey={refreshKey}
                                proposedRate={Number(proposedRate)}
                                proposedType={proposedType}
                            />
                        </Box>

                        {/* Contribution Controls */}
                        <Box pos="relative">
                            <LoadingOverlay visible={loading} overlayProps={{ radius: "sm", blur: 2 }} />

                            <Group justify="space-between" mb="md">
                                <Text fw={700} size="lg">Contribution Rate</Text>
                                <ThemeIcon variant="light" color="brand-blue" size="lg" radius="md">
                                    <IconPercentage size="1.2rem" />
                                </ThemeIcon>
                            </Group>

                            <Stack gap="lg">
                                <SegmentedControl
                                    value={type}
                                    onChange={handleTypeChange}
                                    data={[
                                        { label: 'Percentage (%)', value: 'PERCENTAGE' },
                                        { label: 'Fixed Amount ($)', value: 'FIXED' },
                                    ]}
                                    fullWidth
                                    radius="md"
                                />

                                <Box>
                                    <Group justify="space-between" mb="xs">
                                        <Text size="sm" fw={500}>Current Rate</Text>
                                        {type === 'PERCENTAGE' && isEditingRate ? (
                                            <NumberInput
                                                value={rate}
                                                onChange={(val) => {
                                                    handleRateChange(val);
                                                }}
                                                onBlur={() => setIsEditingRate(false)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') setIsEditingRate(false);
                                                }}
                                                min={0}
                                                max={30}
                                                decimalScale={2}
                                                fixedDecimalScale
                                                suffix="%"
                                                size="xs"
                                                w={80}
                                                styles={{ input: { fontWeight: 700, color: 'var(--mantine-color-brand-blue-6)', textAlign: 'right' } }}
                                                autoFocus
                                            />
                                        ) : (
                                            <Text
                                                fw={700}
                                                c="brand-blue"
                                                onClick={() => type === 'PERCENTAGE' && setIsEditingRate(true)}
                                                style={{ cursor: type === 'PERCENTAGE' ? 'pointer' : 'default' }}
                                            >
                                                {type === 'PERCENTAGE' ? `${rate}%` : `$${rate}`}
                                            </Text>
                                        )}
                                    </Group>

                                    {type === 'PERCENTAGE' ? (
                                        <Slider
                                            value={typeof rate === 'number' ? rate : 0}
                                            onChange={handleRateChange}
                                            min={0}
                                            max={30}
                                            step={0.5}
                                            marks={[
                                                { value: 0, label: '0%' },
                                                { value: 15, label: '15%' },
                                                { value: 30, label: '30%' },
                                            ]}
                                            mb="md"
                                        />
                                    ) : (
                                        <NumberInput
                                            value={rate}
                                            onChange={handleRateChange}
                                            min={0}
                                            max={Math.round((salary / payFrequency) * 0.3 * 100) / 100}
                                            decimalScale={2}
                                            fixedDecimalScale
                                            leftSection={<IconCurrencyDollar size="1rem" />}
                                            mb="md"
                                            error={type === 'FIXED' && (error || (Number(rate) < 0 ? 'Amount cannot be negative' : ''))}
                                        />
                                    )}
                                </Box>

                                <Button
                                    fullWidth
                                    size="md"
                                    onClick={handleSave}
                                    loading={saving}
                                    disabled={type === 'FIXED' && (Number(rate) < 0 || Number(rate) > (salary / payFrequency) * 0.3)}
                                >
                                    Update Contribution
                                </Button>

                                {showSuccess && (
                                    <Notification icon={<IconCheck size="1.1rem" />} color="teal" title="Success" onClose={() => setShowSuccess(false)}>
                                        Contribution updated successfully
                                    </Notification>
                                )}
                            </Stack>
                        </Box>
                    </SimpleGrid>

                    <Divider />

                    {/* YTD Performance */}
                    <Box>
                        {ytdLoading ? (
                            <Stack>
                                <Skeleton height={30} width="50%" />
                                <SimpleGrid cols={2}>
                                    <Skeleton height={80} />
                                    <Skeleton height={80} />
                                </SimpleGrid>
                            </Stack>
                        ) : (
                            <>
                                <Group justify="space-between" mb="xl">
                                    <Text fw={700} size="lg">YTD Performance</Text>
                                    <ThemeIcon variant="light" color="green" size="lg" radius="md">
                                        <IconChartPie size="1.2rem" />
                                    </ThemeIcon>
                                </Group>

                                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                                    <Stack gap="xs">
                                        <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Your Contribution</Text>
                                        <Text size="xl" fw={700}>{currency(ytdData?.totalEmployee || 0).format()}</Text>
                                    </Stack>
                                    <Stack gap="xs">
                                        <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Employer Match</Text>
                                        <Text size="xl" fw={700}>{currency(ytdData?.totalEmployer || 0).format()}</Text>
                                    </Stack>
                                </SimpleGrid>
                            </>
                        )}
                    </Box>

                    <Divider />

                    {/* Contribution History */}
                    <Box>
                        {historyLoading ? (
                            <Stack>
                                <Skeleton height={30} width="40%" />
                                <Skeleton height={200} />
                            </Stack>
                        ) : (
                            <>
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
                            </>
                        )}
                    </Box>
                </Stack>
            </Card>
        </Box>
    );
}
