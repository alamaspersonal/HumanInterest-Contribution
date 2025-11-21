import { AppShell, Group, Text, Avatar, Box, ActionIcon, useMantineColorScheme, useComputedColorScheme } from '@mantine/core';
import { IconCoin, IconSun, IconMoon } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { api } from '../services/api';

export function Layout({ children }: { children: React.ReactNode }) {
    const { setColorScheme } = useMantineColorScheme();
    const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
    const [userName, setUserName] = useState('User');
    const [userInitials, setUserInitials] = useState('U');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const user = await api.getUser();
                setUserName(user.name);
                const initials = user.name.split(' ').map((n: string) => n[0]).join('');
                setUserInitials(initials);
            } catch (error) {
                console.error('Failed to fetch user', error);
            }
        };
        fetchUser();
    }, []);

    return (
        <AppShell
            header={{ height: 60 }}
            padding="md"
            bg={computedColorScheme === 'dark' ? 'dark.8' : 'gray.0'}
        >
            <AppShell.Header>
                <Group h="100%" px="md" justify="space-between">
                    <Group gap="xs">
                        <IconCoin size={30} color="#0077ff" />
                        <Text fw={700} size="xl" c="brand-navy.5">RetireSmart</Text>
                    </Group>
                    <Group>
                        <ActionIcon
                            onClick={() => setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')}
                            variant="default"
                            size="lg"
                            aria-label="Toggle color scheme"
                        >
                            {computedColorScheme === 'light' ? <IconMoon size="1.2rem" /> : <IconSun size="1.2rem" />}
                        </ActionIcon>
                        <Avatar src={null} alt="User" color="brand-blue" radius="xl">{userInitials}</Avatar>
                        <Box visibleFrom="xs">
                            <Text size="sm" fw={500}>{userName}</Text>
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
