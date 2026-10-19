import { Link, router, usePage } from '@inertiajs/react';
import { FileText, GraduationCap, LayoutDashboard, LogOut, Shield, User as UserIcon } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Toaster } from '@/Components/ui/sonner';
import { PageTransition, motionEase } from '@/Components/Motion';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

function NavItem({ href, active, icon: Icon, children, onClick }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={cn(
                'motion-nav flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
            )}
        >
            <Icon className="h-4 w-4" />
            {children}
        </Link>
    );
}

function MobileTab({ href, active, icon: Icon, label, onClick }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={cn(
                'flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-colors',
                active ? 'text-blue-700' : 'text-slate-500 hover:text-slate-800',
            )}
        >
            <Icon className="h-5 w-5" />
            <span className="leading-none">{label}</span>
        </Link>
    );
}

function MobileTabButton({ active, icon: Icon, label, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-colors',
                active ? 'text-blue-700' : 'text-slate-500 hover:text-slate-800',
            )}
        >
            <Icon className="h-5 w-5" />
            <span className="leading-none">{label}</span>
        </button>
    );
}

export default function AppLayout({ header, children }) {
    const { auth, school } = usePage().props;
    const user = auth?.user;
    const [accountOpen, setAccountOpen] = useState(false);
    const reducedMotion = useReducedMotion();
    const isCurrent = (name) => route().current(name);

    const navItems = [
        { href: route('dashboard'), name: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', mobileLabel: 'Dashboard' },
        { href: route('registration.start'), name: 'registration.*', icon: FileText, label: 'Formulir Pendaftaran', mobileLabel: 'Formulir' },
        { href: route('profile.edit'), name: 'profile.edit', icon: UserIcon, label: 'Profil', mobileLabel: 'Profil' },
        ...(user?.role === 'admin'
            ? [{ href: route('admin.dashboard'), name: 'admin.*', icon: Shield, label: 'Panel Admin', mobileLabel: 'Admin' }]
            : []),
    ];

    const totalCols = navItems.length + 1; // + tab Akun

    return (
        <div className="spmb-public-page min-h-screen bg-background">
            <Toaster richColors closeButton position="top-right" />

            {/* Sidebar (desktop) */}
            <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-72 lg:flex-col lg:border-r lg:border-slate-200 lg:bg-white">
                <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-slate-800">
                        <GraduationCap className="h-5 w-5" />
                    </span>
                    <div>
                        <p className="text-xs uppercase tracking-widest text-blue-700">SPMB</p>
                        <p className="text-sm font-semibold leading-tight">{school?.name ?? 'SD Negeri 001 Kepenuhan'}</p>
                    </div>
                </div>
                <nav className="flex-1 space-y-1 px-4 py-6">
                    {navItems.map((item) => (
                        <NavItem key={item.name} href={item.href} active={isCurrent(item.name)} icon={item.icon}>
                            {item.label}
                        </NavItem>
                    ))}
                </nav>
                <div className="border-t border-slate-100 px-4 py-4">
                    <div className="mb-2 rounded-lg bg-slate-50 px-3 py-2">
                        <p className="text-sm font-medium text-slate-800">{user?.name}</p>
                        <p className="text-xs text-slate-500">{user?.phone}</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => router.post(route('logout'))}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                    >
                        <LogOut className="h-4 w-4" />
                        Keluar
                    </button>
                </div>
            </aside>

            <div className="lg:pl-72">
                {/* Topbar (mobile) — brand only, no hamburger */}
                <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-100 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-slate-800">
                        <GraduationCap className="h-4 w-4" />
                    </span>
                    <p className="text-sm font-semibold text-slate-900">{school?.name ?? 'SPMB'}</p>
                </header>

                {header && (
                    <div className="border-b border-slate-100 bg-white">
                        <PageTransition className="mx-auto min-w-0 max-w-6xl px-4 py-5 sm:px-6 lg:px-8">{header}</PageTransition>
                    </div>
                )}

                <PageTransition as="main" distance={0} className="mx-auto max-w-6xl px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-6">
                    {children}
                </PageTransition>
            </div>

            {/* Bottom nav (mobile) */}
            <nav
                className="fixed inset-x-0 bottom-0 z-30 grid border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_12px_-6px_rgba(15,23,42,0.12)] lg:hidden"
                style={{ gridTemplateColumns: `repeat(${totalCols}, minmax(0, 1fr))` }}
            >
                {navItems.map((item) => (
                    <MobileTab
                        key={item.name}
                        href={item.href}
                        active={isCurrent(item.name)}
                        icon={item.icon}
                        label={item.mobileLabel ?? item.label}
                    />
                ))}
                <MobileTabButton
                    active={accountOpen}
                    icon={UserIcon}
                    label="Akun"
                    onClick={() => setAccountOpen(true)}
                />
            </nav>

            {/* Account bottom sheet (mobile) */}
            <AnimatePresence>
                {accountOpen && (
                    <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: reducedMotion ? 0 : 0.2 }}
                            className="fixed inset-0 bg-slate-950/40"
                            onClick={() => setAccountOpen(false)}
                        />
                        <motion.div
                            initial={reducedMotion ? false : { y: 48, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: reducedMotion ? 0 : 32, opacity: 0 }}
                            transition={{ duration: reducedMotion ? 0 : 0.28, ease: motionEase }}
                            className="fixed inset-x-0 bottom-0 rounded-t-2xl bg-white pb-[env(safe-area-inset-bottom)] shadow-2xl"
                        >
                            <div className="flex justify-center pt-2">
                                <span className="h-1 w-10 rounded-full bg-slate-200" />
                            </div>
                            <div className="px-5 py-4">
                                <p className="text-xs uppercase tracking-widest text-slate-400">Akun</p>
                                <p className="mt-1 text-sm font-semibold text-slate-900">{user?.name ?? '-'}</p>
                                <p className="text-xs text-slate-500">{user?.phone ?? '-'}</p>
                            </div>
                            <div className="border-t border-slate-100 px-3 py-2">
                                <Link
                                    href={route('profile.edit')}
                                    onClick={() => setAccountOpen(false)}
                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                >
                                    <UserIcon className="h-4 w-4" />
                                    Profil
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setAccountOpen(false);
                                        router.post(route('logout'));
                                    }}
                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Keluar
                                </button>
                            </div>
                            <div className="border-t border-slate-100 px-3 py-2">
                                <button
                                    type="button"
                                    onClick={() => setAccountOpen(false)}
                                    className="flex w-full items-center justify-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50"
                                >
                                    Tutup
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
