import { Link, usePage } from '@inertiajs/react';
import { GraduationCap, LayoutDashboard, LogIn, Search } from 'lucide-react';
import { Button } from '@/Components/ui/button';

export default function LandingHeader({ canLogin }) {
    const { auth, school } = usePage().props;
    const schoolName = school?.name ?? 'SD Negeri 001 Kepenuhan';

    return (
        <header className="landing-header landing-header--scrolled sticky top-0 z-50 border-b border-white/10 bg-navy-950/95 py-3 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
                <a
                    href="#spmb"
                    className="group flex min-w-0 items-center gap-3 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
                >
                    {school?.logo_url ? (
                        <img
                            src={school.logo_url}
                            alt={`Logo ${schoolName}`}
                            className="h-10 w-10 shrink-0 rounded-full bg-white/10 p-1 object-contain ring-2 ring-gold-400/40 transition-all group-hover:ring-gold-400"
                        />
                    ) : (
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-500 text-navy-950 shadow-md shadow-gold-500/20 transition-transform group-hover:-translate-y-0.5">
                            <GraduationCap className="h-6 w-6" />
                        </span>
                    )}

                    <span className="hidden min-w-0 leading-tight sm:block">
                        <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-400">
                            Portal SPMB
                        </span>
                        <span className="block truncate text-sm font-bold tracking-tight text-white lg:text-base">
                            {schoolName}
                        </span>
                    </span>
                </a>

                <nav aria-label="Navigasi SPMB" className="flex items-center gap-1.5 sm:gap-2">
                    <a
                        href="#spmb"
                        className="hidden rounded-lg px-3 py-2 text-xs font-semibold text-navy-100 transition-colors hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 lg:inline-flex"
                    >
                        Informasi SPMB
                    </a>

                    <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="text-navy-100 hover:bg-white/10 hover:text-white"
                    >
                        <Link href="/cek-status" className="flex items-center gap-1.5">
                            <Search className="h-3.5 w-3.5 text-gold-400" />
                            <span className="hidden sm:inline">Cek status</span>
                        </Link>
                    </Button>

                    {auth?.user ? (
                        <Button
                            asChild
                            size="sm"
                            className="bg-gold-500 font-semibold text-navy-950 shadow-sm hover:bg-gold-400 active:translate-y-px"
                        >
                            <Link href={route(auth.user?.role === 'admin' ? 'admin.dashboard' : 'dashboard')}>
                                <LayoutDashboard className="mr-1.5 h-3.5 w-3.5" />
                                Dashboard
                            </Link>
                        </Button>
                    ) : (
                        canLogin && (
                            <Button
                                asChild
                                size="sm"
                                className="bg-gold-500 font-semibold text-navy-950 shadow-sm hover:bg-gold-400 active:translate-y-px"
                            >
                                <Link href={route('login')}>
                                    <LogIn className="mr-1.5 h-3.5 w-3.5" />
                                    Masuk
                                </Link>
                            </Button>
                        )
                    )}
                </nav>
            </div>
        </header>
    );
}
