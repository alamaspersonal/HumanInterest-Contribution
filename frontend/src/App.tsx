import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import { theme } from './theme';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
    return (
        <MantineProvider theme={theme}>
            <ErrorBoundary>
                <Layout>
                    <Dashboard />
                </Layout>
            </ErrorBoundary>
        </MantineProvider>
    );
}
