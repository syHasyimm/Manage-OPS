import { Link, usePage } from '@inertiajs/react';
import { GraduationCap, LayoutDashboard, LogIn, Search } from 'lucide-react';
import { Button } from '@/Components/ui/button';

const navigation = [
    { label: 'Alur', href: '#alur' },
    { label: 'Persyaratan', href: '#persyaratan' },
    { label: 'Setelah mendaftar', href: '#status' },
];

export default function LandingHeader({ canLogin }) {
    const { auth, school } = usePage().props;
    const schoolName = school?.name ?? 'SD Negeri 001 Kepenuhan';
    const dashboardRoute = auth?.user?.role === 'admin'
        ? 'admin.dashboard'
        : 'dashboard';

    return (
        <header className="sticky top-0 z-50 border-b border-white/10 bg-[#071827]/95 backdrop-blur-xl">
            <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                <a
                    href="#spmb"
                    className="group flex min-w-0 items-center gap-3 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-300"
                >
                    {school?.logo_url ? (
                        <img
                            src={school.logo_url}
                            alt={`Logo ${schoolName}`}
                            className="h-10 w-10 shrink-0 rounded-full bg-white p-1 object-contain ring-1 ring-white/20"
                        />
                    ) : (
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold-300 text-navy-950">
                            <GraduationCap className="h-5 w-5" />
                        </span>
                    )}

                    <span className="min-w-0 leading-tight">
                        <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gold-300">
                            Portal SPMB
                        </span>
                        <span className="block max-w-[12rem] truncate text-sm font-bold text-white sm:max-w-xs">
                            {schoolName}
                        </span>
                    </span>
                </a>

                <nav aria-label="Navigasi SPMB" className="hidden items-center gap-1 lg:flex">
                    {navigation.map((item) => (
                        <a
                            key={item.href}
                            href={item.href}
                            className="rounded-lg px-3 py-2 text-sm font-semibold text-navy-200 transition-colors hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-300"
                        >
                            {item.label}
                        </a>
                    ))}
                </nav>

                <div className="flex items-center gap-2">
                    <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="text-navy-100 hover:bg-white/10 hover:text-white"
                    >
                        <Link href="/cek-status" aria-label="Cek status pendaftaran">
                            <Search className="h-4 w-4 text-gold-300" />
                            <span className="hidden sm:inline">Cek status</span>
                        </Link>
                    </Button>

                    {auth?.user ? (
                        <Button
                            asChild
                            size="sm"
                            className="bg-gold-300 font-bold text-navy-950 hover:bg-gold-200"
                        >
                            <Link href={route(dashboardRoute)}>
                                <LayoutDashboard className="h-4 w-4" />
                                <span className="hidden sm:inline">Dashboard</span>
                            </Link>
                        </Button>
                    ) : (
                        canLogin && (
                            <Button
                                asChild
                                size="sm"
                                className="bg-gold-300 font-bold text-navy-950 hover:bg-gold-200"
                            >
                                <Link href={route('login')}>
                                    <LogIn className="h-4 w-4" />
                                    <span className="hidden sm:inline">Masuk</span>
                                </Link>
                            </Button>
                        )
                    )}
                </div>
            </div>
        </header>
    );
}
