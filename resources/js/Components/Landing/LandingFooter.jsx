import { Link } from '@inertiajs/react';
import { GraduationCap, Mail, Phone } from 'lucide-react';

export default function LandingFooter({ profileData, school }) {
    const schoolName = school?.name || profileData.profil.nama;
    const phone = school?.phone || profileData.kontak.telepon;
    const email = school?.email || profileData.kontak.email;

    return (
        <footer className="border-t border-white/10 bg-navy-950 text-white">
            <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
                <div className="flex items-center gap-3">
                    {school?.logo_url ? (
                        <img
                            src={school.logo_url}
                            alt={`Logo ${schoolName}`}
                            className="h-10 w-10 rounded-full bg-white/10 p-1 object-contain ring-1 ring-gold-400/40"
                        />
                    ) : (
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-500 text-navy-950">
                            <GraduationCap className="h-5 w-5" />
                        </span>
                    )}
                    <div>
                        <p className="text-sm font-bold text-white">{schoolName}</p>
                        <p className="text-xs text-navy-300">Layanan informasi dan pendaftaran SPMB</p>
                    </div>
                </div>

                <div className="flex flex-col gap-3 text-xs text-navy-300 sm:flex-row sm:items-center sm:gap-5">
                    <Link
                        href="/cek-status"
                        className="font-semibold text-gold-400 transition-colors hover:text-gold-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
                    >
                        Cek status pendaftaran
                    </Link>
                    {phone && (
                        <span className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 text-gold-400" />
                            {phone}
                        </span>
                    )}
                    {email && (
                        <span className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 text-gold-400" />
                            {email}
                        </span>
                    )}
                </div>
            </div>

            <div className="border-t border-white/10 px-4 py-4 text-center text-[11px] text-navy-400">
                &copy; {new Date().getFullYear()} {schoolName}. Semua hak dilindungi.
            </div>
        </footer>
    );
}
