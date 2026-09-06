import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    GraduationCap,
    Menu,
    X,
    Search,
    LogIn,
    LayoutDashboard,
    Sparkles,
    Phone,
    MapPin,
} from 'lucide-react';
import { Button } from '@/Components/ui/button';

export default function LandingHeader({ canLogin, canRegister, period }) {
    const { auth, school } = usePage().props;
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { href: '#beranda', label: 'Beranda' },
        { href: '#profil', label: 'Profil' },
        { href: '#program', label: 'Keunggulan' },
        { href: '#fasilitas', label: 'Fasilitas' },
        { href: '#guru', label: 'Dewan Guru' },
        { href: '#agenda', label: 'Agenda' },
        { href: '#spmb', label: 'SPMB', highlight: true },
        { href: '#kontak', label: 'Kontak' },
    ];

    const schoolName = school?.name ?? 'SD Negeri 001 Kepenuhan';

    return (
        <header
            className={`sticky top-0 z-50 transition-all duration-300 ${
                scrolled
                    ? 'bg-navy-950/95 backdrop-blur-md shadow-lg shadow-navy-950/20 border-b border-navy-800/80 py-2.5'
                    : 'bg-navy-950/90 backdrop-blur-sm border-b border-white/10 py-3.5'
            }`}
        >
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                {/* Logo & Brand */}
                <a href="#beranda" className="group flex items-center gap-3 focus:outline-none">
                    {school?.logo_url ? (
                        <img
                            src={school.logo_url}
                            alt={schoolName}
                            className="h-10 w-10 object-contain rounded-full bg-white/10 p-1 ring-2 ring-gold-400/40 group-hover:ring-gold-400 transition-all"
                        />
                    ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 text-navy-950 font-bold shadow-md shadow-gold-500/20 group-hover:scale-105 transition-transform">
                            <GraduationCap className="h-6 w-6" />
                        </div>
                    )}
                    <div className="leading-tight">
                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gold-400">
                                Sekolah Dasar Negeri
                            </span>
                            <span className="inline-block h-1 w-1 rounded-full bg-gold-400"></span>
                            <span className="text-[10px] font-medium text-navy-200">Kec. {school?.district ?? 'Kepenuhan'}</span>
                        </div>
                        <p className="text-base font-bold text-white tracking-tight group-hover:text-gold-300 transition-colors">
                            {schoolName}
                        </p>
                    </div>
                </a>

                {/* Desktop Navigation */}
                <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
                    {navLinks.map((item) => (
                        <a
                            key={item.href}
                            href={item.href}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                                item.highlight
                                    ? 'bg-gold-500/15 text-gold-300 border border-gold-400/30 hover:bg-gold-500 hover:text-navy-950 hover:border-gold-500'
                                    : 'text-navy-100 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {item.label}
                        </a>
                    ))}
                </nav>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                    <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="hidden sm:inline-flex text-navy-200 hover:text-white hover:bg-white/10 text-xs font-medium"
                    >
                        <Link href="/cek-status" className="flex items-center gap-1.5">
                            <Search className="h-3.5 w-3.5 text-gold-400" />
                            <span>Cek Status</span>
                        </Link>
                    </Button>

                    {auth?.user ? (
                        <Button
                            asChild
                            size="sm"
                            className="bg-gold-500 text-navy-950 hover:bg-gold-400 font-semibold shadow-sm text-xs"
                        >
                            <Link href={route(auth.user?.role === 'admin' ? 'admin.dashboard' : 'dashboard')}>
                                <LayoutDashboard className="mr-1.5 h-3.5 w-3.5" />
                                <span>Dashboard</span>
                            </Link>
                        </Button>
                    ) : (
                        canLogin && (
                            <Button
                                asChild
                                size="sm"
                                variant="outline"
                                className="border-gold-500/40 text-gold-300 hover:bg-gold-500/10 hover:text-gold-200 text-xs font-semibold"
                            >
                                <Link href={route('login')}>
                                    <LogIn className="mr-1.5 h-3.5 w-3.5" />
                                    <span>Masuk</span>
                                </Link>
                            </Button>
                        )
                    )}

                    {/* Mobile Menu Trigger */}
                    <button
                        type="button"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="lg:hidden inline-flex items-center justify-center p-2 rounded-lg text-navy-200 hover:text-white hover:bg-white/10 focus:outline-none"
                        aria-label="Toggle Navigation Menu"
                    >
                        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            {mobileOpen && (
                <div className="lg:hidden border-t border-white/10 bg-navy-950/98 px-4 pt-3 pb-5 space-y-2 mt-2 backdrop-blur-xl">
                    <div className="grid grid-cols-2 gap-1.5 py-2">
                        {navLinks.map((item) => (
                            <a
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                                    item.highlight
                                        ? 'bg-gold-500/20 text-gold-300 font-bold border border-gold-400/30'
                                        : 'text-navy-100 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                {item.label}
                            </a>
                        ))}
                    </div>

                    <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="w-full justify-center border-white/20 text-white hover:bg-white/10 text-xs"
                        >
                            <Link href="/cek-status" onClick={() => setMobileOpen(false)}>
                                <Search className="mr-2 h-3.5 w-3.5 text-gold-400" />
                                Cek Status Pendaftaran
                            </Link>
                        </Button>
                        {auth?.user ? (
                            <Button
                                asChild
                                size="sm"
                                className="w-full justify-center bg-gold-500 text-navy-950 hover:bg-gold-400 text-xs font-semibold"
                            >
                                <Link
                                    href={route(auth.user?.role === 'admin' ? 'admin.dashboard' : 'dashboard')}
                                    onClick={() => setMobileOpen(false)}
                                >
                                    <LayoutDashboard className="mr-2 h-3.5 w-3.5" />
                                    Ke Dashboard
                                </Link>
                            </Button>
                        ) : (
                            canLogin && (
                                <Button
                                    asChild
                                    size="sm"
                                    className="w-full justify-center bg-gold-500 text-navy-950 hover:bg-gold-400 text-xs font-semibold"
                                >
                                    <Link href={route('login')} onClick={() => setMobileOpen(false)}>
                                        <LogIn className="mr-2 h-3.5 w-3.5" />
                                        Masuk Akun
                                    </Link>
                                </Button>
                            )
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
