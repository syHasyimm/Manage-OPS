import { Head, Link, router, useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import {
    AlertCircle,
    CalendarClock,
    CheckCircle2,
    Clock,
    Download,
    FileText,
    Lock,
    MessageCircle,
    PencilLine,
    PlayCircle,
    RefreshCw,
    XCircle,
    Loader2,
} from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/Components/ui/alert';

const STATUS_META = {
    draft: {
        label: 'Draft',
        variant: 'warning',
        icon: PencilLine,
        title: 'Pendaftaran masih draft',
        description: 'Lanjutkan pengisian formulir untuk dapat di-submit ke sekolah.',
    },
    submitted: {
        label: 'Terkirim',
        variant: 'default',
        icon: Clock,
        title: 'Menunggu Verifikasi',
        description: 'Pendaftaran Anda telah diterima dan sedang diverifikasi oleh admin.',
    },
    verified: {
        label: 'Terverifikasi',
        variant: 'secondary',
        icon: CheckCircle2,
        title: 'Pendaftaran Terverifikasi',
        description: 'Data Anda telah lolos verifikasi awal. Menunggu keputusan akhir.',
    },
    accepted: {
        label: 'Diterima',
        variant: 'success',
        icon: CheckCircle2,
        title: 'Selamat! Anda Diterima',
        description: 'Pendaftaran calon murid Anda diterima. Silakan ikuti pengumuman selanjutnya dari sekolah.',
    },
    rejected: {
        label: 'Ditolak',
        variant: 'destructive',
        icon: XCircle,
        title: 'Pendaftaran Ditolak',
        description: 'Mohon maaf, pendaftaran Anda belum dapat kami terima. Lihat catatan admin.',
    },
    need_revision: {
        label: 'Perlu Revisi',
        variant: 'warning',
        icon: AlertCircle,
        title: 'Perlu Revisi',
        description: 'Admin meminta perbaikan data. Silakan ubah formulir lalu submit ulang.',
    },
};

function StatusCard({ registration }) {
    const meta = STATUS_META[registration.status] ?? STATUS_META.draft;
    const Icon = meta.icon;

    return (
        <Card>
            <CardContent className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gold-500/15 text-gold-700">
                    <Icon className="h-7 w-7" />
                </div>
                <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-semibold text-navy-950">{meta.title}</h2>
                        <Badge variant={meta.variant}>{meta.label}</Badge>
                    </div>
                    <p className="text-sm text-navy-600">{meta.description}</p>
                    {registration.registration_number && (
                        <p className="pt-1 text-sm font-medium text-navy-900">
                            No. Pendaftaran:{' '}
                            <span className="select-all font-mono tracking-wider text-gold-700">
                                {registration.registration_number}
                            </span>
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function formatDate(value) {
    return new Date(value).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

function RegistrationClosedHero({ period }) {
    const now = new Date();
    let state = 'none';
    if (period) {
        const opens = new Date(period.opens_at);
        const closes = new Date(period.closes_at);
        if (opens > now) {
            state = 'upcoming';
        } else if (closes < now) {
            state = 'closed';
        } else {
            state = 'closed';
        }
    }

    const meta = {
        none: {
            Icon: CalendarClock,
            title: 'Pendaftaran Belum Dibuka',
            description:
                'Saat ini belum ada periode pendaftaran yang aktif. Nantikan pengumuman resmi dari sekolah untuk jadwal pendaftaran berikutnya.',
            note: null,
        },
        upcoming: {
            Icon: CalendarClock,
            title: 'Pendaftaran Segera Dibuka',
            description: `Pendaftaran untuk Tahun Ajaran ${period?.academic_year ?? ''} akan segera dibuka. Siapkan berkas Anda dari sekarang.`,
            note: period ? `Dibuka pada ${formatDate(period.opens_at)}` : null,
        },
        closed: {
            Icon: Lock,
            title: 'Pendaftaran Telah Ditutup',
            description: `Masa pendaftaran untuk Tahun Ajaran ${period?.academic_year ?? ''} telah berakhir. Terima kasih atas antusiasme Anda.`,
            note: period ? `Ditutup pada ${formatDate(period.closes_at)}` : null,
        },
    }[state];

    const { Icon } = meta;

    return (
        <Card className="overflow-hidden border-gold-200/60">
            <CardContent className="relative flex flex-col items-center gap-6 bg-gradient-to-b from-gold-500/10 via-white to-white px-6 py-14 text-center">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-navy-950/5 to-transparent" />
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gold-500/15 ring-8 ring-gold-500/5">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold-500 text-navy-950 shadow-lg shadow-gold-500/30">
                        <Icon className="h-8 w-8" />
                    </div>
                </div>
                <div className="relative max-w-md space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight text-navy-950">{meta.title}</h2>
                    <p className="text-sm leading-relaxed text-navy-600">{meta.description}</p>
                </div>
                {meta.note && (
                    <div className="relative inline-flex items-center gap-2 rounded-full border border-gold-300/70 bg-gold-500/10 px-4 py-1.5 text-sm font-medium text-gold-800">
                        <Clock className="h-4 w-4" />
                        {meta.note}
                    </div>
                )}
                <div className="relative flex flex-wrap justify-center gap-2 pt-2">
                    <Button asChild variant="outline">
                        <Link href={route('public-status.show')}>
                            <FileText className="h-4 w-4" />
                            Cek Status Kelulusan
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

export default function Dashboard({ period, isOpen, registration }) {
    const resendForm = useForm({});

    const handleResend = () => {
        if (!registration?.id) return;
        resendForm.post(route('registration.resend-wa', { registration: registration.id }), {
            preserveScroll: true,
        });
    };

    // Polling agar tombol Download PDF muncul otomatis saat job queue selesai
    // tanpa harus hard refresh. Stop saat pdf_ready=true atau setelah 60 detik.
    useEffect(() => {
        if (!registration?.registration_number) return;
        if (registration.pdf_ready) return;
        let ticks = 0;
        const id = setInterval(() => {
            ticks += 1;
            if (ticks > 30) {
                clearInterval(id);
                return;
            }
            router.reload({
                only: ['registration'],
                preserveScroll: true,
                preserveState: true,
            });
        }, 2000);
        return () => clearInterval(id);
    }, [registration?.pdf_ready, registration?.registration_number]);

    return (
        <AppLayout
            header={
                <div>
                    <p className="text-xs uppercase tracking-widest text-gold-600">Dashboard</p>
                    <h1 className="mt-1 text-xl font-semibold text-navy-950">Beranda Pendaftar</h1>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="space-y-6">
                {!isOpen && !registration && <RegistrationClosedHero period={period} />}

                {!isOpen && registration && (
                    <Alert variant="warning">
                        <Lock className="h-4 w-4" />
                        <AlertTitle>Pendaftaran sedang tidak dibuka</AlertTitle>
                        <AlertDescription>
                            Periode pendaftaran saat ini tidak aktif. Anda tetap dapat melihat status
                            dan mengunduh dokumen pendaftaran Anda di bawah ini.
                        </AlertDescription>
                    </Alert>
                )}

                {isOpen && period && !registration && (
                    <Card>
                        <CardContent className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-base font-semibold text-navy-950">
                                    Mulai Pendaftaran Tahun Ajaran {period.academic_year}
                                </h2>
                                <p className="text-sm text-navy-600">
                                    Lengkapi 3 langkah sederhana untuk mendaftarkan calon murid.
                                </p>
                            </div>
                            <Button asChild>
                                <Link href={route('registration.start')}>
                                    <PlayCircle className="h-4 w-4" />
                                    Mulai Pendaftaran
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {registration && <StatusCard registration={registration} />}

                {registration?.admin_note && (
                    <Alert variant="info">
                        <MessageCircle className="h-4 w-4" />
                        <AlertTitle>Catatan dari Admin</AlertTitle>
                        <AlertDescription>{registration.admin_note}</AlertDescription>
                    </Alert>
                )}

                {registration && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Aksi Cepat</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-2">
                            {isOpen && (registration.status === 'draft' || registration.status === 'need_revision') && (
                                <Button asChild>
                                    <Link href={route('registration.start')}>
                                        <FileText className="h-4 w-4" />
                                        {registration.current_step > 1 ? 'Lanjutkan Formulir' : 'Isi Formulir'}
                                    </Link>
                                </Button>
                            )}

                            {registration.registration_number && registration.pdf_ready && (
                                <Button asChild variant="outline">
                                    <a
                                        href={route('registration.pdf', { registration: registration.id })}
                                        target="_blank"
                                        rel="noopener"
                                    >
                                        <Download className="h-4 w-4" />
                                        Download PDF
                                    </a>
                                </Button>
                            )}

                            {registration.registration_number && !registration.pdf_ready && (
                                <Button variant="outline" disabled>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    PDF sedang dibuat...
                                </Button>
                            )}

                            {registration.status !== 'draft' && registration.registration_number && (
                                <Button variant="ghost" onClick={handleResend} disabled={resendForm.processing}>
                                    {resendForm.processing ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <RefreshCw className="h-4 w-4" />
                                    )}
                                    Kirim Ulang ke WhatsApp
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}

                {registration && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Linimasa</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ol className="space-y-3 text-sm">
                                <li className="flex items-center gap-3">
                                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold-500 text-navy-950">
                                        <CheckCircle2 className="h-4 w-4" />
                                    </span>
                                    Akun terdaftar & nomor terverifikasi
                                </li>
                                <li className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                    <span
                                        className={
                                            registration.submitted_at
                                                ? 'flex h-7 w-7 items-center justify-center rounded-full bg-gold-500 text-navy-950'
                                                : 'flex h-7 w-7 items-center justify-center rounded-full bg-navy-100 text-navy-400'
                                        }
                                    >
                                        <CheckCircle2 className="h-4 w-4" />
                                    </span>
                                    <span className="min-w-0 break-words">Formulir disubmit</span>
                                    {registration.submitted_at && (
                                        <span className="text-xs text-navy-500">
                                            ({new Date(registration.submitted_at).toLocaleString('id-ID')})
                                        </span>
                                    )}
                                </li>
                                <li className="flex items-center gap-3">
                                    <span
                                        className={
                                            ['verified', 'accepted', 'rejected'].includes(registration.status)
                                                ? 'flex h-7 w-7 items-center justify-center rounded-full bg-gold-500 text-navy-950'
                                                : 'flex h-7 w-7 items-center justify-center rounded-full bg-navy-100 text-navy-400'
                                        }
                                    >
                                        <CheckCircle2 className="h-4 w-4" />
                                    </span>
                                    Verifikasi admin
                                </li>
                                <li className="flex items-center gap-3">
                                    <span
                                        className={
                                            registration.status === 'accepted'
                                                ? 'flex h-7 w-7 items-center justify-center rounded-full bg-gold-500 text-navy-950'
                                                : 'flex h-7 w-7 items-center justify-center rounded-full bg-navy-100 text-navy-400'
                                        }
                                    >
                                        <CheckCircle2 className="h-4 w-4" />
                                    </span>
                                    Keputusan akhir
                                </li>
                            </ol>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
