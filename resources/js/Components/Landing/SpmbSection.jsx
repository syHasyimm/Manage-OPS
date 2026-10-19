import { Link, usePage } from '@inertiajs/react';
import { MotionItem, Reveal, Stagger } from '@/Components/Motion';
import {
    ArrowRight, CalendarDays, Check, CheckCircle2, ClipboardList, FileCheck2,
    FileText, HeartHandshake, Lock, MessageCircle, Search, ShieldCheck, Smartphone, UserCheck,
} from 'lucide-react';
import { formatDate } from '@/lib/date';

export default function SpmbSection({ profileData, period, canRegister, canLogin, registrationOpen }) {
    const { auth, school } = usePage().props;
    const schoolName = school?.name || profileData.profil.nama;
    const spmb = profileData.spmb;
    const opensAt = formatDate(period?.opens_at);
    const closesAt = formatDate(period?.closes_at);
    const opensInFuture = period?.opens_at ? new Date(period.opens_at).getTime() > Date.now() : false;
    const dashboardRoute = auth?.user?.role === 'admin' ? 'admin.dashboard' : 'dashboard';
    const periodLabel = registrationOpen ? 'Pendaftaran dibuka' : opensInFuture ? 'Segera dibuka' : period ? 'Pendaftaran ditutup' : 'Menunggu jadwal';
    const periodDescription = registrationOpen
        ? 'Silakan mulai pendaftaran sebelum batas waktu berakhir.'
        : opensInFuture
            ? 'Siapkan data dan dokumen sambil menunggu pendaftaran dibuka.'
            : period
                ? 'Pendaftaran periode ini telah berakhir. Anda tetap dapat memeriksa status.'
                : 'Jadwal pendaftaran akan diumumkan melalui halaman ini.';
    const primaryHref = auth?.user ? route(dashboardRoute) : canRegister && registrationOpen ? route('register') : null;
    const primaryLabel = auth?.user ? 'Buka dashboard' : primaryHref ? 'Mulai pendaftaran' : opensInFuture || !period ? 'Pendaftaran belum dibuka' : 'Pendaftaran ditutup';
    const steps = [
        { icon: MessageCircle, title: spmb.steps[0].title, description: 'Buat akun dengan nomor WhatsApp orang tua atau wali, lalu verifikasi nomor dengan kode OTP.' },
        { icon: UserCheck, title: spmb.steps[1].title, description: 'Isi identitas calon murid, data periodik, dan data orang tua. Periksa kembali sebelum mengirim formulir.' },
        { icon: FileCheck2, title: spmb.steps[2].title, description: 'Simpan formulir PDF dan nomor pendaftaran. Gunakan menu cek status untuk melihat hasil verifikasi.' },
    ];
    const documentIcons = [FileText, ClipboardList, ShieldCheck, Smartphone];
    const afterRegistration = [
        { icon: ClipboardList, title: 'Simpan nomor pendaftaran', description: 'Gunakan nomor ini bersama nomor WhatsApp terdaftar untuk memeriksa status.' },
        { icon: Search, title: 'Pantau hasil verifikasi', description: 'Lihat perkembangan pendaftaran dan catatan perbaikan dari panitia.' },
        { icon: FileCheck2, title: 'Unduh bukti pendaftaran', description: 'Simpan formulir PDF sebagai bukti bahwa data Anda sudah dikirim.' },
    ];
    const openChat = () => window.dispatchEvent(new CustomEvent('spmb:open-chat'));

    return (
        <>
            <section id="spmb" tabIndex={-1} aria-labelledby="spmb-title" className="public-hero scroll-mt-24">
                <div className="public-container grid items-center gap-10 pb-10 pt-10 sm:pt-14 lg:grid-cols-12 lg:gap-12 lg:pb-12 lg:pt-14">
                    <Stagger className="lg:col-span-7">
                        <MotionItem as="p" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--public-muted)]">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--public-accent-soft)] text-[var(--public-accent-ink)]"><Check className="h-4 w-4" aria-hidden="true" /></span>
                            Penerimaan murid baru
                        </MotionItem>
                        <MotionItem as="h1" id="spmb-title" className="max-w-[16ch] font-display text-[clamp(2rem,9.5vw,4.5rem)] font-semibold leading-[1.08] tracking-[-0.045em] text-[var(--public-ink)] lg:text-[clamp(3rem,5.2vw,4.5rem)]">
                            Langkah kecil,<br className="hidden sm:block" /> masa depan besar.
                        </MotionItem>
                        <MotionItem as="p" className="mt-6 max-w-[32rem] text-base leading-7 text-[var(--public-muted)] sm:text-lg sm:leading-8">
                            Daftar dari rumah, lengkapi data, dan pantau hasilnya. Awali perjalanan belajar bersama {schoolName}.
                        </MotionItem>
                        <MotionItem className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                            {primaryHref ? (
                                <Link href={primaryHref} className="public-button public-button-primary">
                                    {primaryLabel}<ArrowRight className="h-4 w-4" aria-hidden="true" />
                                </Link>
                            ) : (
                                <button type="button" disabled className="public-button public-button-disabled">
                                    <Lock className="h-4 w-4" aria-hidden="true" />{primaryLabel}
                                </button>
                            )}
                            <Link href="/cek-status" className="public-button public-button-secondary"><Search className="h-4 w-4" aria-hidden="true" />Cek status</Link>
                        </MotionItem>
                    </Stagger>
                    <Reveal className="relative mx-auto w-full max-w-[28rem] lg:col-span-5 lg:max-w-none" direction="right" delay={0.12}>
                        <div className="public-photo-frame">
                            <img src="/images/spmb/hero-family.webp" alt="Orang tua mendampingi calon murid menuju sekolah" width="1122" height="1402" className="aspect-[4/5] w-full rounded-[2rem] object-cover" loading="eager" fetchpriority="high" />
                        </div>
                    </Reveal>
                </div>
                <div className="public-container pb-10 sm:pb-14">
                    <Reveal as="aside" aria-label="Jadwal pendaftaran" className="public-panel grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-center">
                        <div className="flex items-start gap-4">
                            <span className="public-icon-tile"><CalendarDays className="h-6 w-6" aria-hidden="true" /></span>
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                                    <h2 className="font-display text-lg font-semibold">{period?.academic_year ? 'Tahun ajaran ' + period.academic_year : 'Informasi pendaftaran'}</h2>
                                    <span className={'public-status-label ' + (registrationOpen ? 'public-status-success' : 'public-status-warning')}><span className={'h-1.5 w-1.5 rounded-full ' + (registrationOpen ? 'bg-[var(--public-accent)]' : 'bg-amber-600')} aria-hidden="true" />{periodLabel}</span>
                                </div>
                                <p className="mt-2 text-sm leading-6 text-[var(--public-muted)]">{periodDescription}</p>
                                {period && (opensAt || closesAt) && <p className="mt-2 text-sm font-medium">{opensAt && <>Buka: {opensAt}</>}{opensAt && closesAt && <span className="mx-2 text-[var(--public-muted)]">/</span>}{closesAt && <>Tutup: {closesAt}</>}</p>}
                            </div>
                        </div>
                        {!auth?.user && canLogin ? (
                            <Link href={route('login')} className="public-text-link ml-[4.25rem] lg:ml-0">Sudah punya akun? Masuk<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
                        ) : <a href="#alur" className="public-text-link ml-[4.25rem] lg:ml-0">Lihat alur pendaftaran<ArrowRight className="h-4 w-4" aria-hidden="true" /></a>}
                    </Reveal>
                </div>
            </section>
            <section id="alur" tabIndex={-1} aria-labelledby="alur-title" className="public-section border-t border-[var(--public-line)]">
                <div className="public-container grid gap-12 lg:grid-cols-12 lg:gap-16">
                    <Reveal className="lg:col-span-5">
                        <span className="public-icon-tile public-icon-tile-success mb-6"><HeartHandshake className="h-6 w-6" aria-hidden="true" /></span>
                        <h2 id="alur-title" className="public-heading">Mendaftar lebih mudah, selangkah demi selangkah.</h2>
                        <p className="public-description">Ikuti tiga tahap berikut. Anda bisa mengisi formulir secara bertahap dan meninjau data sebelum mengirimnya.</p>
                        <div className="mt-8 inline-flex items-center gap-3 rounded-xl bg-[var(--public-accent-soft)] px-4 py-3 text-sm font-medium text-[var(--public-accent-ink)]"><CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />Pendaftaran tidak dipungut biaya.</div>
                    </Reveal>
                    <ol className="public-step-list lg:col-span-7">
                        {steps.map((step, index) => (
                            <li key={step.title} className="relative grid grid-cols-[3rem_1fr] gap-5 pb-9 last:pb-0 sm:gap-6">
                                <span className="public-step-number relative flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--public-line)] bg-[var(--public-surface)] font-display text-lg font-semibold" aria-hidden="true">{index + 1}</span>
                                <Reveal delay={index * 0.05}>
                                    <div className="flex items-start gap-3">
                                        <h3 className="font-display text-xl font-semibold leading-7 sm:text-2xl">{step.title}</h3>
                                        <step.icon className="mt-1 h-5 w-5 shrink-0 text-[var(--public-muted)]" aria-hidden="true" />
                                    </div>
                                    <p className="mt-3 max-w-lg text-sm leading-7 text-[var(--public-muted)] sm:text-base">{step.description}</p>
                                </Reveal>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>
            <section id="persyaratan" tabIndex={-1} aria-labelledby="persyaratan-title" className="public-section bg-[var(--public-soft)]">
                <div className="public-container">
                    <Reveal className="mb-10 max-w-2xl">
                        <h2 id="persyaratan-title" className="public-heading">Siapkan dulu, daftar lebih lancar.</h2>
                        <p className="public-description">Gunakan data sesuai dokumen resmi. Siapkan berkas yang jelas terbaca agar proses verifikasi lebih mudah.</p>
                    </Reveal>
                    <div className="grid gap-5 lg:grid-cols-12">
                        <Reveal className="public-age-panel rounded-3xl p-7 sm:p-8 lg:col-span-4">
                            <CalendarDays className="h-7 w-7" aria-hidden="true" />
                            <p className="mt-8 text-sm font-medium">Ketentuan usia calon murid</p>
                            <p className="mt-3 font-display text-3xl font-semibold leading-[1.2]">{spmb.syarat[0]}</p>
                            <p className="mt-6 text-sm leading-6">Pastikan tanggal lahir sesuai dengan Akta Kelahiran.</p>
                        </Reveal>
                        <div className="grid gap-5 sm:grid-cols-2 lg:col-span-8">
                            {spmb.syarat.slice(1).map((requirement, index) => {
                                const Icon = documentIcons[index] || FileText;
                                return (
                                    <Reveal key={requirement} className="motion-lift rounded-3xl bg-[var(--public-surface)] p-6" delay={index * 0.06}>
                                        <Icon className="h-6 w-6 text-blue-700" aria-hidden="true" />
                                        <h3 className="mt-5 text-base font-semibold leading-7">{requirement}</h3>
                                        {index === 2 && <p className="mt-2 text-sm leading-6 text-[var(--public-muted)]">Tidak wajib. Siapkan hanya jika memiliki.</p>}
                                    </Reveal>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>
            <section id="status" tabIndex={-1} aria-labelledby="status-title" className="public-section">
                <div className="public-container">
                    <Reveal className="max-w-2xl">
                        <h2 id="status-title" className="public-heading">Sudah mendaftar? Pantau kabar berikutnya.</h2>
                        <p className="public-description">Gunakan nomor WhatsApp dan nomor pendaftaran untuk melihat perkembangan data, hasil verifikasi, serta catatan panitia.</p>
                    </Reveal>
                    <div className="mt-10 grid gap-6 lg:grid-cols-12">
                        <div className="space-y-6 lg:col-span-7 lg:pr-8">
                            {afterRegistration.map((item, index) => (
                                <Reveal key={item.title} className="flex gap-4" delay={index * 0.04}>
                                    <span className="public-icon-tile h-11 w-11 rounded-xl"><item.icon className="h-5 w-5" aria-hidden="true" /></span>
                                    <div><h3 className="font-display text-lg font-semibold">{item.title}</h3><p className="mt-1 text-sm leading-6 text-[var(--public-muted)]">{item.description}</p></div>
                                </Reveal>
                            ))}
                            <Link href="/cek-status" className="public-text-link ml-[4.25rem]">Cek status pendaftaran<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
                        </div>
                        <Reveal className="public-panel flex flex-col items-start p-7 sm:p-8 lg:col-span-5">
                            <span className="public-icon-tile"><MessageCircle className="h-6 w-6" aria-hidden="true" /></span>
                            <h3 className="mt-6 font-display text-2xl font-semibold">Kami bantu jika Anda bingung.</h3>
                            <p className="mt-3 text-sm leading-7 text-[var(--public-muted)]">Tanyakan jadwal, persyaratan, atau cara mendaftar melalui Asisten SPMB.</p>
                            <button type="button" onClick={openChat} className="public-button public-button-primary mt-6 w-full sm:w-auto">Tanya Asisten SPMB<ArrowRight className="h-4 w-4" aria-hidden="true" /></button>
                        </Reveal>
                    </div>
                </div>
            </section>
        </>
    );
}
