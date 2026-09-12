import { Calendar, CalendarDays, Clock, MapPin, Sparkles } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';

export default function AgendaSection({ academicCalendars = [] }) {
    // Curated fallback if database has not been populated with academic calendar events
    const fallbackAgenda = [
        {
            title: 'Penilaian Sumatif Akhir Semester (SAS)',
            category: 'Akademik',
            start_date: '2026-06-08',
            end_date: '2026-06-13',
            description: 'Evaluasi capaian pembelajaran siswa semester genap berbasis Kurikulum Merdeka.',
            color: '#1E3A5F',
        },
        {
            title: 'Pekan Seni Budaya Melayu & Pameran Karya Siswa',
            category: 'Kegiatan Sekolah',
            start_date: '2026-06-18',
            end_date: '2026-06-19',
            description: 'Gelar karya Projek Penguatan Profil Pelajar Pancasila (P5) dan pentas seni.',
            color: '#C9A84C',
        },
        {
            title: 'Penyerahan Laporan Hasil Belajar (Raport)',
            category: 'Administrasi',
            start_date: '2026-06-26',
            end_date: '2026-06-26',
            description: 'Pertemuan tatap muka orang tua dan wali kelas untuk evaluasi hasil belajar siswa.',
            color: '#243b53',
        },
        {
            title: 'Masa Pengenalan Lingkungan Sekolah (MPLS) Murid Baru',
            category: 'Kesiswaan',
            start_date: '2026-07-13',
            end_date: '2026-07-15',
            description: 'Penyambutan siswa baru kelas 1 dengan kegiatan edukatif dan menyenangkan.',
            color: '#102a43',
        },
    ];

    const displayAgenda =
        academicCalendars && academicCalendars.length > 0
            ? academicCalendars
            : fallbackAgenda;

    const formatDate = (dateStr) => {
        if (!dateStr) return { day: '01', month: 'Jan', full: '' };
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return { day: '01', month: 'Jan', full: dateStr };
        return {
            day: d.toLocaleDateString('id-ID', { day: '2-digit' }),
            month: d.toLocaleDateString('id-ID', { month: 'short' }),
            full: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        };
    };

    return (
        <section id="agenda" className="landing-section scroll-mt-20 py-16 sm:py-24 bg-navy-50/50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="section-heading text-center max-w-3xl mx-auto space-y-3 mb-14" data-reveal>
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-gold-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-gold-700">
                        <CalendarDays className="h-3.5 w-3.5 text-gold-600" />
                        <span>Kalender Pendidikan</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy-950 tracking-tight">
                        Agenda & Kegiatan Sekolah Terdekat
                    </h2>
                    <p className="text-sm sm:text-base text-navy-600">
                        Pantau jadwal akademik penting, kegiatan kesiswaan, dan agenda resmi SD Negeri 001 Kepenuhan.
                    </p>
                </div>

                {/* Agenda Cards */}
                <div className="grid gap-6 md:grid-cols-2">
                    {displayAgenda.map((item, idx) => {
                        const start = formatDate(item.start_date);
                        const end = formatDate(item.end_date);
                        const isSameDate = item.start_date === item.end_date || !item.end_date;

                        return (
                            <div
                                key={item.id || idx}
                                className="landing-card group flex flex-col sm:flex-row items-start gap-4 rounded-3xl border border-navy-100 bg-white p-5 sm:p-6 shadow-sm hover:shadow-lg hover:border-gold-400/50 transition-all duration-300"
                            >
                                {/* Date Block */}
                                <div className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-navy-900 to-navy-950 text-white shadow-md shadow-navy-950/10">
                                    <span className="text-xl sm:text-2xl font-black text-gold-400 leading-none">
                                        {start.day}
                                    </span>
                                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-navy-200 mt-1">
                                        {start.month}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="space-y-2 min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <Badge
                                            variant="secondary"
                                            className="bg-gold-500/15 text-gold-700 border-none text-[10px] font-bold"
                                        >
                                            {item.category || 'Kegiatan'}
                                        </Badge>
                                        <span className="text-[11px] text-navy-400 font-medium">
                                            {isSameDate ? start.full : `${start.full} - ${end.full}`}
                                        </span>
                                    </div>
                                    <h3 className="text-base font-bold text-navy-950 group-hover:text-navy-900 leading-snug">
                                        {item.title}
                                    </h3>
                                    {item.description && (
                                        <p className="text-xs text-navy-600 leading-relaxed line-clamp-2">
                                            {item.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
