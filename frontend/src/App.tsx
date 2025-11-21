import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import { theme } from './theme';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';

export default function App() {
    return (
        <MantineProvider theme={theme}>
            <Layout>
                <Dashboard />
            </Layout>
        </MantineProvider>
    );
}
