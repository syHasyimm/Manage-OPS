'use client';

import { Toaster as Sonner } from 'sonner';

const Toaster = ({ ...props }) => {
    return (
        <Sonner
            className="toaster group"
            toastOptions={{
                classNames: {
                    toast: 'group toast group-[.toaster]:bg-white group-[.toaster]:text-navy-950 group-[.toaster]:border-navy-100 group-[.toaster]:shadow-lg',
                    description: 'group-[.toast]:text-navy-500',
                    actionButton: 'group-[.toast]:bg-navy-900 group-[.toast]:text-white',
                    cancelButton: 'group-[.toast]:bg-navy-50 group-[.toast]:text-navy-700',
                },
            }}
            {...props}
        />
    );
};

export { Toaster };
