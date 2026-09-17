import { Head, Link, router, useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import {
    AlertCircle,
    ArrowRight,
    CalendarClock,
    CheckCircle2,
    Clock,
    Download,
    FileCheck2,
    FileText,
    Lock,
    MessageCircle,
    PencilLine,
    RefreshCw,
    ShieldCheck,
    XCircle,
    Loader2,
} from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { formatDate } from '@/lib/date';

const STATUS_META = {
    draft: {
        label: 'Draft',
        icon: PencilLine,
        title: 'Lengkapi data pendaftaran',
        description: 'Formulir Anda tersimpan. Lengkapi bagian yang belum selesai sebelum mengirimkannya ke sekolah.',
        badge: 'warning',
        iconClass: 'bg-gold-300 text-navy-950',
        surfaceClass: 'border-gold-300/30 bg-gold-300/10',
    },
    submitted: {
        label: 'Terkirim',
        icon: Clock,
        title: 'Berkas sedang diperiksa',
        description: 'Formulir sudah diterima. Tim sekolah akan memeriksa kelengkapan dan kesesuaian data Anda.',
        badge: 'default',
        iconClass: 'bg-sky-100 text-sky-800',
        surfaceClass: 'border-sky-200 bg-sky-50',
    },
    verified: {
        label: 'Terverifikasi',
        icon: ShieldCheck,
        title: 'Data telah terverifikasi',
        description: 'Berkas Anda lolos pemeriksaan awal. Silakan tunggu pengumuman keputusan dari sekolah.',
        badge: 'secondary',
        iconClass: 'bg-gold-300 text-navy-950',
        surfaceClass: 'border-gold-300/30 bg-gold-300/10',
    },
    accepted: {
        label: 'Diterima',
        icon: CheckCircle2,
        title: 'Calon murid diterima',
        description: 'Selamat. Ikuti informasi lanjutan dari sekolah dan simpan bukti pendaftaran Anda.',
        badge: 'success',
        iconClass: 'bg-emerald-100 text-emerald-800',
        surfaceClass: 'border-emerald-200 bg-emerald-50',
    },
    rejected: {
        label: 'Belum diterima',
        icon: XCircle,
        title: 'Pendaftaran belum dapat diterima',
        description: 'Silakan periksa catatan dari sekolah untuk informasi lebih lanjut.',
        badge: 'destructive',
        iconClass: 'bg-red-100 text-red-800',
        surfaceClass: 'border-red-200 bg-red-50',
    },
    need_revision: {
        label: 'Perlu revisi',
        icon: AlertCircle,
        title: 'Data perlu diperbaiki',
        description: 'Sekolah meminta perubahan pada formulir. Periksa catatan admin lalu kirim kembali data Anda.',
        badge: 'warning',
        iconClass: 'bg-amber-100 text-amber-800',
        surfaceClass: 'border-amber-200 bg-amber-50',
    },
};

function RegistrationProgress({ registration }) {
    const submitted = Boolean(registration.submitted_at);
    const verified = ['verified', 'accepted', 'rejected'].includes(registration.status);
    const concluded = ['accepted', 'rejected'].includes(registration.status);
    const revising = registration.status === 'need_revision';
    const stages = [
        {
            title: 'Akun aktif',
            description: 'Nomor WhatsApp sudah terverifikasi.',
            complete: true,
        },
        {
            title: 'Formulir pendaftaran',
            description: submitted
                ? `Dikirim pada ${formatDate(registration.submitted_at, true)}.`
                : revising
                  ? 'Perbaiki data sesuai catatan sekolah.'
                  : `Pengisian berada di bagian ${registration.current_step || 1} dari 3.`,
            complete: submitted,
            current: !submitted || revising,
        },
        {
            title: 'Pemeriksaan sekolah',
            description: verified
                ? 'Berkas telah diperiksa oleh sekolah.'
                : 'Menunggu pemeriksaan setelah formulir dikirim.',
            complete: verified,
            current: submitted && !verified && !revising,
        },
        {
            title: 'Keputusan akhir',
            description: concluded
                ? 'Keputusan sudah tersedia pada status pendaftaran.'
                : 'Akan tampil setelah proses pemeriksaan selesai.',
            complete: concluded,
            current: verified && !concluded,
        },
    ];

    return (
        <section className="rounded-2xl border border-navy-100 bg-white p-5 shadow-[0_18px_45px_-36px_rgba(16,42,67,.55)] sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className="font-display text-xl font-bold tracking-[-0.02em] text-navy-950">
                        Perjalanan pendaftaran
                    </h2>
                    <p className="mt-1 text-sm text-navy-600">
                        Pantau posisi berkas Anda pada setiap tahap.
                    </p>
                </div>
                <span className="rounded-md bg-navy-50 px-3 py-1.5 text-xs font-semibold text-navy-700">
                    {submitted ? 'Formulir telah dikirim' : 'Formulir belum dikirim'}
                </span>
            </div>

            <ol className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {stages.map((stage, index) => (
                    <li key={stage.title} className="relative min-w-0">
                        <div className="flex items-start gap-3">
                            <span
                                className={
                                    stage.complete
                                        ? 'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy-950 text-gold-300'
                                        : stage.current
                                          ? 'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold-300 text-navy-950 ring-4 ring-gold-300/20'
                                          : 'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy-100 text-navy-400'
                                }
                            >
                                {stage.complete ? <CheckCircle2 className="h-4 w-4" /> : <span className="text-sm font-bold">{index + 1}</span>}
                            </span>
                            <div className="min-w-0">
                                <h3 className="text-sm font-bold text-navy-950">{stage.title}</h3>
                                <p className="mt-1 text-xs leading-5 text-navy-500">{stage.description}</p>
                            </div>
                        </div>
                    </li>
                ))}
            </ol>
        </section>
    );
}

function RegistrationClosedState({ period }) {
    const opensAt = period?.opens_at ? new Date(period.opens_at) : null;
    const isUpcoming = opensAt && opensAt > new Date();
    const Icon = isUpcoming ? CalendarClock : Lock;
    const title = isUpcoming ? 'Pendaftaran segera dibuka' : 'Pendaftaran belum dibuka';
    const description = isUpcoming
        ? `Tahun ajaran ${period.academic_year} dapat didaftarkan mulai ${formatDate(period.opens_at)}.`
        : 'Belum ada periode pendaftaran yang dapat diikuti saat ini. Pantau pengumuman resmi sekolah secara berkala.';

    return (
        <section className="overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-[0_20px_55px_-42px_rgba(16,42,67,.65)]">
            <div className="grid lg:grid-cols-[1.1fr_.9fr]">
                <div className="bg-[#0b2941] p-7 text-white sm:p-10">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-300 text-navy-950">
                        <Icon className="h-6 w-6" />
                    </span>
                    <h2 className="mt-7 font-display text-3xl font-bold tracking-[-0.03em]">{title}</h2>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-navy-200">{description}</p>
                </div>
                <div className="flex flex-col justify-center p-7 sm:p-10">
                    <p className="text-sm font-semibold text-navy-950">Sudah pernah mendaftar?</p>
                    <p className="mt-2 text-sm leading-6 text-navy-600">
                        Gunakan nomor pendaftaran untuk melihat hasil dan mengunduh bukti pendaftaran.
                    </p>
                    <Button asChild variant="outline" className="mt-6 w-full sm:w-fit">
                        <Link href={route('public-status.show')}>
                            <FileText className="h-4 w-4" />
                            Cek status pendaftaran
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}

function StartRegistrationPanel({ period }) {
    return (
        <section className="overflow-hidden rounded-2xl bg-[#0b2941] text-white shadow-[0_24px_58px_-40px_rgba(16,42,67,.8)]">
            <div className="grid gap-8 p-7 sm:p-10 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold-300">
                        Tahun Ajaran {period.academic_year}
                    </p>
                    <h2 className="mt-4 max-w-lg font-display text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
                        Mulai pendaftaran calon murid.
                    </h2>
                    <p className="mt-4 max-w-xl text-sm leading-6 text-navy-200">
                        Isi data calon murid, data periodik, dan data orang tua secara bertahap. Anda dapat melanjutkannya kapan saja.
                    </p>
                    <Button asChild className="mt-7 h-11 bg-gold-300 px-5 font-bold text-navy-950 hover:bg-gold-200">
                        <Link href={route('registration.start')}>
                            Mulai pendaftaran
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                    <p className="text-sm font-bold text-white">Yang perlu disiapkan</p>
                    <div className="mt-5 space-y-4">
                        {[
                            'Nomor WhatsApp orang tua atau wali yang aktif',
                            'Data calon murid sesuai dokumen resmi',
                            'Waktu untuk meninjau ulang sebelum formulir dikirim',
                        ].map((item) => (
                            <div key={item} className="flex gap-3 text-sm leading-6 text-navy-200">
                                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-gold-300" />
                                <span>{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default function Dashboard({ period, isOpen, registration }) {
    const resendForm = useForm({});
    const meta = registration ? (STATUS_META[registration.status] ?? STATUS_META.draft) : null;
    const StatusIcon = meta?.icon;
    const canEdit = isOpen && ['draft', 'need_revision'].includes(registration?.status);
    const hasPdf = Boolean(registration?.registration_number && registration?.pdf_ready);

    const handleResend = () => {
        if (!registration?.id) return;

        resendForm.post(route('registration.resend-wa', { registration: registration.id }), {
            preserveScroll: true,
        });
    };

    useEffect(() => {
        if (!registration?.registration_number || registration.pdf_ready) return;

        let ticks = 0;
        const timer = setInterval(() => {
            ticks += 1;
            if (ticks > 30) {
                clearInterval(timer);
                return;
            }

            router.reload({
                only: ['registration'],
                preserveScroll: true,
                preserveState: true,
            });
        }, 2000);

        return () => clearInterval(timer);
    }, [registration?.pdf_ready, registration?.registration_number]);

    return (
        <AppLayout
            header={
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold-700">Portal pendaftar</p>
                        <h1 className="mt-1 font-display text-2xl font-bold tracking-[-0.025em] text-navy-950">
                            Beranda pendaftaran
                        </h1>
                        <p className="mt-1 text-sm text-navy-600">
                            Pantau status dan kelola dokumen pendaftaran Anda.
                        </p>
                    </div>
                    {period && (
                        <span className="w-fit rounded-md border border-navy-100 bg-navy-50 px-3 py-1.5 text-xs font-semibold text-navy-700">
                            Tahun Ajaran {period.academic_year}
                        </span>
                    )}
                </div>
            }
        >
            <Head title="Dashboard Pendaftar" />

            <div className="space-y-6">
                {!isOpen && !registration && <RegistrationClosedState period={period} />}

                {isOpen && period && !registration && <StartRegistrationPanel period={period} />}

                {registration && (
                    <>
                        <section className="overflow-hidden rounded-2xl bg-[#0b2941] text-white shadow-[0_24px_58px_-40px_rgba(16,42,67,.8)]">
                            <div className="grid gap-7 p-6 sm:p-8 lg:grid-cols-[1fr_18rem] lg:items-start">
                                <div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className="text-xs font-bold uppercase tracking-[0.16em] text-gold-300">
                                            {registration.period ? `Tahun Ajaran ${registration.period}` : 'Pendaftaran calon murid'}
                                        </span>
                                        <Badge variant={meta.badge} className="bg-white/10 text-white ring-1 ring-white/15">
                                            {meta.label}
                                        </Badge>
                                    </div>
                                    <div className="mt-6 flex items-start gap-4">
                                        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${meta.iconClass}`}>
                                            <StatusIcon className="h-6 w-6" />
                                        </span>
                                        <div className="min-w-0">
                                            <h2 className="font-display text-2xl font-bold tracking-[-0.025em] sm:text-3xl">
                                                {registration.student_name ? `Pendaftaran ${registration.student_name}` : meta.title}
                                            </h2>
                                            <p className="mt-2 max-w-2xl text-sm leading-6 text-navy-200">{meta.description}</p>
                                        </div>
                                    </div>

                                    {registration.registration_number && (
                                        <div className="mt-7 inline-flex max-w-full flex-col rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                                            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-navy-300">
                                                Nomor pendaftaran
                                            </span>
                                            <span className="mt-1 select-all font-mono text-base font-bold tracking-[0.08em] text-gold-300">
                                                {registration.registration_number}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <aside className="rounded-xl border border-white/10 bg-white/5 p-5">
                                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-navy-300">Tindakan berikutnya</p>
                                    {canEdit ? (
                                        <>
                                            <p className="mt-3 text-sm leading-6 text-white">
                                                {registration.status === 'need_revision'
                                                    ? 'Perbarui formulir berdasarkan catatan sekolah.'
                                                    : 'Lanjutkan pengisian formulir sebelum mengirimkannya.'}
                                            </p>
                                            <Button asChild className="mt-5 h-10 w-full bg-gold-300 font-bold text-navy-950 hover:bg-gold-200">
                                                <Link href={route('registration.start')}>
                                                    {registration.current_step > 1 ? 'Lanjutkan formulir' : 'Isi formulir'}
                                                    <ArrowRight className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </>
                                    ) : hasPdf ? (
                                        <>
                                            <p className="mt-3 text-sm leading-6 text-white">Bukti pendaftaran sudah siap untuk diunduh dan disimpan.</p>
                                            <Button asChild className="mt-5 h-10 w-full bg-gold-300 font-bold text-navy-950 hover:bg-gold-200">
                                                <a
                                                    href={route('registration.pdf', { registration: registration.id })}
                                                    target="_blank"
                                                    rel="noopener"
                                                >
                                                    Unduh PDF
                                                    <Download className="h-4 w-4" />
                                                </a>
                                            </Button>
                                        </>
                                    ) : (
                                        <p className="mt-3 text-sm leading-6 text-navy-200">
                                            {registration.status === 'submitted'
                                                ? 'Tidak ada tindakan yang diperlukan. Sekolah sedang memeriksa berkas Anda.'
                                                : 'Periksa status pendaftaran secara berkala untuk informasi terbaru.'}
                                        </p>
                                    )}
                                </aside>
                            </div>
                        </section>

                        {registration.admin_note && (
                            <section className={`rounded-2xl border p-5 sm:p-6 ${meta.surfaceClass}`}>
                                <div className="flex gap-3">
                                    <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-navy-800" />
                                    <div>
                                        <h2 className="font-semibold text-navy-950">Catatan dari sekolah</h2>
                                        <p className="mt-2 text-sm leading-6 text-navy-700">{registration.admin_note}</p>
                                    </div>
                                </div>
                            </section>
                        )}

                        {!isOpen && (
                            <section className="rounded-2xl border border-gold-200 bg-gold-50 p-5 sm:p-6">
                                <div className="flex gap-3">
                                    <Lock className="mt-0.5 h-5 w-5 shrink-0 text-gold-800" />
                                    <div>
                                        <h2 className="font-semibold text-navy-950">Periode pendaftaran tidak aktif</h2>
                                        <p className="mt-1 text-sm leading-6 text-navy-700">
                                            Anda tetap dapat memantau status dan mengunduh bukti pendaftaran melalui halaman ini.
                                        </p>
                                    </div>
                                </div>
                            </section>
                        )}

                        <div className="grid gap-6 lg:grid-cols-12">
                            <div className="lg:col-span-8">
                                <RegistrationProgress registration={registration} />
                            </div>

                            <aside className="space-y-6 lg:col-span-4">
                                <section className="rounded-2xl border border-navy-100 bg-white p-5 shadow-[0_18px_45px_-36px_rgba(16,42,67,.55)]">
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-50 text-navy-800">
                                            <FileCheck2 className="h-5 w-5" />
                                        </span>
                                        <div>
                                            <h2 className="font-display text-lg font-bold text-navy-950">Dokumen pendaftaran</h2>
                                            <p className="text-xs text-navy-500">Bukti formulir resmi</p>
                                        </div>
                                    </div>

                                    <div className="mt-5 rounded-lg bg-navy-50 p-4">
                                        <p className="text-sm font-semibold text-navy-950">Formulir PDF</p>
                                        <p className="mt-1 text-xs leading-5 text-navy-600">
                                            {hasPdf
                                                ? 'Dokumen telah tersedia untuk disimpan.'
                                                : registration.registration_number
                                                  ? 'Dokumen sedang disiapkan. Halaman ini akan memperbarui status secara otomatis.'
                                                  : 'Dokumen tersedia setelah formulir dikirim.'}
                                        </p>
                                        {hasPdf ? (
                                            <a
                                                href={route('registration.pdf', { registration: registration.id })}
                                                target="_blank"
                                                rel="noopener"
                                                className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-navy-800 hover:text-gold-700"
                                            >
                                                Buka dokumen
                                                <ArrowRight className="h-3.5 w-3.5" />
                                            </a>
                                        ) : registration.registration_number ? (
                                            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-navy-600">
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                Menyiapkan dokumen
                                            </div>
                                        ) : null}
                                    </div>
                                </section>

                                {registration.status !== 'draft' && registration.registration_number && (
                                    <section className="rounded-2xl border border-navy-100 bg-white p-5 shadow-[0_18px_45px_-36px_rgba(16,42,67,.55)]">
                                        <div className="flex items-center gap-3">
                                            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-300 text-navy-950">
                                                <MessageCircle className="h-5 w-5" />
                                            </span>
                                            <div>
                                                <h2 className="font-display text-lg font-bold text-navy-950">Notifikasi WhatsApp</h2>
                                                <p className="text-xs text-navy-500">Kirim ulang bukti pendaftaran</p>
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleResend}
                                            disabled={resendForm.processing}
                                            className="mt-5 w-full"
                                        >
                                            {resendForm.processing ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <RefreshCw className="h-4 w-4" />
                                            )}
                                            Kirim ulang ke WhatsApp
                                        </Button>
                                    </section>
                                )}
                            </aside>
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
