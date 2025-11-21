import { useState } from 'react';
import { Modal, NumberInput, Button, Stack, Text, Group, ActionIcon, Tooltip, Paper } from '@mantine/core';
import { IconSettings, IconTrash } from '@tabler/icons-react';
import { User } from '../types';

interface UserSettingsProps {
    user: User;
    onUpdateUser: (data: { salary: number }) => Promise<void>;
    onClearHistory: () => Promise<void>;
}

export function UserSettings({ user, onUpdateUser, onClearHistory }: UserSettingsProps) {
    const [opened, setOpened] = useState(false);
    const [salary, setSalary] = useState<number | string>(user.salary);
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (typeof salary !== 'number') return;

        setLoading(true);
        try {
            await onUpdateUser({ salary });
            setOpened(false);
        } finally {
            setLoading(false);
        }
    };

    const handleClearHistory = async () => {
        if (!confirm('Are you sure you want to clear all contribution history? This cannot be undone.')) return;

        setLoading(true);
        try {
            await onClearHistory();
            setOpened(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Tooltip label="User Settings" withArrow>
                <ActionIcon
                    variant="light"
                    size="lg"
                    radius="md"
                    color="brand-blue.5"
                    onClick={() => setOpened(true)}
                >
                    <IconSettings size={20} />
                </ActionIcon>
            </Tooltip>

            <Modal
                opened={opened}
                onClose={() => setOpened(false)}
                title={<Text fw={700} c="brand-navy.5">User Settings</Text>}
                radius="lg"
                padding="xl"
            >
                <Stack gap="lg">
                    <NumberInput
                        label="Annual Salary"
                        description="Update your base annual salary"
                        prefix="$"
                        thousandSeparator
                        value={salary}
                        onChange={setSalary}
                        min={0}
                        size="md"
                    />

                    <Paper withBorder p="md" radius="md" bg="red.0" style={{ borderColor: 'var(--mantine-color-red-2)' }}>
                        <Stack gap="xs">
                            <Text size="sm" fw={600} c="red.8">Danger Zone</Text>
                            <Text size="xs" c="red.8">
                                This will remove all past contributions and reset YTD to $0.
                            </Text>
                            <Button
                                variant="white"
                                color="red"
                                leftSection={<IconTrash size={16} />}
                                onClick={handleClearHistory}
                                loading={loading}
                                fullWidth
                            >
                                Clear Contribution History
                            </Button>
                        </Stack>
                    </Paper>

                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={() => setOpened(false)}>Cancel</Button>
                        <Button onClick={handleSave} loading={loading} color="brand-blue.5">Save Changes</Button>
                    </Group>
                </Stack>
            </Modal>
        </>
    );
}
