import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, useReducedMotion } from 'motion/react';

const STEPS = [
    { id: 1, label: 'Identitas Murid' },
    { id: 2, label: 'Data Periodik' },
    { id: 3, label: 'Orang Tua / Wali' },
];

export default function Stepper({ current, completed = 0 }) {
    const reducedMotion = useReducedMotion();
    return (
        <ol className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-0">
            {STEPS.map((step, idx) => {
                const isDone = completed >= step.id || current > step.id;
                const isCurrent = current === step.id;
                const stateClass = isDone
                    ? 'bg-accent text-slate-950 ring-accent'
                    : isCurrent
                    ? 'bg-primary text-slate-950 ring-primary'
                    : 'bg-white text-slate-400 ring-slate-200';

                return (
                    <li key={step.id} aria-current={isCurrent ? 'step' : undefined} className="flex flex-1 items-center gap-3 min-w-0">
                        <div
                            className={cn(
                                'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ring-2 transition-colors',
                                stateClass,
                            )}
                        >
                            <motion.span
                                key={isDone ? 'done' : isCurrent ? 'current' : 'pending'}
                                className="flex items-center justify-center"
                                initial={reducedMotion ? false : { opacity: 0, scale: 0.65 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ type: 'spring', stiffness: 380, damping: 24 }}
                            >
                                {isDone ? <Check className="h-4 w-4" /> : step.id}
                            </motion.span>
                        </div>
                        <div className="flex min-w-0 flex-col">
                            <span className="text-[10px] uppercase tracking-wide text-slate-500 sm:text-xs">
                                Langkah {step.id}
                            </span>
                            <span
                                className={cn(
                                    'truncate text-xs font-medium sm:text-sm',
                                    isCurrent ? 'text-slate-900' : 'text-slate-700',
                                )}
                            >
                                {step.label}
                            </span>
                        </div>
                        {idx < STEPS.length - 1 && (
                            <motion.div
                                initial={reducedMotion ? false : { scaleX: 0 }}
                                whileInView={{ scaleX: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: reducedMotion ? 0 : 0.4, delay: reducedMotion ? 0 : idx * 0.08 }}
                                className={cn(
                                    'mx-2 hidden h-px flex-1 origin-left sm:block',
                                    isDone ? 'bg-accent' : 'bg-slate-200',
                                )}
                            />
                        )}
                    </li>
                );
            })}
        </ol>
    );
}
