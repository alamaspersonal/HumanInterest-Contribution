import { useState, useEffect } from 'react';
import { Paper, Text, SegmentedControl, Slider, NumberInput, Button, Stack, Group, Alert } from '@mantine/core';
import { IconCheck, IconAlertCircle } from '@tabler/icons-react';
import { Contribution } from '../types';

interface ContributionFormProps {
    initialData?: Contribution;
    onUpdate: (type: 'PERCENTAGE' | 'FIXED', rate: number) => void;
    onSave: (type: 'PERCENTAGE' | 'FIXED', rate: number) => Promise<void>;
    loading: boolean;
}

export function ContributionForm({ initialData, onUpdate, onSave, loading }: ContributionFormProps) {
    const [type, setType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
    const [rate, setRate] = useState<number>(0);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (initialData) {
            setType(initialData.type);
            setRate(initialData.rate);
        }
    }, [initialData]);

    const handleTypeChange = (value: string) => {
        const newType = value as 'PERCENTAGE' | 'FIXED';
        setType(newType);
        const newRate = newType === 'PERCENTAGE' ? 5 : 100;
        setRate(newRate);
        onUpdate(newType, newRate);
        setSaved(false);
    };

    const handleRateChange = (value: number | string) => {
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        if (!isNaN(numValue)) {
            setRate(numValue);
            onUpdate(type, numValue);
            setSaved(false);
        }
    };

    const handleSubmit = async () => {
        try {
            setError(null);
            await onSave(type, rate);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            setError('Failed to save contribution rate. Please try again.');
        }
    };

    return (
        <Paper p="xl" radius="lg" withBorder shadow="sm">
            <Stack gap="lg">
                <div>
                    <Text size="lg" fw={700} mb={4} c="brand-navy.5">Contribution Rate</Text>
                    <Text size="sm" c="dimmed">
                        Choose how much of your paycheck to save.
                    </Text>
                </div>

                <SegmentedControl
                    value={type}
                    onChange={handleTypeChange}
                    data={[
                        { label: 'Percentage (%)', value: 'PERCENTAGE' },
                        { label: 'Fixed Amount ($)', value: 'FIXED' },
                    ]}
                    fullWidth
                    radius="md"
                    size="md"
                    color="brand-blue.5"
                />

                <Stack gap="md" py="xs">
                    <Group justify="space-between">
                        <Text size="sm" fw={600} c="brand-navy.5">
                            {type === 'PERCENTAGE' ? 'Contribution Percentage' : 'Contribution Amount'}
                        </Text>
                        <NumberInput
                            value={rate}
                            onChange={handleRateChange}
                            min={0}
                            max={type === 'PERCENTAGE' ? 50 : 10000}
                            step={type === 'PERCENTAGE' ? 1 : 50}
                            suffix={type === 'PERCENTAGE' ? '%' : undefined}
                            prefix={type === 'FIXED' ? '$' : undefined}
                            w={140}
                            size="md"
                            styles={{ input: { fontWeight: 600 } }}
                        />
                    </Group>

                    <Slider
                        value={rate}
                        onChange={handleRateChange}
                        min={0}
                        max={type === 'PERCENTAGE' ? 30 : 2000}
                        step={type === 'PERCENTAGE' ? 1 : 50}
                        label={(val) => type === 'PERCENTAGE' ? `${val}%` : `$${val}`}
                        size="lg"
                        color="brand-blue.5"
                        thumbSize={24}
                    />

                    <Group justify="space-between">
                        <Text size="xs" c="dimmed">0{type === 'PERCENTAGE' ? '%' : ''}</Text>
                        <Text size="xs" c="dimmed">
                            {type === 'PERCENTAGE' ? '30%' : '$2,000'}
                        </Text>
                    </Group>
                </Stack>

                {error && (
                    <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" radius="md">
                        {error}
                    </Alert>
                )}

                <Button
                    onClick={handleSubmit}
                    loading={loading}
                    color={saved ? 'teal' : 'brand-blue.5'}
                    leftSection={saved ? <IconCheck size={20} /> : undefined}
                    size="md"
                    fullWidth
                    style={{ transition: 'all 0.2s ease' }}
                >
                    {saved ? 'Saved Successfully' : 'Update Contribution'}
                </Button>
            </Stack>
        </Paper>
    );
}
