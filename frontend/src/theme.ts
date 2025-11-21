import { createTheme } from '@mantine/core';

export const theme = createTheme({
    primaryColor: 'brand-blue',
    colors: {
        'brand-blue': [
            '#e5f4ff',
            '#cce6ff',
            '#99caff',
            '#66adff',
            '#3391ff',
            '#0077ff', // Primary Brand Color
            '#005fcc',
            '#004799',
            '#003066',
            '#001833',
        ],
        'brand-navy': [
            '#e6e8eb',
            '#cdcfd4',
            '#9b9fa8',
            '#696f7c',
            '#373f50',
            '#00234b', // Secondary Brand Color
            '#001c3c',
            '#00152d',
            '#000e1e',
            '#00070f',
        ],
    },
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
    headings: {
        fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
        fontWeight: '700',
    },
    shadows: {
        md: '0 4px 20px rgba(0, 0, 0, 0.08)',
        xl: '0 8px 30px rgba(0, 0, 0, 0.12)',
    },
    components: {
        Button: {
            defaultProps: {
                radius: 'md',
                fw: 600,
            },
        },
        Card: {
            defaultProps: {
                radius: 'lg',
                shadow: 'md',
                withBorder: true,
            },
        },
        Paper: {
            defaultProps: {
                radius: 'lg',
                shadow: 'md',
                withBorder: true,
            },
        },
        TextInput: {
            defaultProps: {
                radius: 'md',
                size: 'md',
            },
            styles: {
                input: {
                    backgroundColor: 'var(--mantine-color-body)',
                },
            },
        },
        NumberInput: {
            defaultProps: {
                radius: 'md',
                size: 'md',
            },
            styles: {
                input: {
                    backgroundColor: 'var(--mantine-color-body)',
                },
            },
        },
        Select: {
            defaultProps: {
                radius: 'md',
                size: 'md',
            },
        },
    },
});
