'use client';

import { Toaster as Sonner } from 'sonner';

const Toaster = ({ ...props }) => {
    return (
        <Sonner
            className="toaster group"
            toastOptions={{
                classNames: {
                    toast: 'group toast group-[.toaster]:bg-white group-[.toaster]:text-slate-950 group-[.toaster]:border-slate-100 group-[.toaster]:shadow-lg',
                    description: 'group-[.toast]:text-slate-500',
                    actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-slate-950',
                    cancelButton: 'group-[.toast]:bg-slate-50 group-[.toast]:text-slate-700',
                },
            }}
            {...props}
        />
    );
};

export { Toaster };
