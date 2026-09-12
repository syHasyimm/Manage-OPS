import { Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    FileCheck2,
    GraduationCap,
    HelpCircle,
    Lock,
    LogIn,
    MessageCircle,
    Search,
    ShieldCheck,
    Sparkles,
    UserCheck,
    UserPlus,
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';

export default function SpmbSection({ profileData, period, canRegister, canLogin }) {
    const { auth, school } = usePage().props;
    const spmb = profileData.spmb;
    const schoolName = school?.name || profileData.profil.nama;

    const isPeriodOpen = !!period;
    const closeDateFormatted = period?.closes_at
        ? new Date(period.closes_at).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
          })
        : null;

    const stepIcons = [MessageCircle, UserCheck, FileCheck2];

    return (
        <section id="spmb" className="landing-section spmb-section relative flex min-h-[calc(100dvh-4.5rem)] scroll-mt-20 items-center overflow-hidden bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950 py-12 text-white sm:py-16 lg:py-20">
            {/* Ambient Background Glow */}
            <div className="pointer-events-none absolute inset-0 opacity-25">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[32rem] w-[32rem] rounded-full bg-gold-500/20 blur-[130px]" />
                <div className="absolute bottom-0 right-10 h-72 w-72 rounded-full bg-navy-600/30 blur-[100px]" />
            </div>

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="section-heading text-center max-w-3xl mx-auto space-y-3 mb-12" data-reveal>
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-gold-500/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-gold-300 border border-gold-400/30 backdrop-blur">
                        <Sparkles className="h-3.5 w-3.5 text-gold-400" />
                        <span>Portal penerimaan murid baru</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                        Pendaftaran SPMB dari rumah
                    </h2>
                    <p className="text-sm sm:text-base text-navy-200">
                        Siapkan dokumen, isi formulir secara online, lalu pantau status pendaftaran melalui satu portal yang mudah digunakan.
                    </p>
                </div>

                {/* Main Card Container */}
                <div className="rounded-3xl border border-white/15 bg-white/5 backdrop-blur-xl p-6 sm:p-10 shadow-2xl shadow-navy-950/40 space-y-10" data-reveal>
                    {/* Period Status Ribbon */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pb-8 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold-500 text-navy-950 font-bold shadow-md shadow-gold-500/20">
                                <GraduationCap className="h-6 w-6" />
                            </span>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`h-2.5 w-2.5 rounded-full ${
                                            isPeriodOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                                        }`}
                                    />
                                    <h3 className="text-base sm:text-lg font-bold text-white">
                                        {isPeriodOpen
                                            ? `Tahun Ajaran ${period.academic_year}`
                                            : 'Pendaftaran Ditutup Sementara'}
                                    </h3>
                                </div>
                                <p className="text-xs text-navy-200 mt-0.5">
                                    {isPeriodOpen && closeDateFormatted
                                        ? `Pendaftaran dibuka hingga ${closeDateFormatted}`
                                        : 'Informasi pembukaan periode pendaftaran berikutnya akan diumumkan di sini.'}
                                </p>
                            </div>
                        </div>

                        {/* Direct Status Check Link */}
                        <div className="flex items-center gap-2">
                            <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="border-white/20 bg-white/5 text-xs text-navy-100 hover:bg-white/10 hover:text-white"
                            >
                                <Link href="/cek-status">
                                    <Search className="mr-1.5 h-3.5 w-3.5 text-gold-400" />
                                    Cek Status Pendaftaran
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* 3 Simpler Steps Grid */}
                    <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-gold-400 mb-4 flex items-center gap-1.5">
                            <ShieldCheck className="h-4 w-4" />
                            <span>Alur Pendaftaran Simpel</span>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            {spmb.steps.map((item, idx) => {
                                const StepIcon = stepIcons[idx] || CheckCircle2;
                                return (
                                    <div
                                        key={idx}
                                        className="landing-card relative rounded-2xl border border-white/10 bg-navy-950/60 p-5 backdrop-blur transition-all duration-300 hover:border-gold-400/40 hover:bg-navy-950/80"
                                    >
                                        <div className="flex items-center justify-between mb-3.5">
                                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-500/20 text-gold-400 border border-gold-400/30 font-bold">
                                                <StepIcon className="h-5 w-5" />
                                            </span>
                                            <span className="text-xs font-black text-navy-300">
                                                LANGKAH 0{item.step}
                                            </span>
                                        </div>
                                        <h4 className="text-sm font-bold text-white mb-1.5">
                                            {item.title}
                                        </h4>
                                        <p className="text-xs text-navy-200 leading-relaxed">
                                            {item.desc}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Requirements & Call to Action Box */}
                    <div className="grid gap-6 lg:grid-cols-12 items-center pt-2">
                        {/* Requirements List */}
                        <div className="lg:col-span-7 space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gold-400 flex items-center gap-1.5">
                                <CheckCircle2 className="h-4 w-4" />
                                <span>Syarat & Dokumen Ringkas</span>
                            </h4>
                            <ul className="grid sm:grid-cols-2 gap-2.5 text-xs text-navy-100">
                                {spmb.syarat.map((syarat, idx) => (
                                    <li
                                        key={idx}
                                        className="flex items-start gap-2 rounded-xl bg-white/5 p-2.5 border border-white/5"
                                    >
                                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-gold-400 mt-0.5" />
                                        <span>{syarat}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* CTA Actions */}
                        <div className="lg:col-span-5 flex flex-col gap-3 lg:items-end">
                            {auth?.user ? (
                                <Button
                                    asChild
                                    size="lg"
                                    className="w-full sm:w-auto bg-gradient-to-r from-gold-500 to-gold-600 text-navy-950 font-bold hover:from-gold-400 hover:to-gold-500 shadow-lg shadow-gold-500/20"
                                >
                                    <Link
                                        href={route(
                                            auth.user?.role === 'admin'
                                                ? 'admin.dashboard'
                                                : 'dashboard'
                                        )}
                                    >
                                        <span>Buka Portal Dashboard</span>
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            ) : canRegister && isPeriodOpen ? (
                                <div className="flex flex-col sm:flex-row lg:flex-col w-full gap-2.5">
                                    <Button
                                        asChild
                                        size="lg"
                                        className="w-full bg-gradient-to-r from-gold-500 to-gold-600 text-navy-950 font-bold hover:from-gold-400 hover:to-gold-500 shadow-lg shadow-gold-500/20 text-sm py-6"
                                    >
                                        <Link href={route('register')}>
                                            <span>Mulai Pendaftaran Online</span>
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>

                                    {canLogin && (
                                        <Button
                                            asChild
                                            size="sm"
                                            variant="ghost"
                                            className="w-full text-xs text-navy-200 hover:text-white hover:bg-white/10"
                                        >
                                            <Link href={route('login')}>
                                                <LogIn className="mr-1.5 h-3.5 w-3.5" />
                                                Sudah punya akun? Masuk
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <div className="w-full space-y-2">
                                    <Button
                                        size="lg"
                                        disabled
                                        className="w-full bg-navy-800 text-navy-400 border border-white/10 cursor-not-allowed"
                                    >
                                        <Lock className="mr-2 h-4 w-4" />
                                        Pendaftaran Belum Dibuka
                                    </Button>
                                    {canLogin && (
                                        <Button
                                            asChild
                                            size="sm"
                                            variant="ghost"
                                            className="w-full text-xs text-navy-200 hover:text-white hover:bg-white/10"
                                        >
                                            <Link href={route('login')}>
                                                <LogIn className="mr-1.5 h-3.5 w-3.5" />
                                                Masuk Akun Pendaftar
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            )}

                            <p className="text-[11px] text-navy-300 text-center lg:text-right">
                                Pendaftaran murid baru di {schoolName} tidak dipungut biaya (Gratis).
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
