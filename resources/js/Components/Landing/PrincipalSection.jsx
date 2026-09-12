import {
    ArrowDownRight,
    GraduationCap,
    Quote,
    Sparkles,
} from 'lucide-react';

export default function PrincipalSection({ profileData, school }) {
    const profile = profileData.profil;
    const welcome = profile.sambutan_kepala_sekolah;
    const schoolName = school?.name || profile.nama;
    const principalName = school?.principal || welcome.nama;
    const principalImage = school?.principal_image_url;

    return (
        <section
            id="sambutan"
            className="principal-section landing-section scroll-mt-20 overflow-hidden"
        >
            <div className="principal-wordmark" aria-hidden="true">
                SAMBUTAN
            </div>

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
                    <div
                        className="relative lg:col-span-5"
                        data-reveal="left"
                    >
                        <div className="principal-frame">
                            {principalImage ? (
                                <img
                                    src={principalImage}
                                    alt={`Foto ${principalName}, Kepala Sekolah ${schoolName}`}
                                    className="principal-photo h-full w-full object-cover object-top"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="principal-fallback">
                                    <div className="hero-grid absolute inset-0 opacity-70" />
                                    {school?.logo_url ? (
                                        <img
                                            src={school.logo_url}
                                            alt={schoolName}
                                            className="relative h-40 w-40 object-contain drop-shadow-2xl"
                                        />
                                    ) : (
                                        <GraduationCap className="relative h-36 w-36 text-gold-400" />
                                    )}
                                </div>
                            )}

                            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-transparent to-transparent" />
                            <div className="absolute inset-x-6 bottom-6 text-white">
                                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gold-300">
                                    Kepala Sekolah
                                </p>
                                <h3 className="mt-1 text-xl font-bold">{principalName}</h3>
                                {welcome.nip && (
                                    <p className="mt-1 text-xs text-navy-200">
                                        NIP. {welcome.nip}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="principal-stamp">
                            <span className="font-display text-2xl font-extrabold">01</span>
                            <span className="text-[9px] font-bold uppercase tracking-[0.16em]">
                                Keteladanan
                            </span>
                        </div>
                    </div>

                    <article
                        className="relative lg:col-span-7"
                        data-reveal="right"
                        data-reveal-delay="120"
                    >
                        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-gold-700">
                            <Sparkles className="h-4 w-4" />
                            <span>Sambutan Kepala Sekolah</span>
                        </div>

                        <h2 className="mt-5 max-w-[15ch] font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.045em] text-navy-950 sm:text-5xl lg:text-6xl">
                            {welcome.judul}
                        </h2>

                        <div className="principal-quote mt-8">
                            <Quote className="principal-quote-icon" aria-hidden="true" />
                            <blockquote className="relative text-base font-medium leading-8 text-navy-800 sm:text-lg sm:leading-9">
                                &ldquo;{welcome.kutipan}&rdquo;
                            </blockquote>
                        </div>

                        <div className="mt-9 flex flex-col gap-6 border-t border-navy-200/80 pt-7 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="font-display text-lg font-bold text-navy-950">
                                    {principalName}
                                </p>
                                <p className="mt-1 text-sm text-navy-600">
                                    {welcome.jabatan} � {schoolName}
                                </p>
                            </div>

                            <a
                                href="#profil"
                                className="principal-link inline-flex w-fit items-center gap-3 text-sm font-bold text-navy-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
                            >
                                <span>Lihat visi & misi sekolah</span>
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-950 text-gold-300">
                                    <ArrowDownRight className="h-4 w-4" />
                                </span>
                            </a>
                        </div>

                        <div className="principal-values mt-9 grid grid-cols-3 border-y border-navy-200/80 py-5">
                            {['Ramah anak', 'Aman belajar', 'Tumbuh bersama'].map((value) => (
                                <span
                                    key={value}
                                    className="px-3 text-center text-[10px] font-bold uppercase tracking-[0.13em] text-navy-600 first:pl-0 first:text-left last:pr-0 last:text-right"
                                >
                                    {value}
                                </span>
                            ))}
                        </div>
                    </article>
                </div>
            </div>
        </section>
    );
}
