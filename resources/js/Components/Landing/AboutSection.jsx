import {
    Award,
    CheckCircle2,
    Compass,
    Eye,
    GraduationCap,
    Heart,
    Lightbulb,
    Shield,
    Sparkles,
    Target,
} from 'lucide-react';
import { Card, CardContent } from '@/Components/ui/card';

export default function AboutSection({ profileData, school }) {
    const vm = profileData.visi_misi;
    const p = profileData.profil;
    const schoolName = school?.name || p.nama;

    const valueIcons = [Heart, Lightbulb, Compass, Shield];

    return (
        <section id="profil" className="scroll-mt-20 py-16 sm:py-24 bg-navy-50/50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-gold-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-gold-700">
                        <Sparkles className="h-3.5 w-3.5 text-gold-600" />
                        <span>Profil & Arah Pendidikan</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy-950 tracking-tight">
                        Visi, Misi & Budaya Sekolah
                    </h2>
                    <p className="text-sm sm:text-base text-navy-600">
                        Membimbing setiap siswa dengan kurikulum berkualitas, pendekatan humanis, serta pembiasaan nilai-nilai Profil Pelajar Pancasila.
                    </p>
                </div>

                {/* Visi & Misi Layout */}
                <div className="grid gap-8 lg:grid-cols-12">
                    {/* Left: Visi & Nilai Karakter */}
                    <div className="space-y-6 lg:col-span-5">
                        {/* Visi Card */}
                        <div className="rounded-3xl border border-navy-800 bg-gradient-to-br from-navy-950 to-navy-900 p-6 sm:p-8 text-white shadow-xl shadow-navy-950/10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 h-40 w-40 bg-gold-500/10 rounded-full blur-2xl" />
                            <div className="flex items-center gap-2.5 text-gold-400 text-xs font-bold uppercase tracking-widest mb-3">
                                <Eye className="h-4 w-4 text-gold-400" />
                                <span>Visi Sekolah</span>
                            </div>
                            <p className="text-lg sm:text-xl font-bold leading-snug text-white">
                                &ldquo;{vm.visi}&rdquo;
                            </p>
                            <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between text-xs text-navy-200">
                                <span>{schoolName}</span>
                                <span className="text-gold-400 font-semibold">{p.kurikulum}</span>
                            </div>
                        </div>

                        {/* Nilai-Nilai Utama */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-navy-900 flex items-center gap-2">
                                <Award className="h-4 w-4 text-gold-600" />
                                <span>Empat Pilar Karakter Murid</span>
                            </h3>
                            <div className="grid sm:grid-cols-2 gap-3">
                                {vm.nilai_utama.map((item, idx) => {
                                    const IconComponent = valueIcons[idx % valueIcons.length];
                                    return (
                                        <div
                                            key={idx}
                                            className="rounded-2xl border border-navy-100 bg-white p-4 shadow-sm hover:border-gold-400/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold-500/15 text-gold-700">
                                                    <IconComponent className="h-3.5 w-3.5" />
                                                </span>
                                                <p className="text-xs font-bold text-navy-950">
                                                    {item.title}
                                                </p>
                                            </div>
                                            <p className="text-[11px] text-navy-600 leading-relaxed">
                                                {item.desc}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right: Misi Sekolah */}
                    <div className="lg:col-span-7 space-y-4">
                        <div className="rounded-3xl border border-navy-100 bg-white p-6 sm:p-8 shadow-sm space-y-6">
                            <div className="flex items-center gap-2.5 text-gold-600 text-xs font-bold uppercase tracking-widest">
                                <Target className="h-4 w-4" />
                                <span>Misi Sekolah</span>
                            </div>
                            <h3 className="text-xl font-bold text-navy-950 -mt-3">
                                Langkah Nyata Membangun Generasi Gemilang
                            </h3>

                            <div className="space-y-3.5">
                                {vm.misi.map((m, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-navy-50/70 border border-navy-100/70 hover:bg-navy-50 hover:border-navy-200 transition-all"
                                    >
                                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold-500 text-navy-950 text-xs font-bold shadow-sm mt-0.5">
                                            {idx + 1}
                                        </span>
                                        <p className="text-xs sm:text-sm text-navy-800 leading-relaxed font-medium">
                                            {m}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Identitas Resmi Ringkas */}
                        <div className="rounded-2xl border border-navy-100 bg-white p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 text-xs">
                            <div>
                                <span className="text-navy-500">Status Kelembagaan:</span>
                                <span className="ml-1.5 font-bold text-navy-900">{p.status_sekolah}</span>
                            </div>
                            <div>
                                <span className="text-navy-500">Jenjang:</span>
                                <span className="ml-1.5 font-bold text-navy-900">{p.jenjang}</span>
                            </div>
                            <div>
                                <span className="text-navy-500">NPSN:</span>
                                <span className="ml-1.5 font-bold text-navy-900">{school?.npsn || p.npsn}</span>
                            </div>
                            <div>
                                <span className="text-navy-500">Akreditasi:</span>
                                <span className="ml-1.5 font-bold text-gold-700">{school?.accreditation || p.akreditasi}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
