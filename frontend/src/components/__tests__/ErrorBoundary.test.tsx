import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';
import { vi } from 'vitest';
import { MantineProvider } from '@mantine/core';

// Wrapper for Mantine components
const renderWithMantine = (component: React.ReactNode) => {
    return render(
        <MantineProvider>
            {component}
        </MantineProvider>
    );
};

// Component that throws an error to test the boundary
const Bomb = ({ shouldThrow }: { shouldThrow: boolean }) => {
    if (shouldThrow) {
        throw new Error('Boom!');
    }
    return <div>All good</div>;
};

describe('ErrorBoundary', () => {
    // Prevent console.error from cluttering the test output
    const originalError = console.error;
    beforeAll(() => {
        console.error = vi.fn();

        // Mock matchMedia for Mantine
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: vi.fn().mockImplementation(query => ({
                matches: false,
                media: query,
                onchange: null,
                addListener: vi.fn(), // deprecated
                removeListener: vi.fn(), // deprecated
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            })),
        });
    });

    afterAll(() => {
        console.error = originalError;
    });

    it('should render children when no error occurs', () => {
        renderWithMantine(
            <ErrorBoundary>
                <Bomb shouldThrow={false} />
            </ErrorBoundary>
        );
        expect(screen.getByText('All good')).toBeInTheDocument();
    });

    it('should render fallback UI when an error occurs', () => {
        renderWithMantine(
            <ErrorBoundary>
                <Bomb shouldThrow={true} />
            </ErrorBoundary>
        );

        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
        expect(screen.getByText('Boom!')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Reload Page/i })).toBeInTheDocument();
    });

    it('should reload page when reload button is clicked', () => {
        // Mock window.location.reload
        const reloadMock = vi.fn();
        Object.defineProperty(window, 'location', {
            configurable: true,
            value: { reload: reloadMock },
        });

        renderWithMantine(
            <ErrorBoundary>
                <Bomb shouldThrow={true} />
            </ErrorBoundary>
        );

        fireEvent.click(screen.getByRole('button', { name: /Reload Page/i }));
        expect(reloadMock).toHaveBeenCalled();
    });
});
