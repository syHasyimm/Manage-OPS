import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
    { id: 1, label: 'Identitas Murid' },
    { id: 2, label: 'Data Periodik' },
    { id: 3, label: 'Orang Tua / Wali' },
];

export default function Stepper({ current, completed = 0 }) {
    return (
        <ol className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-0">
            {STEPS.map((step, idx) => {
                const isDone = completed >= step.id || current > step.id;
                const isCurrent = current === step.id;
                const stateClass = isDone
                    ? 'bg-gold-500 text-navy-950 ring-gold-500'
                    : isCurrent
                    ? 'bg-navy-900 text-white ring-navy-900'
                    : 'bg-white text-navy-400 ring-navy-200';

                return (
                    <li key={step.id} className="flex flex-1 items-center gap-3 min-w-0">
                        <div
                            className={cn(
                                'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ring-2 transition-colors',
                                stateClass,
                            )}
                        >
                            {isDone ? <Check className="h-4 w-4" /> : step.id}
                        </div>
                        <div className="flex min-w-0 flex-col">
                            <span className="text-[10px] uppercase tracking-wide text-navy-500 sm:text-xs">
                                Langkah {step.id}
                            </span>
                            <span
                                className={cn(
                                    'truncate text-xs font-medium sm:text-sm',
                                    isCurrent ? 'text-navy-900' : 'text-navy-700',
                                )}
                            >
                                {step.label}
                            </span>
                        </div>
                        {idx < STEPS.length - 1 && (
                            <div
                                className={cn(
                                    'mx-2 hidden h-px flex-1 sm:block',
                                    isDone ? 'bg-gold-400' : 'bg-navy-200',
                                )}
                            />
                        )}
                    </li>
                );
            })}
        </ol>
    );
}
