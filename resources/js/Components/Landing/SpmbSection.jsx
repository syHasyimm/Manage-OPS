import { Link, usePage } from '@inertiajs/react';
import { motion, useReducedMotion } from 'motion/react';
import {
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    FileCheck2,
    HelpCircle,
    Lock,
    LogIn,
    MessageCircle,
    Search,
    ShieldCheck,
    UserCheck,
} from 'lucide-react';
import { Button } from '@/Components/ui/button';

import { formatDate } from '@/lib/date';

const revealProps = (reducedMotion, delay = 0, direction = 'up') => {
    if (reducedMotion) return {};

    const offset = direction === 'left'
        ? { x: -32, y: 0 }
        : direction === 'right'
          ? { x: 32, y: 0 }
          : { x: 0, y: 28 };

    return {
        initial: { opacity: 0, ...offset },
        whileInView: { opacity: 1, x: 0, y: 0 },
        viewport: { once: true, amount: 0.18 },
        transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] },
    };
};

export default function SpmbSection({
    profileData,
    period,
    canRegister,
    canLogin,
    registrationOpen,
}) {
    const { auth, school } = usePage().props;
    const reducedMotion = useReducedMotion();
    const spmb = profileData.spmb;
    const schoolName = school?.name || profileData.profil.nama;
    const ageRequirement = spmb.syarat[0];
    const opensAt = formatDate(period?.opens_at);
    const closesAt = formatDate(period?.closes_at);
    const opensInFuture = period?.opens_at
        ? new Date(period.opens_at).getTime() > Date.now()
        : false;
    const periodTitle = period?.academic_year
        ? `Tahun Ajaran ${period.academic_year}`
        : 'Periode berikutnya';
    const periodDescription = registrationOpen
        ? closesAt
            ? `Pendaftaran dibuka sampai ${closesAt}.`
            : 'Pendaftaran sedang dibuka.'
        : opensInFuture && opensAt
          ? `Pendaftaran mulai ${opensAt}.`
          : 'Jadwal pembukaan akan diumumkan melalui portal ini.';
    const dashboardRoute = auth?.user?.role === 'admin'
        ? 'admin.dashboard'
        : 'dashboard';
    const stepIcons = [MessageCircle, UserCheck, FileCheck2];
    const afterRegistration = [
        {
            title: 'Simpan nomor pendaftaran',
            description: 'Nomor ini menjadi kunci untuk memeriksa progres tanpa harus masuk ke akun.',
        },
        {
            title: 'Pantau hasil verifikasi',
            description: 'Lihat status berkas dan catatan perbaikan melalui halaman cek status.',
        },
        {
            title: 'Unduh bukti pendaftaran',
            description: 'Simpan formulir PDF sebagai bukti dan bawa jika sekolah meminta verifikasi langsung.',
        },
    ];

    const openChat = () => {
        window.dispatchEvent(new CustomEvent('spmb:open-chat'));
    };

    const primaryAction = () => {
        if (auth?.user) {
            return (
                <Button asChild size="lg" className="h-12 rounded-lg bg-gold-300 px-6 font-bold text-navy-950 hover:bg-gold-200">
                    <Link href={route(dashboardRoute)}>
                        Buka dashboard
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </Button>
            );
        }

        if (canRegister && registrationOpen) {
            return (
                <Button asChild size="lg" className="h-12 rounded-lg bg-gold-300 px-6 font-bold text-navy-950 hover:bg-gold-200">
                    <Link href={route('register')}>
                        Mulai pendaftaran
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </Button>
            );
        }

        return (
            <Button type="button" size="lg" disabled className="h-12 rounded-lg border border-white/15 bg-white/10 px-6 text-navy-300">
                <Lock className="h-4 w-4" />
                Pendaftaran belum dibuka
            </Button>
        );
    };

    return (
        <>
            <section id="spmb" className="relative isolate overflow-hidden bg-[#071827] text-white">
                <div
                    aria-hidden="true"
                    className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_86%)]"
                />
                <div aria-hidden="true" className="absolute -left-40 top-24 h-96 w-96 rounded-full bg-gold-300/10 blur-[120px]" />

                <div className="relative mx-auto grid min-h-[calc(100dvh-4.5rem)] max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-12 lg:px-8">
                    <motion.div className="max-w-2xl lg:col-span-6 lg:pr-8" {...revealProps(reducedMotion, 0.05, 'left')}>
                        <div className="mb-6 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-gold-300">
                            <span className={`h-2 w-2 rounded-full ${registrationOpen ? 'bg-emerald-400' : 'bg-gold-300'}`} />
                            <span>{registrationOpen ? 'Pendaftaran sedang dibuka' : 'Informasi penerimaan murid baru'}</span>
                        </div>

                        <h1 className="max-w-[12ch] font-display text-5xl font-bold leading-[0.98] tracking-[-0.045em] text-white sm:text-6xl lg:text-7xl">
                            Langkah awal sekolah dimulai di sini.
                        </h1>
                        <p className="mt-6 max-w-xl text-base leading-7 text-navy-200 sm:text-lg">
                            Daftar dari rumah, siapkan dokumen, dan pantau hasilnya dalam satu layanan yang jelas.
                        </p>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            {primaryAction()}
                            <Button asChild variant="outline" size="lg" className="h-12 rounded-lg border-white/20 bg-transparent px-6 font-bold text-white hover:bg-white/10 hover:text-white">
                                <Link href="/cek-status">
                                    <Search className="h-4 w-4 text-gold-300" />
                                    Cek status
                                </Link>
                            </Button>
                        </div>

                        {!auth?.user && canLogin && (
                            <p className="mt-4 flex items-center gap-2 text-xs text-navy-300">
                                <LogIn className="h-3.5 w-3.5" />
                                Sudah mendaftar? Masuk dengan nomor WhatsApp Anda.
                            </p>
                        )}
                    </motion.div>

                    <motion.div className="relative lg:col-span-6 lg:pl-4" {...revealProps(reducedMotion, 0.16, 'right')}>
                        <div className="relative mx-auto max-w-[34rem]">
                            <div className="absolute -inset-3 rounded-[2rem] border border-gold-300/20" />
                            <div className="relative overflow-hidden rounded-[1.5rem] bg-navy-900">
                                <motion.img
                                    src="/images/spmb/hero-family.webp"
                                    alt="Orang tua dan calon murid menuju sekolah"
                                    className="aspect-[4/5] w-full object-cover"
                                    loading="eager"
                                    fetchPriority="high"
                                    initial={reducedMotion ? false : { scale: 1.06 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: reducedMotion ? 0 : 1.2, ease: [0.22, 1, 0.36, 1] }}
                                />
                                <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[#071827] via-[#071827]/75 to-transparent" />
                                <div className="absolute inset-x-4 bottom-4 rounded-xl border border-white/15 bg-[#071827]/90 p-4 backdrop-blur-md sm:inset-x-6 sm:bottom-6 sm:p-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold-300">{periodTitle}</p>
                                            <p className="mt-2 text-sm leading-6 text-navy-100">{periodDescription}</p>
                                        </div>
                                        <span className={`mt-1 h-3 w-3 shrink-0 rounded-full ring-4 ${registrationOpen ? 'bg-emerald-400 ring-emerald-400/15' : 'bg-gold-300 ring-gold-300/15'}`} />
                                    </div>
                                </div>
                            </div>
                            <div className="absolute -bottom-5 -left-4 hidden rounded-lg bg-gold-300 px-4 py-3 text-navy-950 shadow-xl sm:block">
                                <p className="text-[10px] font-bold uppercase tracking-[0.16em]">Layanan resmi</p>
                                <p className="mt-0.5 text-sm font-bold">{schoolName}</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            <section aria-label="Keunggulan layanan SPMB" className="border-b border-navy-900/10 bg-white">
                <div className="mx-auto grid max-w-7xl divide-y divide-navy-900/10 px-4 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-6 lg:px-8">
                    {[
                        ['Gratis', 'Tidak ada biaya pendaftaran'],
                        ['Terhubung', 'Verifikasi melalui WhatsApp'],
                        ['Terdokumentasi', 'Bukti pendaftaran dalam PDF'],
                    ].map(([title, description], index) => (
                        <motion.div
                            key={title}
                            className="py-6 sm:px-6 sm:first:pl-0 sm:last:pr-0"
                            {...revealProps(reducedMotion, index * 0.08)}
                        >
                            <p className="font-display text-xl font-bold text-navy-950">{title}</p>
                            <p className="mt-1 text-sm text-navy-600">{description}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            <section id="alur" className="scroll-mt-20 bg-[#f5f2ea] py-20 sm:py-28">
                <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8">
                    <div className="lg:col-span-7">
                        <motion.div {...revealProps(reducedMotion)}>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-700">
                                Alur pendaftaran
                            </p>
                            <h2 className="mt-4 max-w-[14ch] font-display text-4xl font-bold leading-[1.05] tracking-[-0.035em] text-navy-950 sm:text-5xl">
                                Tiga tahap, tanpa antre panjang.
                            </h2>
                            <p className="mt-5 max-w-2xl text-base leading-7 text-navy-600">
                                Ikuti urutan berikut agar data tersimpan lengkap dan proses verifikasi berjalan lebih cepat.
                            </p>
                        </motion.div>

                        <div className="mt-12 border-t border-navy-900/15">
                            {spmb.steps.map((item, index) => {
                                const StepIcon = stepIcons[index] || CheckCircle2;
                                return (
                                    <motion.div
                                        key={item.step}
                                        className="grid gap-4 border-b border-navy-900/15 py-7 sm:grid-cols-[4.5rem_1fr]"
                                        {...revealProps(reducedMotion, index * 0.09)}
                                    >
                                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-navy-950 text-gold-300">
                                            <StepIcon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="flex items-baseline gap-3">
                                                <span className="font-display text-sm font-bold text-gold-700">
                                                    0{item.step}
                                                </span>
                                                <h3 className="font-display text-xl font-bold text-navy-950 sm:text-2xl">
                                                    {item.title}
                                                </h3>
                                            </div>
                                            <p className="mt-2 max-w-xl text-sm leading-6 text-navy-600">
                                                {item.desc}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    <motion.aside
                        className="lg:col-span-5"
                        {...revealProps(reducedMotion, 0.12, 'right')}
                    >
                        <div className="sticky top-28 rounded-2xl bg-[#0d2940] p-6 text-white shadow-[0_28px_70px_-40px_rgba(7,24,39,.8)] sm:p-8">
                            <ShieldCheck className="h-8 w-8 text-gold-300" />
                            <h3 className="mt-6 font-display text-2xl font-bold">Siapkan sebelum mulai</h3>
                            <ul className="mt-6 space-y-4">
                                {[
                                    'Nomor WhatsApp orang tua atau wali yang aktif',
                                    'Data calon murid sesuai dokumen resmi',
                                    'Foto atau scan dokumen yang jelas terbaca',
                                    'Waktu untuk meninjau ulang data sebelum dikirim',
                                ].map((item) => (
                                    <li key={item} className="flex gap-3 text-sm leading-6 text-navy-100">
                                        <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-gold-300" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-7 border-t border-white/10 pt-5 text-xs leading-5 text-navy-300">
                                Pastikan nama dan tanggal lahir sama dengan Akta Kelahiran.
                            </div>
                        </div>
                    </motion.aside>
                </div>
            </section>

            <section id="persyaratan" className="scroll-mt-20 bg-[#e9eef0] py-20 sm:py-28">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-12 lg:grid-cols-12 lg:items-end">
                        <motion.div className="lg:col-span-5" {...revealProps(reducedMotion, 0, 'left')}>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-700">
                                Persyaratan utama
                            </p>
                            <h2 className="mt-4 font-display text-4xl font-bold leading-[1.05] tracking-[-0.035em] text-navy-950 sm:text-5xl">
                                Dokumen sederhana, data harus akurat.
                            </h2>
                        </motion.div>
                        <motion.p
                            className="max-w-2xl text-base leading-7 text-navy-600 lg:col-span-6 lg:col-start-7"
                            {...revealProps(reducedMotion, 0.1, 'right')}
                        >
                            Gunakan hasil foto atau scan asli yang tidak buram. Berkas KIP atau PKH hanya disertakan jika calon murid memilikinya.
                        </motion.p>
                    </div>

                    <div className="mt-12 grid gap-5 lg:grid-cols-12">
                        <motion.div
                            className="rounded-2xl bg-gold-300 p-7 text-navy-950 lg:col-span-4 lg:row-span-2 sm:p-8"
                            {...revealProps(reducedMotion, 0.05)}
                        >
                            <CalendarDays className="h-8 w-8" />
                            <p className="mt-10 text-xs font-bold uppercase tracking-[0.16em]">Ketentuan usia</p>
                            <p className="mt-3 font-display text-3xl font-bold leading-tight">
                                {ageRequirement}
                            </p>
                            <p className="mt-5 text-sm leading-6 text-navy-800">
                                Tanggal lahir akan dicocokkan dengan Akta Kelahiran yang diunggah.
                            </p>
                        </motion.div>

                        <div className="overflow-hidden rounded-2xl border border-navy-900/10 bg-white lg:col-span-8">
                            {spmb.syarat.slice(1).map((requirement, index) => (
                                <motion.div
                                    key={requirement}
                                    className="flex items-start gap-4 border-b border-navy-900/10 p-5 last:border-b-0 sm:p-6"
                                    {...revealProps(reducedMotion, index * 0.06)}
                                >
                                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-navy-950 text-xs font-bold text-gold-300">
                                        0{index + 1}
                                    </span>
                                    <div>
                                        <p className="font-semibold leading-6 text-navy-950">{requirement}</p>
                                        {index === 2 && (
                                            <p className="mt-1 text-xs text-navy-500">Berkas pendukung, hanya jika tersedia.</p>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section id="status" className="scroll-mt-20 bg-[#071827] py-20 text-white sm:py-28">
                <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:items-center lg:px-8">
                    <motion.div className="lg:col-span-5" {...revealProps(reducedMotion, 0, 'left')}>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-300">
                            Setelah mengirim formulir
                        </p>
                        <h2 className="mt-4 font-display text-4xl font-bold leading-[1.05] tracking-[-0.035em] sm:text-5xl">
                            Progres tetap bisa Anda pantau.
                        </h2>
                        <p className="mt-5 text-base leading-7 text-navy-200">
                            Buka halaman cek status dengan nomor pendaftaran untuk melihat hasil verifikasi terbaru.
                        </p>
                        <Button
                            asChild
                            size="lg"
                            className="mt-8 h-12 rounded-lg bg-gold-300 px-6 font-bold text-navy-950 hover:bg-gold-200"
                        >
                            <Link href="/cek-status">
                                Cek status pendaftaran
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </motion.div>

                    <div className="lg:col-span-6 lg:col-start-7">
                        {afterRegistration.map((item, index) => (
                            <motion.div
                                key={item.title}
                                className="grid grid-cols-[3rem_1fr] gap-4 border-b border-white/10 py-6 first:pt-0 last:border-b-0 last:pb-0"
                                {...revealProps(reducedMotion, index * 0.09, 'right')}
                            >
                                <span className="font-display text-2xl font-bold text-gold-300">0{index + 1}</span>
                                <div>
                                    <h3 className="font-display text-xl font-bold">{item.title}</h3>
                                    <p className="mt-2 text-sm leading-6 text-navy-300">{item.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-white py-16 sm:py-20">
                <motion.div
                    className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-12 lg:items-center lg:px-8"
                    {...revealProps(reducedMotion)}
                >
                    <div className="lg:col-span-8">
                        <div className="flex items-center gap-3 text-gold-700">
                            <HelpCircle className="h-6 w-6" />
                            <p className="text-xs font-bold uppercase tracking-[0.18em]">Masih ada pertanyaan?</p>
                        </div>
                        <h2 className="mt-4 font-display text-3xl font-bold tracking-[-0.03em] text-navy-950 sm:text-4xl">
                            Asisten SPMB siap membantu kapan saja.
                        </h2>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-navy-600">
                            Tanyakan jadwal, persyaratan, atau cara memeriksa status melalui tombol chat di sudut halaman.
                        </p>
                    </div>
                    <div className="lg:col-span-4 lg:text-right">
                        <Button
                            type="button"
                            size="lg"
                            onClick={openChat}
                            className="h-12 rounded-lg bg-navy-950 px-6 font-bold text-white hover:bg-navy-800"
                        >
                            <MessageCircle className="h-4 w-4 text-gold-300" />
                            Tanya Asisten SPMB
                        </Button>
                    </div>
                </motion.div>
            </section>
        </>
    );
}
