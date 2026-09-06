import { Clock, ExternalLink, Mail, MapPin, Phone, Send } from 'lucide-react';
import { Button } from '@/Components/ui/button';

export default function ContactSection({ profileData, school }) {
    const kontak = profileData.kontak;
    const schoolName = school?.name || profileData.profil.nama;
    const phone = school?.phone || kontak.telepon;
    const email = school?.email || kontak.email;
    const address = school?.address || kontak.alamat;

    return (
        <section id="kontak" className="scroll-mt-20 py-16 sm:py-24 bg-navy-50/50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-gold-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-gold-700">
                        <MapPin className="h-3.5 w-3.5 text-gold-600" />
                        <span>Lokasi & Narahubung</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy-950 tracking-tight">
                        Hubungi & Kunjungi Kami
                    </h2>
                    <p className="text-sm sm:text-base text-navy-600">
                        Kami siap melayani kebutuhan informasi dan konsultasi pendidikan bagi para orang tua dan calon murid.
                    </p>
                </div>

                <div className="grid gap-8 lg:grid-cols-12 items-stretch">
                    {/* Left: Contact Info Cards */}
                    <div className="lg:col-span-6 space-y-4">
                        {/* Address Card */}
                        <div className="rounded-3xl border border-navy-100 bg-white p-6 shadow-sm flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gold-500/15 text-gold-700 font-bold">
                                <MapPin className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-navy-950">Alamat Sekolah</h3>
                                <p className="text-xs sm:text-sm text-navy-600 mt-1 leading-relaxed">
                                    {address}
                                </p>
                                <p className="text-[11px] text-gold-700 font-semibold mt-1">
                                    Kabupaten Rokan Hulu, Provinsi Riau
                                </p>
                            </div>
                        </div>

                        {/* Phone & Email Cards in Grid */}
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="rounded-3xl border border-navy-100 bg-white p-6 shadow-sm flex items-start gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-navy-50 text-navy-800 font-bold">
                                    <Phone className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-sm font-bold text-navy-950">Telepon / WhatsApp</h3>
                                    <p className="text-xs text-navy-600 mt-1 font-medium truncate">
                                        {phone}
                                    </p>
                                    <p className="text-[11px] text-navy-400 mt-0.5">
                                        Layanan Informasi
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-3xl border border-navy-100 bg-white p-6 shadow-sm flex items-start gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-navy-50 text-navy-800 font-bold">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-sm font-bold text-navy-950">Email Resmi</h3>
                                    <p className="text-xs text-navy-600 mt-1 font-medium truncate">
                                        {email}
                                    </p>
                                    <p className="text-[11px] text-navy-400 mt-0.5">
                                        Surat Menyurat & Adm
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Operating Hours Card */}
                        <div className="rounded-3xl border border-navy-100 bg-white p-6 shadow-sm flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gold-500/15 text-gold-700 font-bold">
                                <Clock className="h-6 w-6" />
                            </div>
                            <div className="w-full">
                                <h3 className="text-sm font-bold text-navy-950">Jam Pelayanan Sekolah</h3>
                                <div className="mt-2 space-y-1.5 text-xs text-navy-600">
                                    <div className="flex justify-between border-b border-navy-50 pb-1">
                                        <span>Kegiatan Belajar Mengajar (KBM):</span>
                                        <span className="font-semibold text-navy-900">{kontak.jam_sekolah}</span>
                                    </div>
                                    <div className="flex justify-between pt-0.5">
                                        <span>Pelayanan Tata Usaha (TU):</span>
                                        <span className="font-semibold text-navy-900">{kontak.jam_tata_usaha}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Map Embed Card */}
                    <div className="lg:col-span-6 flex flex-col">
                        <div className="h-full rounded-3xl border border-navy-100 bg-white p-6 shadow-sm flex flex-col justify-between space-y-4">
                            <div>
                                <h3 className="text-base font-bold text-navy-950 mb-1">
                                    Peta Lokasi Kampus Sekolah
                                </h3>
                                <p className="text-xs text-navy-600">
                                    Temukan rute tercepat menuju lingkungan sekolah {schoolName}.
                                </p>
                            </div>

                            {/* Styled Visual Map Placeholder / Frame */}
                            <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden border border-navy-100 bg-navy-900 flex items-center justify-center text-center p-6 group">
                                <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 opacity-90" />
                                {/* Grid map background lines */}
                                <div
                                    className="absolute inset-0 opacity-15"
                                    style={{
                                        backgroundImage:
                                            'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)',
                                        backgroundSize: '30px 30px',
                                    }}
                                />

                                <div className="relative z-10 space-y-3 max-w-sm">
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-500 text-navy-950 shadow-lg shadow-gold-500/30 group-hover:scale-110 transition-transform">
                                        <MapPin className="h-7 w-7" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">
                                            {schoolName}
                                        </p>
                                        <p className="text-xs text-navy-200 mt-0.5">
                                            Kec. Kepenuhan, Kab. Rokan Hulu, Riau
                                        </p>
                                    </div>
                                    <Button
                                        asChild
                                        size="sm"
                                        className="bg-gold-500 text-navy-950 hover:bg-gold-400 font-bold text-xs shadow-md"
                                    >
                                        <a
                                            href={kontak.maps_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5"
                                        >
                                            <span>Buka di Google Maps</span>
                                            <ExternalLink className="h-3.5 w-3.5" />
                                        </a>
                                    </Button>
                                </div>
                            </div>

                            <p className="text-[11px] text-navy-400 text-center">
                                Kampus asri, aman, dan mudah dijangkau dari berbagai penjuru desa di Kecamatan Kepenuhan.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
