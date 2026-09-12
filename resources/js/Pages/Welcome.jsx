import { Head, usePage } from '@inertiajs/react';
import ChatbotWidget from '@/Components/ChatbotWidget';
import LandingHeader from '@/Components/Landing/LandingHeader';
import SpmbSection from '@/Components/Landing/SpmbSection';
import LandingFooter from '@/Components/Landing/LandingFooter';
import schoolProfileData from '@/data/schoolProfile.json';

export default function Welcome({
    canLogin,
    canRegister,
    period,
    registrationOpen,
}) {
    const { school } = usePage().props;
    const schoolName = school?.name || schoolProfileData.profil.nama;

    return (
        <div
            className="spmb-public-page flex min-h-screen flex-col bg-[#f5f2ea] font-sans text-navy-950 selection:bg-gold-300 selection:text-navy-950"
        >
            <Head>
                <title>{`SPMB Online - ${schoolName}`}</title>
                <meta
                    name="description"
                    content={`Informasi dan pendaftaran murid baru ${schoolName}. Daftar secara online, siapkan dokumen, dan pantau status pendaftaran dari rumah.`}
                />
            </Head>

            <a className="skip-link" href="#konten-utama">
                Lewati ke konten utama
            </a>

            <LandingHeader canLogin={canLogin} />

            <main id="konten-utama" className="flex-1">
                <SpmbSection
                    profileData={schoolProfileData}
                    period={period}
                    canRegister={canRegister}
                    canLogin={canLogin}
                    registrationOpen={registrationOpen}
                />
            </main>

            <LandingFooter
                profileData={schoolProfileData}
                school={school}
            />

            <ChatbotWidget />
        </div>
    );
}
