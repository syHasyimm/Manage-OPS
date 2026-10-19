import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, ArrowRight, Download, Loader2, Search, ShieldCheck } from 'lucide-react';
import LandingHeader from '@/Components/Landing/LandingHeader';
import LandingFooter from '@/Components/Landing/LandingFooter';
import schoolProfileData from '@/data/schoolProfile.json';
import { PageTransition, Reveal } from '@/Components/Motion';

const STATUS_LABEL = {
    draft: 'Draf',
    submitted: 'Terkirim',
    verified: 'Terverifikasi',
    accepted: 'Diterima',
    rejected: 'Ditolak',
    need_revision: 'Perlu revisi',
};

const STATUS_COLOR = {
    draft: 'public-status-warning',
    submitted: '',
    verified: 'public-status-success',
    accepted: 'public-status-success',
    rejected: 'public-status-danger',
    need_revision: 'public-status-warning',
};

export default function PublicStatus({ prefill, result }) {
    const { school, auth } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        phone: prefill?.phone ?? '',
        registration_number: prefill?.no ?? '',
    });
    const dashboardRoute = auth?.user?.role === 'admin' ? 'admin.dashboard' : 'dashboard';

    const submit = (event) => {
        event.preventDefault();
        post(route('public-status.check'), {
            preserveScroll: true,
            onError: (validationErrors) => document.getElementById(Object.keys(validationErrors)[0])?.focus(),
        });
    };

    return (
        <div className="spmb-public-page flex min-h-[100dvh] flex-col font-sans selection:bg-amber-200 selection:text-slate-950">
            <Head title="Cek Status Pendaftaran" />
            <a className="skip-link" href="#konten-utama">Lewati ke konten utama</a>
            <LandingHeader home={false} />

            <PageTransition as="main" id="konten-utama" className="public-container flex-1 py-10 sm:py-16">
                <Link href="/" className="public-text-link mb-10"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Kembali ke beranda</Link>
                <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-16">
                    <div className="lg:col-span-5">
                        <span className="public-icon-tile mb-6"><Search className="h-6 w-6" aria-hidden="true" /></span>
                        <h1 className="public-heading">Pantau status pendaftaran.</h1>
                        <p className="public-description">Masukkan nomor WhatsApp terdaftar dan nomor pendaftaran untuk melihat perkembangan data serta hasil verifikasi terbaru.</p>
                        <div className="mt-8 flex gap-3 text-sm leading-7 text-[var(--public-muted)]">
                            <ShieldCheck className="mt-1 h-5 w-5 shrink-0" aria-hidden="true" />
                            <p>Gunakan nomor yang sama saat membuat akun. Nomor pendaftaran tercantum pada formulir PDF Anda.</p>
                        </div>
                        <Link href={auth?.user ? route(dashboardRoute) : route('login')} className="public-text-link mt-6">{auth?.user ? 'Buka dashboard' : 'Sudah punya akun? Masuk'}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
                    </div>

                    <div className="space-y-6 lg:col-span-7">
                        <section className="public-panel p-6 sm:p-8" aria-labelledby="status-form-title">
                            <h2 id="status-form-title" className="font-display text-xl font-semibold">Cek status pendaftaran</h2>
                            <p className="mt-2 text-sm leading-6 text-[var(--public-muted)]">Lengkapi kedua nomor berikut untuk mencari data Anda.</p>
                            <form onSubmit={submit} className="mt-7 space-y-5" aria-busy={processing}>
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-semibold">Nomor HP / WA</label>
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        inputMode="numeric"
                                        autoComplete="tel"
                                        value={data.phone}
                                        onChange={(event) => setData('phone', event.target.value.replace(/\D/g, ''))}
                                        placeholder="Contoh: 081234567890"
                                        className="public-input mt-2"
                                        aria-invalid={Boolean(errors.phone)}
                                        aria-describedby={errors.phone ? 'phone-error' : undefined}
                                    />
                                    {errors.phone && <p id="phone-error" role="alert" className="public-error mt-2 text-sm">{errors.phone}</p>}
                                </div>
                                <div>
                                    <label htmlFor="registration_number" className="block text-sm font-semibold">Nomor Pendaftaran</label>
                                    <input
                                        id="registration_number"
                                        name="registration_number"
                                        value={data.registration_number}
                                        onChange={(event) => setData('registration_number', event.target.value.toUpperCase())}
                                        placeholder="Contoh: SPMB-2026-0001"
                                        className="public-input mt-2"
                                        aria-invalid={Boolean(errors.registration_number)}
                                        aria-describedby={errors.registration_number ? 'registration-number-error' : undefined}
                                        autoCapitalize="characters"
                                        spellCheck={false}
                                    />
                                    {errors.registration_number && <p id="registration-number-error" role="alert" className="public-error mt-2 text-sm">{errors.registration_number}</p>}
                                </div>
                                <button type="submit" disabled={processing} className="public-button public-button-primary w-full">
                                    {processing ? <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <Search className="h-4 w-4" aria-hidden="true" />}
                                    {processing ? 'Memeriksa...' : 'Cek Status'}
                                </button>
                            </form>
                        </section>

                        {result && (
                            <Reveal as="section" key={result.registration_number + result.status} className="public-panel p-6 sm:p-8" aria-labelledby="status-result-title" aria-live="polite">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <h2 id="status-result-title" className="font-display text-xl font-semibold">Hasil pencarian</h2>
                                    <span className={'public-status-label ' + (STATUS_COLOR[result.status] || '')}>{STATUS_LABEL[result.status] || result.status}</span>
                                </div>
                                <p className="mt-4 break-words font-mono text-sm font-semibold tracking-wide">{result.registration_number}</p>
                                <dl className="mt-6 grid gap-5 text-sm sm:grid-cols-2">
                                    <div><dt className="text-[var(--public-muted)]">Nama Murid</dt><dd className="mt-1.5 font-medium">{result.student_name ?? '-'}</dd></div>
                                    <div><dt className="text-[var(--public-muted)]">Tahun Ajaran</dt><dd className="mt-1.5 font-medium">{result.period}</dd></div>
                                    <div><dt className="text-[var(--public-muted)]">Tanggal dikirim</dt><dd className="mt-1.5 font-medium">{result.submitted_at ? new Date(result.submitted_at).toLocaleString('id-ID') : 'Belum dikirim'}</dd></div>
                                    <div><dt className="text-[var(--public-muted)]">Diverifikasi</dt><dd className="mt-1.5 font-medium">{result.verified_at ? new Date(result.verified_at).toLocaleString('id-ID') : 'Belum'}</dd></div>
                                </dl>
                                {result.admin_note && (
                                    <div className="mt-6 flex gap-3 rounded-xl bg-[var(--public-soft)] p-4">
                                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                                        <div><h3 className="text-sm font-semibold">Catatan panitia</h3><p className="mt-2 whitespace-pre-line break-words text-sm leading-7 text-[var(--public-muted)]">{result.admin_note}</p></div>
                                    </div>
                                )}
                                {result.pdf_url && <a href={result.pdf_url} target="_blank" rel="noopener noreferrer" className="public-button public-button-secondary mt-6 w-full sm:w-auto"><Download className="h-4 w-4" aria-hidden="true" />Unduh formulir PDF</a>}
                            </Reveal>
                        )}
                    </div>
                </div>
            </PageTransition>

            <LandingFooter profileData={schoolProfileData} school={school} home={false} />
        </div>
    );
}
