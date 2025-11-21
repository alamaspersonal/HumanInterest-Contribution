import { AppShell, Group, Text, Avatar, Box } from '@mantine/core';
import { IconCoin } from '@tabler/icons-react';

export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <AppShell
            header={{ height: 60 }}
            padding="md"
            bg="gray.0"
        >
            <AppShell.Header>
                <Group h="100%" px="md" justify="space-between">
                    <Group gap="xs">
                        <IconCoin size={30} color="#0077ff" />
                        <Text fw={700} size="xl" c="brand-navy.5">RetireSmart</Text>
                    </Group>
                    <Group>
                        <Avatar src={null} alt="User" color="brand-blue" radius="xl">AJ</Avatar>
                        <Box visibleFrom="xs">
                            <Text size="sm" fw={500}>Alex Johnson</Text>
                            <Text size="xs" c="dimmed">Employee</Text>
                        </Box>
                    </Group>
                </Group>
            </AppShell.Header>

            <AppShell.Main>
                {children}
            </AppShell.Main>
        </AppShell>
    );
}
