import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    Calendar,
    GraduationCap,
    LayoutDashboard,
    LogOut,
    MessageSquare,
    Settings,
    User as UserIcon,
    UserCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Toaster } from '@/Components/ui/sonner';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { motionEase } from '@/Components/Motion';

function Item({ href, active, icon: Icon, children, onClick }) {
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
                active ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800',
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
                active ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800',
            )}
        >
            <Icon className="h-5 w-5" />
            <span className="leading-none">{label}</span>
        </button>
    );
}

export default function AdminSidebar({ children }) {
    const { auth, school } = usePage().props;
    const [accountOpen, setAccountOpen] = useState(false);
    const reducedMotion = useReducedMotion();
    const isCurrent = (name) => route().current(name);

    const navigationGroups = [
        {
            label: 'Ringkasan',
            items: [
                { href: route('admin.dashboard'), name: 'admin.dashboard', icon: LayoutDashboard, label: 'Dashboard', mobileLabel: 'Dashboard' },
            ],
        },
        {
            label: 'Penerimaan Siswa (SPMB)',
            items: [
                { href: route('admin.periods.index'), name: 'admin.periods.*', icon: Calendar, label: 'Periode', mobileLabel: 'Periode' },
                { href: route('admin.registrations.index'), name: 'admin.registrations.*', icon: UserCheck, label: 'Data Pendaftar', mobileLabel: 'Pendaftar' },
                { href: route('admin.school-settings.edit'), name: 'admin.school-settings.*', icon: Settings, label: 'Pengaturan KOP', mobileLabel: 'KOP' },
            ],
        },
    ];

    const faqItem = { href: route('admin.faqs.index'), name: 'admin.faqs.*', icon: MessageSquare, label: 'Kelola FAQ Chatbot' };
    navigationGroups.push({ label: 'Bantuan SPMB', items: [faqItem] });

    const mobileItems = navigationGroups.slice(0, 2).flatMap((group) => group.items);
    const totalCols = mobileItems.length + 1; // + tab Akun

    return (
        <div className="spmb-admin-page min-h-screen bg-slate-50 text-slate-800">
            <Toaster richColors closeButton position="top-right" />

            <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-slate-200 lg:bg-white">
                <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500 text-slate-950">
                        <GraduationCap className="h-5 w-5" />
                    </span>
                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-blue-700">Admin SPMB</p>
                        <p className="text-xs font-semibold leading-tight">{school?.name}</p>
                    </div>
                </div>
                <nav className="sidebar-scroll flex-1 space-y-4 overflow-y-auto px-3 py-5">
                    {navigationGroups.map((group) => (
                        <div key={group.label} className="space-y-1">
                            <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                                {group.label}
                            </p>
                            {group.items.map((item) => (
                                <Item key={item.name} href={item.href} active={isCurrent(item.name)} icon={item.icon}>
                                    {item.label}
                                </Item>
                            ))}
                        </div>
                    ))}
                </nav>
                <div className="border-t border-slate-100 px-3 py-4">
                    <div className="mb-2 rounded-lg bg-slate-50 px-3 py-2">
                        <p className="text-sm font-medium">{auth?.user?.name}</p>
                        <p className="text-xs text-slate-500">{auth?.user?.phone}</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => router.post(route('logout'))}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                    >
                        <LogOut className="h-4 w-4" />
                        Keluar
                    </button>
                </div>
            </aside>

            {children}

            {/* Bottom nav (mobile) */}
            <nav
                className="fixed inset-x-0 bottom-0 z-30 grid border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_12px_-6px_rgba(15,23,42,0.12)] lg:hidden"
                style={{ gridTemplateColumns: `repeat(${totalCols}, minmax(0, 1fr))` }}
            >
                {mobileItems.map((item) => (
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
                            className="fixed inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-2xl bg-white pb-[env(safe-area-inset-bottom)] shadow-2xl"
                        >
                            <div className="flex justify-center pt-2">
                                <span className="h-1 w-10 rounded-full bg-slate-200" />
                            </div>
                            <div className="px-5 py-4">
                                <p className="text-xs uppercase tracking-widest text-slate-400">Akun</p>
                                <p className="mt-1 text-sm font-semibold text-slate-900">{auth?.user?.name ?? '-'}</p>
                                <p className="text-xs text-slate-500">{auth?.user?.phone ?? '-'}</p>
                            </div>
                            <div className="space-y-4 border-t border-slate-100 px-3 py-4">
                                <Link
                                    href={faqItem.href}
                                    onClick={() => setAccountOpen(false)}
                                    className={cn('flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium', isCurrent(faqItem.name) ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50')}
                                >
                                    <MessageSquare className="h-4 w-4" />
                                    {faqItem.label}
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
