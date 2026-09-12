import { Award, Medal, Sparkles, Star, Trophy } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';

export default function AchievementsSection({ profileData, achievements }) {
    const defaultPrestasi = profileData.prestasi;
    const displayPrestasi = achievements && achievements.length > 0 ? achievements : defaultPrestasi;

    const iconColors = [
        'bg-gold-500/15 text-gold-700',
        'bg-navy-100 text-navy-800',
        'bg-amber-100 text-amber-800',
        'bg-emerald-100 text-emerald-800',
    ];

    return (
        <section id="prestasi" className="landing-section scroll-mt-20 py-16 sm:py-24 bg-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="section-heading text-center max-w-3xl mx-auto space-y-3 mb-14" data-reveal>
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-gold-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-gold-700">
                        <Trophy className="h-3.5 w-3.5 text-gold-600" />
                        <span>Prestasi Membanggakan</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy-950 tracking-tight">
                        Jejak Prestasi Siswa & Sekolah
                    </h2>
                    <p className="text-sm sm:text-base text-navy-600">
                        Bukti dedikasi peserta didik dan bimbingan para guru dalam berbagai ajang kompetisi sains, seni budaya, dan olahraga.
                    </p>
                </div>

                {/* Achievements Grid */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {displayPrestasi.map((item, idx) => (
                        <div
                            key={item.id || idx}
                            className="landing-card group relative rounded-3xl border border-navy-100 bg-navy-50/30 p-6 hover:bg-white hover:border-gold-400/50 hover:shadow-xl hover:shadow-navy-950/5 transition-all duration-300"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div
                                    className={`flex h-11 w-11 items-center justify-center rounded-2xl font-bold shadow-sm ${
                                        iconColors[idx % iconColors.length]
                                    }`}
                                >
                                    <Medal className="h-5 w-5" />
                                </div>
                                <span className="text-xs font-black text-gold-700 bg-gold-500/15 px-2.5 py-0.5 rounded-full">
                                    {item.year}
                                </span>
                            </div>

                            {item.category && (
                                <Badge
                                    variant="secondary"
                                    className="bg-navy-100/70 text-navy-700 border-none text-[10px] font-semibold mb-2"
                                >
                                    {item.category}
                                </Badge>
                            )}

                            <h3 className="text-sm sm:text-base font-bold text-navy-950 leading-snug group-hover:text-navy-900 mb-2">
                                {item.title}
                            </h3>

                            <p className="text-xs text-navy-500 font-medium">
                                {item.level}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
