import { GraduationCap, Sparkles, UserCheck, Users } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';

export default function StaffSection({ staffList = [] }) {
    // Curated fallback if database has not been seeded with staff yet
    const fallbackStaff = [
        {
            name: 'Kepala Sekolah SD Negeri 001',
            jabatan: 'Kepala Sekolah',
            jenis: 'Pendidik',
            golongan: 'Pembina / IV.a',
        },
        {
            name: 'Guru Kelas 1',
            jabatan: 'Wali Kelas 1 & Guru Tematik',
            jenis: 'Pendidik',
            golongan: 'Penata / III.c',
        },
        {
            name: 'Guru Kelas 2',
            jabatan: 'Wali Kelas 2 & Guru Tematik',
            jenis: 'Pendidik',
            golongan: 'Penata Muda / III.b',
        },
        {
            name: 'Guru Kelas 3',
            jabatan: 'Wali Kelas 3 & Guru Tematik',
            jenis: 'Pendidik',
            golongan: 'Penata / III.c',
        },
        {
            name: 'Guru Pendidikan Agama Islam',
            jabatan: 'Guru PAI & Pembina Ibadah',
            jenis: 'Pendidik',
            golongan: 'Penata / III.c',
        },
        {
            name: 'Guru PJOK & Olahraga',
            jabatan: 'Guru PJOK & Pelatih Futsal',
            jenis: 'Pendidik',
            golongan: 'Penata Muda / III.a',
        },
        {
            name: 'Guru Kelas 6',
            jabatan: 'Wali Kelas 6 & Koordinator ANBK',
            jenis: 'Pendidik',
            golongan: 'Pembina / IV.a',
        },
        {
            name: 'Tenaga Administrasi & Operator',
            jabatan: 'Operator Sekolah & Dapodik',
            jenis: 'Tenaga Kependidikan',
            golongan: 'Staf TU',
        },
    ];

    const displayStaff = staffList && staffList.length > 0 ? staffList : fallbackStaff;

    return (
        <section id="guru" className="scroll-mt-20 py-16 sm:py-24 bg-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-gold-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-gold-700">
                        <Users className="h-3.5 w-3.5 text-gold-600" />
                        <span>Pendidik Berdedikasi</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy-950 tracking-tight">
                        Dewan Guru & Tenaga Kependidikan
                    </h2>
                    <p className="text-sm sm:text-base text-navy-600">
                        Didukung oleh tenaga pendidik yang berijazah sarjana pendidikan, berkompeten, ramah, dan penuh kasih sayang dalam mendampingi tumbuh kembang anak.
                    </p>
                </div>

                {/* Staff Grid */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {displayStaff.map((staff, idx) => {
                        const isLeader =
                            staff.jabatan?.toLowerCase().includes('kepala sekolah') || idx === 0;

                        // Get initials for elegant avatar
                        const nameParts = staff.name.split(' ');
                        const initials =
                            nameParts.length > 1
                                ? `${nameParts[0][0]}${nameParts[1][0]}`
                                : nameParts[0].slice(0, 2);

                        return (
                            <div
                                key={staff.id || idx}
                                className={`group relative rounded-3xl border p-5 transition-all duration-300 ${
                                    isLeader
                                        ? 'border-gold-400/80 bg-gradient-to-b from-navy-950 to-navy-900 text-white shadow-xl shadow-gold-500/10'
                                        : 'border-navy-100 bg-white hover:border-gold-300 hover:shadow-lg hover:shadow-navy-950/5'
                                }`}
                            >
                                <div className="flex items-center gap-3.5">
                                    <div
                                        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl font-black text-sm uppercase shadow-sm ${
                                            isLeader
                                                ? 'bg-gradient-to-br from-gold-400 to-gold-600 text-navy-950'
                                                : 'bg-navy-100 text-navy-800 group-hover:bg-gold-500/20 group-hover:text-gold-700 transition-colors'
                                        }`}
                                    >
                                        {initials}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5 mb-0.5">
                                            <Badge
                                                variant="secondary"
                                                className={`text-[9px] px-1.5 py-0 font-semibold border-none ${
                                                    isLeader
                                                        ? 'bg-gold-500/25 text-gold-300'
                                                        : 'bg-navy-50 text-navy-600'
                                                }`}
                                            >
                                                {staff.jenis || 'Pendidik'}
                                            </Badge>
                                        </div>
                                        <h3
                                            className={`text-sm font-bold truncate ${
                                                isLeader ? 'text-white' : 'text-navy-950'
                                            }`}
                                            title={staff.name}
                                        >
                                            {staff.name}
                                        </h3>
                                        <p
                                            className={`text-xs truncate ${
                                                isLeader ? 'text-gold-300' : 'text-navy-600 font-medium'
                                            }`}
                                        >
                                            {staff.jabatan || 'Guru Pengajar'}
                                        </p>
                                    </div>
                                </div>

                                {staff.golongan && (
                                    <div
                                        className={`mt-4 pt-3 border-t text-[11px] flex items-center justify-between ${
                                            isLeader
                                                ? 'border-white/10 text-navy-300'
                                                : 'border-navy-50 text-navy-400'
                                        }`}
                                    >
                                        <span>Pangkat / Golongan:</span>
                                        <span
                                            className={`font-semibold ${
                                                isLeader ? 'text-gold-200' : 'text-navy-700'
                                            }`}
                                        >
                                            {staff.golongan}
                                        </span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
