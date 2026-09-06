import { Link } from '@inertiajs/react';
import { ArrowUp, GraduationCap, Heart, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';

export default function LandingFooter({ profileData, school }) {
    const p = profileData.profil;
    const schoolName = school?.name || p.nama;
    const address = school?.address || profileData.kontak.alamat;
    const phone = school?.phone || profileData.kontak.telepon;
    const email = school?.email || profileData.kontak.email;

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="bg-navy-950 text-white border-t border-navy-800">
            {/* Top Footer */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
                <div className="grid gap-10 lg:grid-cols-12">
                    {/* Brand Column */}
                    <div className="space-y-4 lg:col-span-5">
                        <div className="flex items-center gap-3">
                            {school?.logo_url ? (
                                <img
                                    src={school.logo_url}
                                    alt={schoolName}
                                    className="h-11 w-11 object-contain rounded-full bg-white/10 p-1 ring-2 ring-gold-400/40"
                                />
                            ) : (
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 text-navy-950 font-bold shadow-md shadow-gold-500/20">
                                    <GraduationCap className="h-6 w-6" />
                                </div>
                            )}
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gold-400">
                                    Pendidikan Dasar Berkualitas
                                </p>
                                <h3 className="text-base font-bold text-white tracking-tight">
                                    {schoolName}
                                </h3>
                            </div>
                        </div>

                        <p className="text-xs sm:text-sm text-navy-200/90 leading-relaxed max-w-md">
                            {p.tagline}. Berkomitmen mendidik tunas bangsa menjadi insan beriman, mandiri, cerdas bernalar, dan berbudi pekerti luhur.
                        </p>

                        <div className="flex items-center gap-2 text-xs text-navy-300 pt-2">
                            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400"></span>
                            <span>NPSN: <strong className="text-white">{school?.npsn || p.npsn}</strong></span>
                            <span>•</span>
                            <span>Akreditasi: <strong className="text-gold-300">{school?.accreditation || p.akreditasi}</strong></span>
                        </div>
                    </div>

                    {/* Quick Links Column */}
                    <div className="space-y-3 lg:col-span-3">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-gold-400">
                            Navigasi Utama
                        </h4>
                        <ul className="space-y-2 text-xs text-navy-200">
                            <li>
                                <a href="#beranda" className="hover:text-gold-300 transition-colors">
                                    Beranda & Sambutan
                                </a>
                            </li>
                            <li>
                                <a href="#profil" className="hover:text-gold-300 transition-colors">
                                    Profil, Visi & Misi
                                </a>
                            </li>
                            <li>
                                <a href="#program" className="hover:text-gold-300 transition-colors">
                                    Program Unggulan
                                </a>
                            </li>
                            <li>
                                <a href="#fasilitas" className="hover:text-gold-300 transition-colors">
                                    Fasilitas Sekolah
                                </a>
                            </li>
                            <li>
                                <a href="#guru" className="hover:text-gold-300 transition-colors">
                                    Dewan Guru & Tenaga Kependidikan
                                </a>
                            </li>
                            <li>
                                <a href="#agenda" className="hover:text-gold-300 transition-colors">
                                    Kalender & Agenda Pendidikan
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* SPMB & Layanan Column */}
                    <div className="space-y-3 lg:col-span-4">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-gold-400">
                            Layanan Siswa & Orang Tua
                        </h4>
                        <ul className="space-y-2 text-xs text-navy-200">
                            <li>
                                <a href="#spmb" className="hover:text-gold-300 transition-colors">
                                    Penerimaan Murid Baru (SPMB)
                                </a>
                            </li>
                            <li>
                                <Link href="/cek-status" className="hover:text-gold-300 transition-colors">
                                    Cek Status Pendaftaran Online
                                </Link>
                            </li>
                            <li>
                                <Link href={route('login')} className="hover:text-gold-300 transition-colors">
                                    Masuk Akun Pendaftar
                                </Link>
                            </li>
                            <li>
                                <a href="#faq" className="hover:text-gold-300 transition-colors">
                                    Tanya Jawab (FAQ) Pendaftaran
                                </a>
                            </li>
                            <li>
                                <a href="#kontak" className="hover:text-gold-300 transition-colors">
                                    Pusat Bantuan & Kontak Tata Usaha
                                </a>
                            </li>
                        </ul>

                        <div className="pt-3 border-t border-white/10 space-y-1.5 text-xs text-navy-300">
                            <p className="flex items-center gap-2">
                                <Phone className="h-3.5 w-3.5 text-gold-400 shrink-0" />
                                <span>{phone}</span>
                            </p>
                            <p className="flex items-center gap-2">
                                <Mail className="h-3.5 w-3.5 text-gold-400 shrink-0" />
                                <span>{email}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Subfooter */}
            <div className="border-t border-white/10 bg-navy-950/80 py-6">
                <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 text-xs text-navy-300">
                    <p className="text-center sm:text-left">
                        &copy; {new Date().getFullYear()} {schoolName}. Semua Hak Dilindungi.
                    </p>

                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={scrollToTop}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-400 hover:text-gold-300 focus:outline-none"
                        >
                            <span>Kembali ke Atas</span>
                            <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
}
