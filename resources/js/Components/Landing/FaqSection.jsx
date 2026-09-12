import { useState } from 'react';
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';

export default function FaqSection({ faqs = [] }) {
    const fallbackFaqs = [
        {
            question: 'Apakah pendaftaran murid baru di SD Negeri 001 Kepenuhan dipungut biaya?',
            answer: 'Tidak. Seluruh proses pendaftaran murid baru (SPMB/PPDB) di SD Negeri 001 Kepenuhan adalah 100% GRATIS dan tidak dipungut biaya apapun.',
        },
        {
            question: 'Berapa batasan usia minimal calon murid baru?',
            answer: 'Sesuai ketentuan dinas pendidikan nasional, calon peserta didik baru kelas 1 SD diprioritaskan berusia minimal 6 (enam) tahun pada tanggal 1 Juli tahun ajaran berjalan.',
        },
        {
            question: 'Bagaimana cara memverifikasi akun saat login pendaftaran?',
            answer: 'Sistem kami menggunakan verifikasi satu langkah via nomor WhatsApp aktif. Anda akan menerima 6 digit kode OTP langsung di WhatsApp Anda untuk masuk tanpa perlu mengingat kata sandi.',
        },
        {
            question: 'Apakah formulir pendaftaran bisa diisi secara bertahap?',
            answer: 'Bisa. Sistem pendaftaran memiliki fitur penyimpanan otomatis di setiap langkah (Step 1, 2, dan 3). Anda dapat keluar kapan saja dan melanjutkan pengisian di waktu luang.',
        },
        {
            question: 'Kurikulum apa yang diterapkan di SD Negeri 001 Kepenuhan?',
            answer: 'SD Negeri 001 Kepenuhan secara aktif menerapkan Kurikulum Merdeka yang menekankan pada pembelajaran berpusat pada murid, pengembangan nalar kritis, literasi-numerasi, serta Projek Penguatan Profil Pelajar Pancasila (P5).',
        },
        {
            question: 'Bagaimana cara memastikan formulir pendaftaran sudah diterima sekolah?',
            answer: 'Setelah Anda menekan tombol submit akhir, kartu bukti pendaftaran resmi berformat PDF akan otomatis terbit dan Anda dapat mengunduhnya langsung. Status verifikasi juga dapat dipantau melalui menu "Cek Status Pendaftaran".',
        },
    ];

    const displayFaqs = faqs && faqs.length > 0 ? faqs : fallbackFaqs;

    // Open first FAQ by default
    const [openIndex, setOpenIndex] = useState(0);

    const toggle = (idx) => {
        setOpenIndex(openIndex === idx ? null : idx);
    };

    return (
        <section id="faq" className="landing-section scroll-mt-20 py-16 sm:py-24 bg-white">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="section-heading text-center space-y-3 mb-12" data-reveal>
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-gold-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-gold-700">
                        <HelpCircle className="h-3.5 w-3.5 text-gold-600" />
                        <span>Pusat Informasi & Bantuan</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy-950 tracking-tight">
                        Pertanyaan yang Sering Diajukan (FAQ)
                    </h2>
                    <p className="text-sm sm:text-base text-navy-600">
                        Temukan jawaban cepat atas pertanyaan seputar kegiatan sekolah dan alur pendaftaran murid baru.
                    </p>
                </div>

                {/* FAQ List */}
                <div className="space-y-3.5">
                    {displayFaqs.map((faq, idx) => {
                        const isOpen = openIndex === idx;
                        return (
                            <div
                                key={faq.id || idx}
                                className={`landing-card rounded-2xl border transition-all duration-200 overflow-hidden ${
                                    isOpen
                                        ? 'border-gold-400/60 bg-gold-50/20 shadow-md shadow-navy-950/5'
                                        : 'border-navy-100 bg-navy-50/30 hover:border-navy-200 hover:bg-white'
                                }`}
                            >
                                <button
                                    type="button"
                                    onClick={() => toggle(idx)}
                                    className="flex w-full items-center justify-between gap-4 p-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold-500"
                                >
                                    <span className="text-sm sm:text-base font-bold text-navy-950">
                                        {faq.question}
                                    </span>
                                    <span
                                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-transform duration-200 ${
                                            isOpen
                                                ? 'rotate-180 bg-gold-500 text-navy-950 font-bold'
                                                : 'bg-navy-100 text-navy-700'
                                        }`}
                                    >
                                        <ChevronDown className="h-4 w-4" />
                                    </span>
                                </button>

                                {isOpen && (
                                    <div className="px-5 pb-5 text-xs sm:text-sm text-navy-700 leading-relaxed border-t border-gold-200/50 pt-3.5">
                                        {faq.answer}
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
