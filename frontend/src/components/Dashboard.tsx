import { SimpleGrid, Title, Text, Box } from '@mantine/core';
import { ContributionWidget } from './ContributionWidget';
import { YTDWidget } from './YTDWidget';
import { ImpactWidget } from './ImpactWidget';
import { useState } from 'react';

export function Dashboard() {
    const [refreshKey, setRefreshKey] = useState(0);
    const [proposedRate, setProposedRate] = useState<number | string>(5);
    const [proposedType, setProposedType] = useState<string>('PERCENTAGE');

    const handleUpdate = () => {
        setRefreshKey(prev => prev + 1);
    };

    return (
        <Box>
            <Box mb="xl">
                <Title order={2}>Welcome Back, Alex</Title>
                <Text c="dimmed">Here's an overview of your retirement savings.</Text>
            </Box>

            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
                <ContributionWidget
                    onUpdate={handleUpdate}
                    onRateChange={setProposedRate}
                    onTypeChange={setProposedType}
                />
                <Box>
                    <SimpleGrid cols={1} spacing="lg">
                        <YTDWidget refreshKey={refreshKey} />
                        <ImpactWidget
                            refreshKey={refreshKey}
                            proposedRate={Number(proposedRate)}
                            proposedType={proposedType}
                        />
                    </SimpleGrid>
                </Box>
            </SimpleGrid>
        </Box>
    );
}
