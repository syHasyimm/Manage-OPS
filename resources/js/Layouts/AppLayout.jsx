import { Link, router, usePage } from '@inertiajs/react';
import { GraduationCap, LayoutDashboard, FileText, LogOut, User as UserIcon, Menu, Shield, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Toaster } from '@/Components/ui/sonner';

function NavItem({ href, active, icon: Icon, children, onClick }) {
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

export default function AppLayout({ header, children }) {
    const { auth, school } = usePage().props;
    const user = auth?.user;
    const [open, setOpen] = useState(false);
    const close = () => setOpen(false);
    const isCurrent = (name) => route().current(name);

    const navItems = [
        { href: route('dashboard'), name: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { href: route('registration.start'), name: 'registration.*', icon: FileText, label: 'Formulir Pendaftaran' },
        { href: route('profile.edit'), name: 'profile.edit', icon: UserIcon, label: 'Profil' },
        ...(user?.role === 'admin'
            ? [{ href: route('admin.dashboard'), name: 'admin.*', icon: Shield, label: 'Panel Admin' }]
            : []),
    ];

    return (
        <div className="min-h-screen bg-navy-50">
            <Toaster richColors closeButton position="top-right" />

            {/* Sidebar (desktop) */}
            <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-72 lg:flex-col lg:bg-navy-900 lg:text-white">
                <div className="flex items-center gap-3 border-b border-navy-800 px-6 py-5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-500 text-navy-950">
                        <GraduationCap className="h-5 w-5" />
                    </span>
                    <div>
                        <p className="text-xs uppercase tracking-widest text-gold-300">SPMB</p>
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
                <div className="border-t border-navy-800 px-4 py-4">
                    <div className="mb-2 rounded-lg bg-navy-800/60 px-3 py-2">
                        <p className="text-sm font-medium text-white">{user?.name}</p>
                        <p className="text-xs text-navy-200">{user?.phone}</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => router.post(route('logout'))}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-navy-100 transition-colors hover:bg-navy-800 hover:text-white"
                    >
                        <LogOut className="h-4 w-4" />
                        Keluar
                    </button>
                </div>
            </aside>

            {/* Mobile drawer */}
            {open && (
                <div className="fixed inset-0 z-40 flex lg:hidden">
                    <div className="fixed inset-0 bg-navy-950/60" onClick={close} />
                    <aside className="relative flex w-72 max-w-full flex-col bg-navy-900 text-white">
                        <div className="flex items-center justify-between border-b border-navy-800 px-5 py-4">
                            <p className="text-sm font-semibold">{school?.name}</p>
                            <button onClick={close} className="text-navy-200 hover:text-white">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <nav className="flex-1 space-y-1 px-3 py-4">
                            {navItems.map((item) => (
                                <NavItem key={item.name} href={item.href} active={isCurrent(item.name)} icon={item.icon} onClick={close}>
                                    {item.label}
                                </NavItem>
                            ))}
                        </nav>
                        <div className="border-t border-navy-800 px-3 py-4">
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
                </div>
            )}

            <div className="lg:pl-72">
                {/* Topbar (mobile) */}
                <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-navy-100 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
                    <button onClick={() => setOpen(true)} className="rounded-md p-2 text-navy-700 hover:bg-navy-50">
                        <Menu className="h-5 w-5" />
                    </button>
                    <p className="text-sm font-semibold text-navy-900">{school?.name}</p>
                </header>

                {header && (
                    <div className="border-b border-navy-100 bg-white">
                        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8">{header}</div>
                    </div>
                )}

                <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
            </div>
        </div>
    );
}
