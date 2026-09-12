import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    Award,
    CheckCircle,
    ChevronDown,
    GraduationCap,
    Sparkles,
} from 'lucide-react';

export default function HeroSection({ profileData, school, period, canRegister }) {
    const p = profileData.profil;
    const schoolName = school?.name || p.nama;
    const npsn = school?.npsn || p.npsn;
    const accreditation = school?.accreditation || p.akreditasi;
    const heroImage = school?.hero_image_url;
    const isRegistrationOpen = Boolean(period && canRegister);

    return (
        <section
            id="beranda"
            className="hero-section relative overflow-hidden bg-navy-950 text-white pt-14 pb-28 lg:pt-20 lg:pb-36"
        >
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="hero-orbit absolute -top-52 -left-48 h-[34rem] w-[34rem] rounded-full border border-gold-400/15" />
                <div className="hero-orbit hero-orbit-delayed absolute -bottom-72 right-[-10rem] h-[40rem] w-[40rem] rounded-full border border-white/10" />
                <div className="absolute left-[8%] top-[8%] h-80 w-80 rounded-full bg-gold-500/10 blur-[120px]" />
                <div className="hero-grid absolute inset-0 opacity-30" />
            </div>

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid gap-14 lg:grid-cols-12 lg:items-center">
                    {/* Left Column: School Introduction & CTAs */}
                    <div
                        className="hero-copy space-y-7 lg:col-span-7"
                        data-reveal="left"
                    >
                        {/* School Identity Badges */}
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center border-l-2 border-gold-400 pl-3 text-[11px] font-bold uppercase tracking-[0.18em] text-gold-300">
                                <Sparkles className="mr-1.5 h-3.5 w-3.5 text-gold-400" />
                                {schoolName}
                            </span>
                            <span className="inline-flex items-center text-xs text-navy-200">
                                <Award className="mr-1.5 h-3.5 w-3.5 text-gold-400" />
                                Akreditasi {accreditation}
                            </span>
                            <span className="hidden sm:inline-flex items-center text-xs text-navy-300">
                                NPSN: <strong className="ml-1 text-white">{npsn}</strong>
                            </span>
                        </div>

                        {/* Heading */}
                        <div className="space-y-4">
                            <h1 className="font-display text-4xl font-extrabold tracking-[-0.045em] sm:text-6xl xl:text-7xl leading-[0.98] text-balance">
                                Belajar dengan gembira,
                                <span className="mt-2 block text-gold-400">
                                    tumbuh dengan karakter.
                                </span>
                            </h1>
                            <p className="text-base sm:text-lg text-gold-200/90 font-medium italic">
                                &ldquo;{p.tagline}&rdquo;
                            </p>
                        </div>

                        {/* Description */}
                        <p className="max-w-[62ch] text-sm sm:text-base text-navy-100/90 leading-relaxed text-pretty">
                            {p.deskripsi_singkat}
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-3.5 pt-2">
                            <a
                                href="#spmb"
                                className="hero-primary-action inline-flex items-center justify-center rounded-xl bg-gold-500 px-6 py-3.5 text-sm font-bold text-navy-950 shadow-lg shadow-gold-500/20 transition-all hover:-translate-y-0.5 hover:bg-gold-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                            >
                                <span>{isRegistrationOpen ? 'Daftar Sekarang' : 'Informasi SPMB'}</span>
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </a>

                            <a
                                href="#profil"
                                className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-5 py-3.5 text-sm font-semibold text-white backdrop-blur transition-all hover:bg-white/10 hover:border-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
                            >
                                <span>Profil & Visi Misi</span>
                            </a>

                            <Link
                                href="/cek-status"
                                className="inline-flex items-center justify-center rounded-xl px-4 py-3.5 text-sm font-medium text-navy-200 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
                            >
                                <span>Cek Status Pendaftar</span>
                            </Link>
                        </div>

                        {/* Key Pillars Highlights */}
                        <div className="grid grid-cols-3 gap-3 pt-6 border-t border-white/10 text-xs sm:text-sm">
                            <div className="flex items-center gap-2 text-navy-200">
                                <CheckCircle className="h-4 w-4 text-gold-400 shrink-0" />
                                <span>Berakhlak Mulia</span>
                            </div>
                            <div className="flex items-center gap-2 text-navy-200">
                                <CheckCircle className="h-4 w-4 text-gold-400 shrink-0" />
                                <span>Unggul Akademik</span>
                            </div>
                            <div className="flex items-center gap-2 text-navy-200">
                                <CheckCircle className="h-4 w-4 text-gold-400 shrink-0" />
                                <span>Cinta Lingkungan</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Interactive School Showcase Card */}
                    <div
                        className="hero-visual lg:col-span-5"
                        data-reveal="right"
                        data-reveal-delay="160"
                    >
                        <div className="relative mx-auto max-w-md lg:max-w-none">
                            <div className="hero-halo absolute -inset-6 rounded-[3rem] bg-gold-500/15 blur-3xl" />

                            <div className="relative min-h-[32rem] overflow-hidden rounded-[2.25rem] border border-white/15 bg-navy-900 shadow-2xl shadow-navy-950/50 sm:min-h-[38rem]">
                                {heroImage ? (
                                    <img
                                        src={heroImage}
                                        alt={`Suasana pendidikan di ${schoolName}`}
                                        className="hero-photo absolute inset-0 h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center bg-navy-900">
                                        <div className="hero-grid absolute inset-0 opacity-70" />
                                        {school?.logo_url ? (
                                            <img
                                                src={school.logo_url}
                                                alt={schoolName}
                                                className="relative h-40 w-40 object-contain opacity-90 drop-shadow-2xl sm:h-48 sm:w-48"
                                            />
                                        ) : (
                                            <GraduationCap className="relative h-36 w-36 text-gold-400/80" />
                                        )}
                                    </div>
                                )}

                                <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/35 to-navy-950/10" />

                                <div className="absolute left-5 right-5 top-5 flex items-center justify-between">
                                    <span className="rounded-xl border border-white/15 bg-navy-950/55 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-xl">
                                        Kec. {school?.district ?? 'Kepenuhan'}
                                    </span>
                                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-500 font-display text-lg font-extrabold text-navy-950 shadow-lg shadow-navy-950/20">
                                        {accreditation}
                                    </span>
                                </div>

                                <div className="absolute inset-x-5 bottom-5 rounded-[1.5rem] border border-white/15 bg-navy-950/[0.72] p-5 shadow-xl backdrop-blur-xl sm:p-6">
                                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-gold-300">
                                        <GraduationCap className="h-4 w-4" />
                                        <span>Ruang tumbuh generasi Kepenuhan</span>
                                    </div>
                                    <h2 className="mt-3 text-xl font-bold leading-tight text-white sm:text-2xl">
                                        Pendidikan yang dekat, aman, dan berpihak pada murid.
                                    </h2>
                                    <div className="mt-5 flex items-center justify-between gap-4 border-t border-white/10 pt-4 text-[11px]">
                                        <span className="font-semibold text-navy-200">{p.kurikulum}</span>
                                        <span className="flex items-center gap-2 text-gold-200">
                                            <span className={`h-2 w-2 rounded-full ${isRegistrationOpen ? 'bg-emerald-400' : 'bg-gold-400'}`} />
                                            {period?.academic_year
                                                ? `SPMB ${period.academic_year}`
                                                : 'Sekolah Negeri'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="hero-float-badge absolute -bottom-5 -left-5 hidden items-center gap-3 rounded-2xl border border-white/15 bg-white p-3 text-navy-950 shadow-xl sm:flex">
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-500/20 text-gold-700">
                                    <Award className="h-5 w-5" />
                                </span>
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-navy-500">
                                        Sekolah negeri
                                    </p>
                                    <p className="text-xs font-bold">Terakreditasi {accreditation}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-1 text-navy-300 text-xs">
                <span>Jelajahi Profil</span>
                <ChevronDown className="h-4 w-4 animate-bounce text-gold-400" />
            </div>
        </section>
    );
}
