import { GraduationCap } from 'lucide-react';

export default function AdminLayout({ header, children }) {
    return (
        <div className="lg:pl-64">
            {/* Topbar (mobile) — brand only, no hamburger */}
            <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-navy-100 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-500 text-navy-950">
                    <GraduationCap className="h-4 w-4" />
                </span>
                <p className="text-sm font-semibold text-navy-900">Manage OPS</p>
            </header>

            {header && (
                <div className="border-b border-navy-100 bg-white">
                    <div className="mx-auto min-w-0 max-w-7xl px-4 py-5 sm:px-6 lg:px-8">{header}</div>
                </div>
            )}

            <main className="mx-auto max-w-7xl px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-6">
                {children}
            </main>
        </div>
    );
}
