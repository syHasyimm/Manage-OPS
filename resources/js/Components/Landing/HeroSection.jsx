import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    Award,
    BookOpen,
    CheckCircle,
    ChevronDown,
    GraduationCap,
    HeartHandshake,
    ShieldCheck,
    Sparkles,
    Users,
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';

export default function HeroSection({ profileData, school, period, canRegister }) {
    const p = profileData.profil;
    const schoolName = school?.name || p.nama;
    const npsn = school?.npsn || p.npsn;
    const accreditation = school?.accreditation || p.akreditasi;

    return (
        <section
            id="beranda"
            className="relative overflow-hidden bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950 text-white pt-12 pb-24 lg:pt-20 lg:pb-32"
        >
            {/* Ambient Lighting Gradients */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-30">
                <div className="absolute -top-32 -left-20 h-96 w-96 rounded-full bg-gold-500/25 blur-[120px]" />
                <div className="absolute top-1/3 -right-20 h-[30rem] w-[30rem] rounded-full bg-navy-600/30 blur-[140px]" />
                <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-gold-600/15 blur-[100px]" />
                {/* Decorative Subtle Grid */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
                        backgroundSize: '24px 24px',
                    }}
                />
            </div>

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
                    {/* Left Column: School Introduction & CTAs */}
                    <div className="space-y-6 lg:col-span-7">
                        {/* School Identity Badges */}
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge
                                variant="outline"
                                className="border-gold-400/40 bg-gold-500/10 text-gold-300 px-3 py-1 text-xs font-semibold backdrop-blur"
                            >
                                <Sparkles className="mr-1.5 h-3.5 w-3.5 text-gold-400" />
                                {p.kurikulum}
                            </Badge>
                            <Badge
                                variant="outline"
                                className="border-white/20 bg-white/5 text-navy-100 px-3 py-1 text-xs backdrop-blur"
                            >
                                <Award className="mr-1.5 h-3.5 w-3.5 text-gold-400" />
                                Akreditasi {accreditation}
                            </Badge>
                            <span className="hidden sm:inline-flex items-center text-xs text-navy-300">
                                NPSN: <strong className="ml-1 text-white">{npsn}</strong>
                            </span>
                        </div>

                        {/* Heading */}
                        <div className="space-y-3">
                            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl leading-tight">
                                Selamat Datang di <br />
                                <span className="bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500 bg-clip-text text-transparent">
                                    {schoolName}
                                </span>
                            </h1>
                            <p className="text-base sm:text-lg text-gold-200/90 font-medium">
                                &ldquo;{p.tagline}&rdquo;
                            </p>
                        </div>

                        {/* Description */}
                        <p className="max-w-2xl text-sm sm:text-base text-navy-100/90 leading-relaxed">
                            {p.deskripsi_singkat}
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-3.5 pt-2">
                            <a
                                href="#spmb"
                                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 px-6 py-3.5 text-sm font-bold text-navy-950 shadow-lg shadow-gold-500/25 hover:from-gold-400 hover:to-gold-500 transition-all hover:-translate-y-0.5"
                            >
                                <span>Pendaftaran Murid Baru (SPMB)</span>
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </a>

                            <a
                                href="#profil"
                                className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-5 py-3.5 text-sm font-semibold text-white backdrop-blur hover:bg-white/10 hover:border-white/30 transition-all"
                            >
                                <span>Profil & Visi Misi</span>
                            </a>

                            <Link
                                href="/cek-status"
                                className="inline-flex items-center justify-center rounded-xl px-4 py-3.5 text-sm font-medium text-navy-200 hover:text-white transition-colors"
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
                    <div className="lg:col-span-5">
                        <div className="relative mx-auto max-w-md lg:max-w-none">
                            {/* Glow accent */}
                            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-gold-500/20 to-navy-600/40 blur-xl" />

                            <div className="relative rounded-3xl border border-white/15 bg-navy-900/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
                                {/* School Header Card */}
                                <div className="flex items-center gap-4 pb-5 border-b border-white/10">
                                    {school?.logo_url ? (
                                        <img
                                            src={school.logo_url}
                                            alt={schoolName}
                                            className="h-16 w-16 object-contain rounded-2xl bg-white/10 p-2 ring-2 ring-gold-400/40"
                                        />
                                    ) : (
                                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 text-navy-950 shadow-md">
                                            <GraduationCap className="h-9 w-9" />
                                        </div>
                                    )}
                                    <div>
                                        <div className="flex items-center gap-1.5 text-xs text-gold-400 font-semibold uppercase tracking-wider">
                                            <span>Akreditasi {accreditation}</span>
                                        </div>
                                        <h3 className="text-lg font-bold text-white leading-snug">
                                            {schoolName}
                                        </h3>
                                        <p className="text-xs text-navy-200 mt-0.5">
                                            Kecamatan {school?.district ?? 'Kepenuhan'}, Rokan Hulu
                                        </p>
                                    </div>
                                </div>

                                {/* Sambutan Singkat Kepala Sekolah */}
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5 relative">
                                    <div className="text-gold-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                        <HeartHandshake className="h-4 w-4" />
                                        <span>Kata Pengantar</span>
                                    </div>
                                    <blockquote className="text-xs sm:text-sm text-navy-100 italic leading-relaxed">
                                        &ldquo;{p.sambutan_kepala_sekolah.kutipan}&rdquo;
                                    </blockquote>
                                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-semibold text-white">
                                                {school?.principal || p.sambutan_kepala_sekolah.nama}
                                            </p>
                                            <p className="text-[11px] text-navy-300">
                                                {p.sambutan_kepala_sekolah.jabatan}
                                            </p>
                                        </div>
                                        <span className="text-[10px] px-2 py-1 rounded bg-gold-500/20 text-gold-300 font-medium">
                                            SDN 001
                                        </span>
                                    </div>
                                </div>

                                {/* SPMB Quick Status Banner */}
                                <div className="rounded-xl border border-gold-400/30 bg-gold-500/10 p-3.5 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2.5">
                                        <span className="relative flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-gold-500"></span>
                                        </span>
                                        <div className="text-xs">
                                            <p className="font-bold text-white">Pendaftaran Online</p>
                                            <p className="text-[11px] text-gold-200">
                                                {period?.academic_year
                                                    ? `Tahun Ajaran ${period.academic_year}`
                                                    : 'Informasi Pendaftaran Murid Baru'}
                                            </p>
                                        </div>
                                    </div>
                                    <a
                                        href="#spmb"
                                        className="text-xs font-semibold text-gold-300 hover:text-white underline underline-offset-4"
                                    >
                                        Lihat Info
                                    </a>
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
