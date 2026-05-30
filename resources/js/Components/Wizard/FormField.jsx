import { cn } from '@/lib/utils';
import { Label } from '@/Components/ui/label';

export default function FormField({
    label,
    htmlFor,
    required = false,
    error,
    hint,
    className,
    children,
}) {
    return (
        <div className={cn('space-y-1.5', className)}>
            {label && (
                <Label htmlFor={htmlFor}>
                    {label}
                    {required && <span className="ml-0.5 text-red-600">*</span>}
                </Label>
            )}
            {children}
            {hint && !error && <p className="text-xs text-navy-500">{hint}</p>}
            {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
    );
}
