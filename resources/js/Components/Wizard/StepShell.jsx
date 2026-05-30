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
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                    <div>
                        <CardTitle>{title}</CardTitle>
                        {description && (
                            <p className="mt-1 text-sm text-navy-600">{description}</p>
                        )}
                    </div>
                    <Link
                        href={route('dashboard')}
                        className="text-xs font-medium text-navy-600 underline-offset-4 hover:underline"
                    >
                        Kembali ke Dashboard
                    </Link>
                </CardHeader>
                <CardContent>{children}</CardContent>
                {footer && <div className="border-t border-navy-100 px-6 py-4">{footer}</div>}
            </Card>
        </div>
    );
}
