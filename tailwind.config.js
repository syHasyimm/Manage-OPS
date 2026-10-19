import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';
import animate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Manrope', ...defaultTheme.fontFamily.sans],
                display: ['Plus Jakarta Sans', 'Manrope', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                primary: '#3B82F6',
                secondary: {
                    DEFAULT: 'rgb(var(--color-secondary) / <alpha-value>)',
                    soft: 'rgb(var(--color-secondary-soft) / <alpha-value>)',
                    foreground: 'rgb(var(--color-secondary-foreground) / <alpha-value>)',
                },
                accent: {
                    DEFAULT: 'rgb(var(--color-accent) / <alpha-value>)',
                    soft: 'rgb(var(--color-accent-soft) / <alpha-value>)',
                    foreground: 'rgb(var(--color-accent-foreground) / <alpha-value>)',
                },
                danger: '#EF4444',
                background: 'rgb(var(--color-background) / <alpha-value>)',
                foreground: '#1E293B',
                ring: '#3B82F6',
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' },
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' },
                },
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
            },
        },
    },

    plugins: [forms, animate],
};
