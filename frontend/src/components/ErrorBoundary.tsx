import { Component, ErrorInfo, ReactNode } from 'react';
import { Container, Title, Text, Button, Group, Paper, ThemeIcon } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    private handleReload = () => {
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <Container size="sm" py={50}>
                    <Paper p="xl" radius="md" withBorder>
                        <Group justify="center" mb="md">
                            <ThemeIcon size={60} radius="xl" color="red" variant="light">
                                <IconAlertTriangle size={40} />
                            </ThemeIcon>
                        </Group>
                        <Title order={2} ta="center" mb="md">Something went wrong</Title>
                        <Text c="dimmed" ta="center" mb="xl">
                            We encountered an unexpected error. Please try reloading the page.
                        </Text>
                        {this.state.error && (
                            <Text c="red" size="sm" ta="center" mb="xl" style={{ fontFamily: 'monospace' }}>
                                {this.state.error.message}
                            </Text>
                        )}
                        <Group justify="center">
                            <Button onClick={this.handleReload} size="md">
                                Reload Page
                            </Button>
                        </Group>
                    </Paper>
                </Container>
            );
        }

        return this.props.children;
    }
}
