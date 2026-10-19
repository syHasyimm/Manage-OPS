import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
    {
        variants: {
            variant: {
                default: 'border-transparent bg-blue-100 text-blue-800',
                secondary: 'border-transparent bg-secondary-soft text-secondary-foreground',
                destructive: 'border-transparent bg-red-100 text-red-800',
                success: 'border-transparent bg-accent-soft text-accent-foreground',
                warning: 'border-transparent bg-secondary-soft text-secondary-foreground',
                outline: 'border-slate-200 text-slate-900',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    },
);

function Badge({ className, variant, ...props }) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    );
}

export { Badge, badgeVariants };
