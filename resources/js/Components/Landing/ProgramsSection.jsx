import {
    BookOpen,
    CheckCircle,
    HeartHandshake,
    Laptop,
    Sparkles,
    Trees,
    Trophy,
} from 'lucide-react';
import { Badge } from '@/Components/ui/badge';

export default function ProgramsSection({ profileData, programs, extracurriculars }) {
    const defaultPrograms = profileData.program_unggulan;
    const defaultEkskul = profileData.ekstrakurikuler;

    const displayPrograms = programs && programs.length > 0 ? programs : defaultPrograms;
    const displayEkskul = extracurriculars && extracurriculars.length > 0 ? extracurriculars : defaultEkskul;

    const iconMap = {
        HeartHandshake,
        BookOpen,
        Trees,
        Laptop,
    };

    return (
        <section id="program" className="landing-section scroll-mt-20 py-16 sm:py-24 bg-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="section-heading text-center max-w-3xl mx-auto space-y-3 mb-14" data-reveal>
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-gold-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-gold-700">
                        <Sparkles className="h-3.5 w-3.5 text-gold-600" />
                        <span>Keunggulan Institusi</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy-950 tracking-tight">
                        Program Unggulan & Pembiasaan Karakter
                    </h2>
                    <p className="text-sm sm:text-base text-navy-600">
                        Rangkaian kegiatan terencana untuk mengasah potensi intelektual, spiritual, dan emosional siswa sejak usia dini.
                    </p>
                </div>

                {/* Programs Grid */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {displayPrograms.map((item, idx) => {
                        const IconComponent = item.icon ? (iconMap[item.icon] || Sparkles) : Sparkles;
                        return (
                            <div
                                key={idx}
                                className="landing-card group relative rounded-3xl border border-navy-100 bg-navy-50/40 p-6 hover:bg-white hover:border-gold-400/50 hover:shadow-xl hover:shadow-navy-950/5 transition-all duration-300"
                            >
                                {item.image_url ? (
                                    <div className="h-12 w-12 rounded-2xl overflow-hidden mb-5 group-hover:scale-110 transition-transform shadow-md shadow-gold-500/20 border border-gold-500/30">
                                        <img src={item.image_url} alt={item.title} className="h-full w-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-500 text-navy-950 font-bold shadow-md shadow-gold-500/20 mb-5 group-hover:scale-110 transition-transform">
                                        <IconComponent className="h-6 w-6" />
                                    </div>
                                )}
                                <h3 className="text-base font-bold text-navy-950 mb-2 leading-snug">
                                    {item.title}
                                </h3>
                                <p className="text-xs text-navy-600 leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* Ekstrakurikuler Showcase */}
                <div className="mt-16 rounded-3xl border border-navy-800 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950 p-6 sm:p-10 text-white shadow-xl shadow-navy-950/10" data-reveal>
                    <div className="grid lg:grid-cols-12 gap-8 items-center">
                        <div className="lg:col-span-5 space-y-3">
                            <span className="text-xs font-bold uppercase tracking-widest text-gold-400">
                                Minat & Bakat
                            </span>
                            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                                Kegiatan Ekstrakurikuler Siswa
                            </h3>
                            <p className="text-xs sm:text-sm text-navy-200 leading-relaxed">
                                Menyalurkan bakat dan hobi melalui wadah positif untuk melatih jiwa kepemimpinan, sportivitas, dan kreativitas murid.
                            </p>
                        </div>

                        <div className="lg:col-span-7">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {displayEkskul.map((e, idx) => (
                                    <div
                                        key={e.id || idx}
                                        className="relative rounded-2xl border border-white/10 bg-white/5 p-3.5 hover:bg-white/10 hover:border-gold-400/40 transition-all overflow-hidden"
                                    >
                                        {e.image_url && (
                                            <div className="absolute inset-0 opacity-10">
                                                <img src={e.image_url} alt="" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        <div className="relative z-10">
                                            {e.badge && (
                                                <Badge
                                                    variant="secondary"
                                                    className="bg-gold-500/20 text-gold-300 border-none text-[10px] font-semibold mb-1.5"
                                                >
                                                    {e.badge}
                                                </Badge>
                                            )}
                                            <p className="text-xs font-bold text-white leading-tight">
                                                {e.name}
                                            </p>
                                            <p className="text-[11px] text-navy-300 mt-1">
                                                {e.category || 'Umum'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
