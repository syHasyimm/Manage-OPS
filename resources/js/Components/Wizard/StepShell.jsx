import { Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import Stepper from '@/Components/Wizard/Stepper';

/**
 * Wrapper konsisten untuk halaman wizard step.
 */
export default function StepShell({ title, description, currentStep, completedStep, children, footer }) {
    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="py-5">
                    <Stepper current={currentStep} completed={completedStep} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-col items-start gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <div className="min-w-0">
                        <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
                        {description && (
                            <p className="mt-1 text-sm text-navy-600">{description}</p>
                        )}
                    </div>
                    <Link
                        href={route('dashboard')}
                        className="shrink-0 text-xs font-medium text-navy-600 underline-offset-4 hover:underline"
                    >
                        Kembali ke Dashboard
                    </Link>
                </CardHeader>
                <CardContent>{children}</CardContent>
                {footer && <div className="border-t border-navy-100 px-4 py-4 sm:px-6">{footer}</div>}
            </Card>
        </div>
    );
}
