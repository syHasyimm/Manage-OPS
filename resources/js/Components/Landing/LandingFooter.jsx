import { Link } from '@inertiajs/react';
import { Clock, GraduationCap, Mail, MapPin, Phone } from 'lucide-react';

export default function LandingFooter({ profileData, school }) {
    const schoolName = school?.name || profileData.profil.nama;
    const phone = school?.phone || profileData.kontak.telepon;
    const email = school?.email || profileData.kontak.email;
    const address = school?.address || profileData.kontak.alamat;

    return (
        <footer className="border-t border-white/10 bg-[#05121d] text-white">
            <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-12 lg:px-8">
                <div className="md:col-span-5">
                    <div className="flex items-center gap-3">
                        {school?.logo_url ? (
                            <img
                                src={school.logo_url}
                                alt={`Logo ${schoolName}`}
                                className="h-11 w-11 rounded-full bg-white p-1 object-contain"
                            />
                        ) : (
                            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-gold-300 text-navy-950">
                                <GraduationCap className="h-5 w-5" />
                            </span>
                        )}
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gold-300">
                                Portal SPMB
                            </p>
                            <p className="mt-1 font-display text-base font-bold">{schoolName}</p>
                        </div>
                    </div>
                    <p className="mt-5 max-w-md text-sm leading-6 text-navy-300">
                        Layanan resmi informasi, pendaftaran, dan pemantauan penerimaan murid baru.
                    </p>
                </div>

                <div className="md:col-span-3">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold-300">Navigasi</p>
                    <div className="mt-4 flex flex-col items-start gap-3 text-sm text-navy-200">
                        <a href="#alur" className="hover:text-white">Alur pendaftaran</a>
                        <a href="#persyaratan" className="hover:text-white">Persyaratan</a>
                        <Link href="/cek-status" className="hover:text-white">Cek status</Link>
                    </div>
                </div>

                <div className="md:col-span-4">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold-300">Hubungi sekolah</p>
                    <div className="mt-4 space-y-3 text-sm leading-6 text-navy-300">
                        {address && (
                            <p className="flex gap-3">
                                <MapPin className="mt-1 h-4 w-4 shrink-0 text-gold-300" />
                                <span>{address}</span>
                            </p>
                        )}
                        {phone && (
                            <p className="flex gap-3">
                                <Phone className="mt-1 h-4 w-4 shrink-0 text-gold-300" />
                                <span>{phone}</span>
                            </p>
                        )}
                        {email && (
                            <p className="flex gap-3">
                                <Mail className="mt-1 h-4 w-4 shrink-0 text-gold-300" />
                                <span>{email}</span>
                            </p>
                        )}
                        <p className="flex gap-3">
                            <Clock className="mt-1 h-4 w-4 shrink-0 text-gold-300" />
                            <span>{profileData.kontak.jam_tata_usaha}</span>
                        </p>
                    </div>
                </div>
            </div>

            <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-navy-400">
                &copy; {new Date().getFullYear()} {schoolName}. Layanan SPMB resmi sekolah.
            </div>
        </footer>
    );
}
