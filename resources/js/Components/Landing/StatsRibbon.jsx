import { Award, BookOpen, School, Users } from 'lucide-react';

export default function StatsRibbon({ stats, profileData }) {
    const p = profileData.profil;
    const totalStaff = stats?.total_staff > 0 ? stats.total_staff : 24;
    const totalStudents = stats?.total_students > 0 ? stats.total_students : 350;
    const accreditation = stats?.accreditation || p.akreditasi || 'A';

    const items = [
        {
            icon: Award,
            value: accreditation,
            label: 'Akreditasi Sekolah',
            sub: 'Kategori Unggul & Terpercaya',
            gold: true,
        },
        {
            icon: Users,
            value: `${totalStaff}+`,
            label: 'Pendidik & Tenaga Ahli',
            sub: 'Berdedikasi & Kompeten',
        },
        {
            icon: School,
            value: `${totalStudents}+`,
            label: 'Siswa Didik Aktif',
            sub: 'Tumbuh & Berkarakter Luhur',
        },
        {
            icon: BookOpen,
            value: 'Merdeka',
            label: 'Kurikulum Nasional',
            sub: 'Berbasis Minat & Karakter',
        },
    ];

    return (
        <div className="relative -mt-10 lg:-mt-14 z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-navy-100 bg-white p-4 sm:p-6 shadow-xl shadow-navy-950/5">
                <div className="grid grid-cols-2 gap-4 divide-y divide-gray-100 sm:divide-y-0 sm:divide-x sm:grid-cols-4">
                    {items.map((item, idx) => (
                        <div
                            key={idx}
                            className={`flex flex-col items-center text-center p-3 ${
                                idx > 1 ? 'pt-4 sm:pt-0' : ''
                            }`}
                        >
                            <div
                                className={`mb-2.5 flex h-11 w-11 items-center justify-center rounded-xl shadow-sm ${
                                    item.gold
                                        ? 'bg-gold-500/15 text-gold-600'
                                        : 'bg-navy-50 text-navy-800'
                                }`}
                            >
                                <item.icon className="h-5 w-5" />
                            </div>
                            <span className="text-2xl sm:text-3xl font-black text-navy-950 tracking-tight">
                                {item.value}
                            </span>
                            <span className="text-xs font-bold text-navy-900 mt-1">
                                {item.label}
                            </span>
                            <span className="text-[11px] text-navy-500 mt-0.5">
                                {item.sub}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
