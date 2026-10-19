import '../css/fonts.css';
import '../css/app.css';
import '../css/motion.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { MotionProvider } from '@/Components/Motion';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: async (name) => {
        const page = await resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        );

        if (name.startsWith('Admin/')) {
            const { default: AdminSidebar } = await import('./Layouts/AdminSidebar');
            page.default.layout = page.default.layout || ((pageElement) => <AdminSidebar>{pageElement}</AdminSidebar>);
        }

        return page;
    },
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<MotionProvider><App {...props} /></MotionProvider>);
    },
    progress: {
        color: '#3B82F6',
    },
});
