import { Card, Text, SegmentedControl, Group, Slider, NumberInput, Button, Stack, ThemeIcon, LoadingOverlay, Notification, Box } from '@mantine/core';
import { IconCurrencyDollar, IconPercentage, IconCheck } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ContributionHistory } from './ContributionHistory';

interface ContributionWidgetProps {
    onUpdate?: () => void;
    onRateChange?: (rate: number | string) => void;
    onTypeChange?: (type: string) => void;
}

export function ContributionWidget({ onUpdate, onRateChange, onTypeChange }: ContributionWidgetProps) {
    const [userId, setUserId] = useState<number | null>(null);
    const [type, setType] = useState('PERCENTAGE');
    const [rate, setRate] = useState<number | string>(5);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const user = await api.getUser();
            setUserId(user.id);
            if (user.contribution) {
                setType(user.contribution.type);
                setRate(user.contribution.rate);
                // Initialize parent state
                if (onTypeChange) onTypeChange(user.contribution.type);
                if (onRateChange) onRateChange(user.contribution.rate);
            }
        } catch (error) {
            console.error('Failed to load user data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTypeChange = (newType: string) => {
        setType(newType);
        if (onTypeChange) onTypeChange(newType);
    };

    const handleRateChange = (newRate: number | string) => {
        setRate(newRate);
        if (onRateChange) onRateChange(newRate);
    };

    const handleSave = async () => {
        if (!userId) return;
        setSaving(true);
        try {
            await api.updateContribution(userId, type, Number(rate));
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Failed to save contribution', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box>
            <Card padding="lg" radius="md" withBorder pos="relative">
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
                            <Text fw={700} c="brand-blue">
                                {type === 'PERCENTAGE' ? `${rate}%` : `$${rate}`}
                            </Text>
                        </Group>

                        {type === 'PERCENTAGE' ? (
                            <Slider
                                value={typeof rate === 'number' ? rate : 0}
                                onChange={handleRateChange}
                                min={0}
                                max={30}
                                step={1}
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
                                leftSection={<IconCurrencyDollar size="1rem" />}
                                mb="md"
                            />
                        )}
                    </Box>

                    <Button fullWidth size="md" onClick={handleSave} loading={saving}>
                        Update Contribution
                    </Button>

                    {showSuccess && (
                        <Notification icon={<IconCheck size="1.1rem" />} color="teal" title="Success" onClose={() => setShowSuccess(false)}>
                            Contribution updated successfully
                        </Notification>
                    )}
                </Stack>
            </Card>

            <ContributionHistory refreshKey={onUpdate ? 1 : 0} />
        </Box>
    );
}
