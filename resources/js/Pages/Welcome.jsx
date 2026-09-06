import { Head, usePage } from '@inertiajs/react';
import ChatbotWidget from '@/Components/ChatbotWidget';
import LandingHeader from '@/Components/Landing/LandingHeader';
import HeroSection from '@/Components/Landing/HeroSection';
import StatsRibbon from '@/Components/Landing/StatsRibbon';
import AboutSection from '@/Components/Landing/AboutSection';
import ProgramsSection from '@/Components/Landing/ProgramsSection';
import FacilitiesSection from '@/Components/Landing/FacilitiesSection';
import StaffSection from '@/Components/Landing/StaffSection';
import AgendaSection from '@/Components/Landing/AgendaSection';
import AchievementsSection from '@/Components/Landing/AchievementsSection';
import SpmbSection from '@/Components/Landing/SpmbSection';
import FaqSection from '@/Components/Landing/FaqSection';
import GallerySection from '@/Components/Landing/GallerySection';
import ContactSection from '@/Components/Landing/ContactSection';
import LandingFooter from '@/Components/Landing/LandingFooter';
import schoolProfileData from '@/data/schoolProfile.json';

export default function Welcome({
    canLogin,
    canRegister,
    period,
    staffList = [],
    academicCalendars = [],
    faqs = [],
    stats = {},
    missions = [],
    values = [],
    programs = [],
    facilities = [],
    extracurriculars = [],
    achievements = [],
    galleries = [],
}) {
    const { school } = usePage().props;
    const schoolName = school?.name || schoolProfileData.profil.nama;

    return (
        <div className="min-h-screen bg-navy-50/50 text-navy-950 font-sans selection:bg-gold-500 selection:text-navy-950">
            <Head>
                <title>{`${schoolName} - Berakhlak, Unggul & Berkarakter`}</title>
                <meta
                    name="description"
                    content={`Selamat datang di website resmi ${schoolName}. Pusat informasi pendidikan, profil sekolah, fasilitas, dan pendaftaran murid baru online.`}
                />
            </Head>

            {/* Sticky Navigation Bar */}
            <LandingHeader
                canLogin={canLogin}
                canRegister={canRegister}
                period={period}
            />

            {/* Main Content Sections */}
            <main>
                {/* Hero Section */}
                <HeroSection
                    profileData={schoolProfileData}
                    school={school}
                    period={period}
                    canRegister={canRegister}
                />

                {/* Floating Quick Stats Ribbon */}
                <StatsRibbon
                    stats={stats}
                    profileData={schoolProfileData}
                />

                {/* About, Vision & Mission Section */}
                <AboutSection
                    profileData={schoolProfileData}
                    school={school}
                    missions={missions}
                />

                {/* Programs & Character Building Section */}
                <ProgramsSection
                    profileData={schoolProfileData}
                    programs={programs}
                    values={values}
                    extracurriculars={extracurriculars}
                />

                {/* Facilities Section */}
                <FacilitiesSection
                    profileData={schoolProfileData}
                    facilities={facilities}
                />

                {/* Staff & Teachers Section */}
                <StaffSection
                    staffList={staffList}
                />

                {/* Academic Agenda & Calendar */}
                <AgendaSection
                    academicCalendars={academicCalendars}
                />

                {/* Achievements Showcase */}
                <AchievementsSection
                    profileData={schoolProfileData}
                    achievements={achievements}
                />

                {/* School Gallery */}
                <GallerySection
                    galleries={galleries}
                />

                {/* Simplified & Elegant SPMB Registration Section */}
                <SpmbSection
                    profileData={schoolProfileData}
                    period={period}
                    canRegister={canRegister}
                    canLogin={canLogin}
                />

                {/* Frequently Asked Questions */}
                <FaqSection
                    faqs={faqs}
                />

                {/* Contact, Location & Map */}
                <ContactSection
                    profileData={schoolProfileData}
                    school={school}
                />
            </main>

            {/* School Official Footer */}
            <LandingFooter
                profileData={schoolProfileData}
                school={school}
            />

            {/* Integrated AI School Chatbot Widget */}
            <ChatbotWidget />
        </div>
    );
}
