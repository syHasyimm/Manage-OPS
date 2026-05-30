import { Link } from '@inertiajs/react';
import { GraduationCap } from 'lucide-react';

export default function GuestLayout({ children, title, subtitle }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950">
            <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
                <Link href="/" className="mb-6 flex items-center gap-3 text-white">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-500 text-navy-950 shadow-lg">
                        <GraduationCap className="h-6 w-6" />
                    </span>
                    <span className="flex flex-col leading-tight">
                        <span className="text-xs uppercase tracking-widest text-gold-300">SPMB</span>
                        <span className="text-base font-semibold">SD Negeri 001 Kepenuhan</span>
                    </span>
                </Link>

                <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl">
                    {(title || subtitle) && (
                        <div className="border-b border-navy-100 bg-navy-50 px-6 py-5">
                            {title && (
                                <h1 className="text-lg font-semibold text-navy-950">{title}</h1>
                            )}
                            {subtitle && (
                                <p className="mt-1 text-sm text-navy-600">{subtitle}</p>
                            )}
                        </div>
                    )}
                    <div className="px-6 py-6">{children}</div>
                </div>

                <p className="mt-6 text-xs text-navy-200">
                    &copy; {new Date().getFullYear()} SD Negeri 001 Kepenuhan
                </p>
            </div>
        </div>
    );
}
