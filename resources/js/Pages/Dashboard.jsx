import { Head, Link, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    Download,
    FileText,
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

export default function Dashboard({ period, registration }) {
    const resendForm = useForm({});

    const handleResend = () => {
        if (!registration?.id) return;
        resendForm.post(route('registration.resend-wa', { registration: registration.id }), {
            preserveScroll: true,
        });
    };

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
                {!period && (
                    <Alert variant="warning">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Periode pendaftaran belum dibuka</AlertTitle>
                        <AlertDescription>
                            Saat ini belum ada periode pendaftaran aktif. Silakan tunggu pengumuman
                            resmi dari sekolah.
                        </AlertDescription>
                    </Alert>
                )}

                {period && !registration && (
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
                            {(registration.status === 'draft' || registration.status === 'need_revision') && (
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
                                <li className="flex items-center gap-3">
                                    <span
                                        className={
                                            registration.submitted_at
                                                ? 'flex h-7 w-7 items-center justify-center rounded-full bg-gold-500 text-navy-950'
                                                : 'flex h-7 w-7 items-center justify-center rounded-full bg-navy-100 text-navy-400'
                                        }
                                    >
                                        <CheckCircle2 className="h-4 w-4" />
                                    </span>
                                    Formulir disubmit
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
