import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    BarChart3,
    Calendar,
    GraduationCap,
    LayoutDashboard,
    LogOut,
    Menu,
    Users,
    UserCheck,
    X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Toaster } from '@/Components/ui/sonner';

function Item({ href, active, icon: Icon, children, onClick }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active
                    ? 'bg-gold-500 text-navy-950 shadow-sm'
                    : 'text-navy-100 hover:bg-navy-800 hover:text-white',
            )}
        >
            <Icon className="h-4 w-4" />
            {children}
        </Link>
    );
}

export default function AdminLayout({ header, children }) {
    const { auth, school } = usePage().props;
    const [open, setOpen] = useState(false);
    const close = () => setOpen(false);
    const isCurrent = (name) => route().current(name);

    const items = [
        { href: route('admin.dashboard'), name: 'admin.dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { href: route('admin.registrations.index'), name: 'admin.registrations.*', icon: UserCheck, label: 'Pendaftar' },
        { href: route('admin.periods.index'), name: 'admin.periods.*', icon: Calendar, label: 'Periode' },
        { href: route('admin.users.index'), name: 'admin.users.*', icon: Users, label: 'Pengguna' },
    ];

    return (
        <div className="min-h-screen bg-navy-50">
            <Toaster richColors closeButton position="top-right" />

            <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-64 lg:flex-col lg:bg-navy-950 lg:text-white">
                <div className="flex items-center gap-3 border-b border-navy-800 px-5 py-4">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-500 text-navy-950">
                        <GraduationCap className="h-5 w-5" />
                    </span>
                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-gold-400">Admin Panel</p>
                        <p className="text-xs font-semibold leading-tight">{school?.name}</p>
                    </div>
                </div>
                <nav className="flex-1 space-y-1 px-3 py-5">
                    {items.map((item) => (
                        <Item key={item.name} href={item.href} active={isCurrent(item.name)} icon={item.icon}>
                            {item.label}
                        </Item>
                    ))}
                </nav>
                <div className="border-t border-navy-800 px-3 py-4">
                    <div className="mb-2 rounded-lg bg-navy-900/60 px-3 py-2">
                        <p className="text-sm font-medium">{auth?.user?.name}</p>
                        <p className="text-xs text-navy-300">{auth?.user?.phone}</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => router.post(route('logout'))}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-navy-100 hover:bg-navy-800"
                    >
                        <LogOut className="h-4 w-4" />
                        Keluar
                    </button>
                </div>
            </aside>

            {open && (
                <div className="fixed inset-0 z-40 flex lg:hidden">
                    <div className="fixed inset-0 bg-navy-950/60" onClick={close} />
                    <aside className="relative flex w-64 max-w-full flex-col bg-navy-950 text-white">
                        <div className="flex items-center justify-between border-b border-navy-800 px-4 py-3">
                            <p className="text-sm font-semibold">Admin Panel</p>
                            <button onClick={close} className="text-navy-200 hover:text-white">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <nav className="flex-1 space-y-1 px-3 py-4">
                            {items.map((item) => (
                                <Item key={item.name} href={item.href} active={isCurrent(item.name)} icon={item.icon} onClick={close}>
                                    {item.label}
                                </Item>
                            ))}
                        </nav>
                    </aside>
                </div>
            )}

            <div className="lg:pl-64">
                <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-navy-100 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
                    <button onClick={() => setOpen(true)} className="rounded-md p-2 text-navy-700 hover:bg-navy-50">
                        <Menu className="h-5 w-5" />
                    </button>
                    <p className="text-sm font-semibold text-navy-900">Admin Panel</p>
                </header>

                {header && (
                    <div className="border-b border-navy-100 bg-white">
                        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">{header}</div>
                    </div>
                )}

                <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
            </div>
        </div>
    );
}
