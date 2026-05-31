import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    FileText,
    GraduationCap,
    MapPin,
    MessageCircle,
    Search,
    ShieldCheck,
    UserPlus,
    Sparkles,
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';

const STEPS = [
    {
        icon: UserPlus,
        title: 'Daftar Akun',
        description: 'Gunakan nomor WhatsApp aktif untuk membuat akun pendaftar.',
    },
    {
        icon: ShieldCheck,
        title: 'Verifikasi OTP',
        description: 'Masukkan kode OTP yang dikirim langsung ke WhatsApp Anda.',
    },
    {
        icon: FileText,
        title: 'Isi Formulir 3 Langkah',
        description: 'Identitas, data periodik, dan data orang tua. Bisa disimpan dan dilanjutkan kapan saja.',
    },
    {
        icon: CheckCircle2,
        title: 'Submit & Terima PDF',
        description: 'Formulir resmi PDF otomatis dikirim ke WhatsApp Anda.',
    },
];

const REQUIREMENTS = [
    'Foto/scan Kartu Keluarga (KK) yang masih aktif.',
    'Foto/scan Akta Kelahiran calon murid.',
    'Foto/scan Kartu Indonesia Pintar (KIP) jika ada.',
    'Nomor WhatsApp aktif untuk komunikasi sekolah.',
    'Email aktif sebagai kontak alternatif.',
];

const FAQ = [
    {
        q: 'Apakah pendaftaran ini berbayar?',
        a: 'Tidak. Pendaftaran murid baru di SD Negeri 001 Kepenuhan tidak dipungut biaya.',
    },
    {
        q: 'Bagaimana jika nomor WhatsApp saya tidak menerima OTP?',
        a: 'Klik tombol "Kirim Ulang" pada halaman verifikasi setelah hitung mundur selesai. Pastikan nomor yang dimasukkan benar dan WhatsApp aktif.',
    },
    {
        q: 'Bisakah saya mengisi formulir bertahap?',
        a: 'Bisa. Setiap kali Anda klik "Simpan & Lanjut", data tersimpan otomatis. Anda dapat keluar dan melanjutkan kapan saja.',
    },
    {
        q: 'Bagaimana cara memastikan pendaftaran sudah diterima?',
        a: 'Anda akan menerima notifikasi WhatsApp berisi nomor pendaftaran dan file PDF formulir resmi. Status juga dapat dicek di dashboard atau halaman publik "Cek Status".',
    },
];

export default function Welcome({ canLogin, canRegister, period }) {
    const { auth, school } = usePage().props;

    return (
        <div className="min-h-screen bg-navy-50 text-navy-900">
            <Head title="Selamat Datang" />

            {/* Topbar */}
            <header className="sticky top-0 z-30 border-b border-navy-100 bg-white/95 backdrop-blur">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-500 text-navy-950">
                            <GraduationCap className="h-5 w-5" />
                        </span>
                        <div className="leading-tight">
                            <p className="text-[10px] uppercase tracking-widest text-gold-700">SPMB</p>
                            <p className="text-sm font-semibold text-navy-950">{school?.name ?? 'SD Negeri 001 Kepenuhan'}</p>
                        </div>
                    </div>
                    <nav className="flex items-center gap-2">
                        <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                            <Link href="/cek-status">Cek Status</Link>
                        </Button>
                        <Button asChild variant="ghost" size="sm" className="sm:hidden" aria-label="Cek Status">
                            <Link href="/cek-status">
                                <Search className="h-4 w-4" />
                            </Link>
                        </Button>
                        {auth?.user ? (
                            <Button asChild size="sm">
                                <Link href={route('dashboard')}>Dashboard</Link>
                            </Button>
                        ) : (
                            <>
                                {canLogin && (
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={route('login')}>Masuk</Link>
                                    </Button>
                                )}
                                {canRegister && (
                                    <Button asChild size="sm">
                                        <Link href={route('register')}>Daftar</Link>
                                    </Button>
                                )}
                            </>
                        )}
                    </nav>
                </div>
            </header>

            {/* Hero */}
            <section className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950 text-white">
                <div className="pointer-events-none absolute inset-0 opacity-20">
                    <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-gold-500 blur-3xl" />
                    <div className="absolute -bottom-32 -right-10 h-80 w-80 rounded-full bg-navy-600 blur-3xl" />
                </div>

                <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
                    <div className="space-y-6">
                        <Badge variant="secondary" className="w-fit bg-gold-500 text-navy-950">
                            <Sparkles className="mr-1 h-3 w-3" />
                            {period?.academic_year
                                ? `Pendaftaran Tahun Ajaran ${period.academic_year}`
                                : 'Sistem Pendaftaran Online'}
                        </Badge>
                        <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                            Pendaftaran Murid Baru
                            <br />
                            <span className="text-gold-400">{school?.name}</span>
                        </h1>
                        <p className="max-w-xl text-base text-navy-100">
                            Daftar online dengan mudah dalam 3 langkah, terima formulir resmi PDF
                            langsung ke WhatsApp Anda. Cepat, transparan, dan tidak perlu antri.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            {canRegister && (
                                <Button asChild size="lg" className="bg-gold-500 text-navy-950 hover:bg-gold-400">
                                    <Link href={route('register')}>
                                        Mulai Pendaftaran
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            )}
                            <Button asChild size="lg" variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20">
                                <Link href="/cek-status">
                                    <Search className="h-4 w-4" />
                                    Cek Status Pendaftaran
                                </Link>
                            </Button>
                        </div>

                        <div className="flex flex-wrap gap-6 pt-2 text-sm">
                            <div className="flex items-center gap-2 text-navy-200">
                                <CalendarDays className="h-4 w-4 text-gold-400" />
                                {period
                                    ? `Dibuka hingga ${new Date(period.closes_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`
                                    : 'Periode pendaftaran akan diumumkan'}
                            </div>
                            <div className="flex items-center gap-2 text-navy-200">
                                <MapPin className="h-4 w-4 text-gold-400" />
                                Kecamatan {school?.district}
                            </div>
                        </div>
                    </div>

                    <div className="relative hidden lg:block">
                        <div className="absolute right-0 top-4 h-72 w-72 rounded-3xl bg-gold-500/10 blur-2xl" />
                        <div className="relative space-y-3 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                            {STEPS.map((step, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-start gap-3 rounded-xl border border-white/5 bg-navy-950/40 p-4"
                                >
                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-500 text-navy-950">
                                        <step.icon className="h-4 w-4" />
                                    </span>
                                    <div>
                                        <p className="text-sm font-semibold text-white">
                                            {idx + 1}. {step.title}
                                        </p>
                                        <p className="text-xs text-navy-200">{step.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Alur (mobile) */}
            <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:hidden lg:px-8">
                <div className="mb-6 text-center">
                    <h2 className="text-xl font-semibold text-navy-950">Alur Pendaftaran</h2>
                    <p className="text-sm text-navy-600">Empat langkah sederhana, selesai dalam hitungan menit.</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                    {STEPS.map((step, idx) => (
                        <Card key={idx}>
                            <CardContent className="flex items-start gap-3 py-4">
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-500 text-navy-950">
                                    <step.icon className="h-4 w-4" />
                                </span>
                                <div>
                                    <p className="text-sm font-semibold text-navy-950">
                                        {idx + 1}. {step.title}
                                    </p>
                                    <p className="text-xs text-navy-600">{step.description}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Syarat */}
            <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid gap-8 lg:grid-cols-2">
                    <div>
                        <p className="text-xs uppercase tracking-widest text-gold-700">Persyaratan</p>
                        <h2 className="mt-2 text-2xl font-semibold text-navy-950">
                            Yang Perlu Disiapkan Sebelum Mendaftar
                        </h2>
                        <p className="mt-2 text-sm text-navy-600">
                            Siapkan dokumen-dokumen berikut agar proses pengisian formulir berjalan lancar.
                        </p>
                    </div>
                    <Card>
                        <CardContent className="py-6">
                            <ul className="space-y-3 text-sm text-navy-800">
                                {REQUIREMENTS.map((item) => (
                                    <li key={item} className="flex items-start gap-3">
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* FAQ */}
            <section className="bg-white">
                <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
                    <div className="mb-8 text-center">
                        <p className="text-xs uppercase tracking-widest text-gold-700">FAQ</p>
                        <h2 className="mt-2 text-2xl font-semibold text-navy-950">Pertanyaan yang Sering Ditanyakan</h2>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {FAQ.map((item) => (
                            <Card key={item.q}>
                                <CardContent className="py-5">
                                    <p className="text-sm font-semibold text-navy-950">{item.q}</p>
                                    <p className="mt-2 text-sm text-navy-600">{item.a}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Footer */}
            <section className="bg-navy-900 text-white">
                <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-12 text-center sm:px-6 lg:px-8">
                    <MessageCircle className="h-9 w-9 text-gold-400" />
                    <h2 className="text-2xl font-semibold">Siap menjadi bagian dari keluarga {school?.name}?</h2>
                    <p className="max-w-xl text-sm text-navy-200">
                        Klik tombol di bawah untuk memulai proses pendaftaran online. Proses pengisian
                        formulir hanya memakan waktu sekitar 10 menit.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3 pt-2">
                        {canRegister && (
                            <Button asChild size="lg" className="bg-gold-500 text-navy-950 hover:bg-gold-400">
                                <Link href={route('register')}>
                                    Mulai Pendaftaran
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        )}
                        {canLogin && (
                            <Button asChild size="lg" variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20">
                                <Link href={route('login')}>Sudah Punya Akun? Masuk</Link>
                            </Button>
                        )}
                    </div>
                </div>
            </section>

            <footer className="bg-navy-950 py-6 text-center text-xs text-navy-300">
                &copy; {new Date().getFullYear()} {school?.name}. {school?.address}.
            </footer>
        </div>
    );
}
