import { Link } from '@inertiajs/react';
import { GraduationCap } from 'lucide-react';
import { PageTransition } from '@/Components/Motion';

export default function GuestLayout({ children, title, subtitle }) {
    return (
        <div className="spmb-public-page min-h-screen bg-background">
            <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
                <Link href="/" className="motion-header public-focus mb-6 flex items-center gap-3 rounded-xl text-slate-800">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-slate-800">
                        <GraduationCap className="h-6 w-6" />
                    </span>
                    <span className="flex flex-col leading-tight">
                        <span className="text-xs uppercase tracking-widest text-blue-700">SPMB</span>
                        <span className="font-display text-base font-semibold">SD Negeri 001 Kepenuhan</span>
                    </span>
                </Link>

                <PageTransition className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_48px_-28px_rgba(30,41,59,0.2)]">
                    {(title || subtitle) && (
                        <div className="border-b border-blue-100 bg-blue-50 px-6 py-5">
                            {title && (
                                <h1 className="text-lg font-semibold text-slate-950">{title}</h1>
                            )}
                            {subtitle && (
                                <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
                            )}
                        </div>
                    )}
                    <div className="px-6 py-6">{children}</div>
                </PageTransition>

                <p className="mt-6 text-xs text-slate-500">
                    &copy; {new Date().getFullYear()} SD Negeri 001 Kepenuhan
                </p>
            </div>
        </div>
    );
}
