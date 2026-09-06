import {
    Activity,
    Building2,
    Library,
    Monitor,
    School,
    Sparkles,
    Trophy,
} from 'lucide-react';

export default function FacilitiesSection({ profileData, facilities }) {
    const defaultFacilities = profileData.fasilitas;
    const displayFacilities = facilities && facilities.length > 0 ? facilities : defaultFacilities;

    const iconMap = {
        School,
        Library,
        Monitor,
        Trophy,
        Building2,
        Activity,
    };

    return (
        <section id="fasilitas" className="scroll-mt-20 py-16 sm:py-24 bg-navy-50/40">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-gold-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-gold-700">
                        <Sparkles className="h-3.5 w-3.5 text-gold-600" />
                        <span>Sarana & Prasarana</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy-950 tracking-tight">
                        Fasilitas Penunjang Pembelajaran
                    </h2>
                    <p className="text-sm sm:text-base text-navy-600">
                        Kami menyediakan infrastruktur pendukung yang aman, bersih, dan memadai agar proses belajar mengajar berjalan optimal dan menyenangkan.
                    </p>
                </div>

                {/* Facilities Grid */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {displayFacilities.map((fac, idx) => {
                        const IconComponent = fac.icon ? (iconMap[fac.icon] || School) : School;
                        return (
                            <div
                                key={idx}
                                className="group relative rounded-3xl border border-navy-100 bg-white p-6 shadow-sm hover:shadow-xl hover:shadow-navy-950/5 hover:border-gold-400/50 transition-all duration-300"
                            >
                                {fac.image_url ? (
                                    <div className="h-40 w-full rounded-2xl overflow-hidden mb-4 border border-navy-100">
                                        <img src={fac.image_url} alt={fac.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-50 text-navy-900 group-hover:bg-gold-500 group-hover:text-navy-950 transition-colors shadow-sm">
                                            <IconComponent className="h-6 w-6" />
                                        </div>
                                        <span className="text-xs font-bold text-navy-300 group-hover:text-gold-600 transition-colors">
                                            0{idx + 1}
                                        </span>
                                    </div>
                                )}
                                <h3 className="text-base font-bold text-navy-950 mb-2 leading-snug group-hover:text-navy-900">
                                    {fac.title}
                                </h3>
                                <p className="text-xs text-navy-600 leading-relaxed">
                                    {fac.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
