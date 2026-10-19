import { Link } from '@inertiajs/react';
import { Clock, GraduationCap, Mail, MapPin, Phone } from 'lucide-react';
import { MotionItem, Stagger } from '@/Components/Motion';

export default function LandingFooter({ profileData, school, home = true }) {
    const schoolName = school?.name || profileData.profil.nama;
    const phone = school?.phone || profileData.kontak.telepon;
    const email = school?.email || profileData.kontak.email;
    const address = school?.address || profileData.kontak.alamat;

    return (
        <footer className="border-t border-[var(--public-line)] bg-[var(--public-surface)]">
            <Stagger inView className="public-container grid gap-10 py-12 md:grid-cols-12 sm:py-14">
                <MotionItem className="md:col-span-5">
                    <div className="flex items-center gap-3">
                        {school?.logo_url ? (
                            <img src={school.logo_url} alt={'Logo ' + schoolName} width="44" height="44" className="h-11 w-11 shrink-0 rounded-xl bg-white p-1 object-contain" loading="lazy" />
                        ) : (
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--public-secondary)] text-[var(--public-ink)]"><GraduationCap className="h-6 w-6" aria-hidden="true" /></span>
                        )}
                        <p className="font-display text-lg font-semibold">{schoolName}</p>
                    </div>
                    <p className="mt-5 max-w-sm text-sm leading-7 text-[var(--public-muted)]">Layanan resmi informasi, pendaftaran, dan pemantauan penerimaan murid baru.</p>
                </MotionItem>
                <MotionItem className="md:col-span-3">
                    <h2 className="text-sm font-semibold">Informasi SPMB</h2>
                    <nav aria-label="Navigasi bagian bawah" className="mt-4 flex flex-col items-start gap-2">
                        <a href={(home ? '' : '/') + '#alur'} className="public-footer-link">Alur pendaftaran</a>
                        <a href={(home ? '' : '/') + '#persyaratan'} className="public-footer-link">Persyaratan</a>
                        <Link href="/cek-status" className="public-footer-link">Cek status</Link>
                    </nav>
                </MotionItem>
                <MotionItem className="md:col-span-4">
                    <h2 className="text-sm font-semibold">Hubungi sekolah</h2>
                    <div className="mt-4 space-y-3 text-sm leading-6 text-[var(--public-muted)]">
                        {address && <p className="flex gap-3"><MapPin className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" /><span>{address}</span></p>}
                        {phone && <p className="flex gap-3"><Phone className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" /><span>{phone}</span></p>}
                        {email && <p className="flex gap-3"><Mail className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" /><a href={'mailto:' + email} className="public-focus rounded-sm [overflow-wrap:anywhere] hover:underline">{email}</a></p>}
                        <p className="flex gap-3"><Clock className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" /><span>{profileData.kontak.jam_tata_usaha}</span></p>
                    </div>
                </MotionItem>
            </Stagger>
            <div className="public-container border-t border-[var(--public-line)] pb-8 pt-5 text-xs leading-6 text-[var(--public-muted)]">&copy; {new Date().getFullYear()} {schoolName}. Layanan SPMB resmi sekolah.</div>
        </footer>
    );
}
