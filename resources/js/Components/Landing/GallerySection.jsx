import { ImageIcon, Sparkles } from 'lucide-react';

export default function GallerySection({ galleries }) {
    if (!galleries || galleries.length === 0) {
        return null; // Don't render if no galleries exist
    }

    return (
        <section id="galeri" className="landing-section scroll-mt-20 py-16 sm:py-24 bg-navy-50/50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="section-heading text-center max-w-3xl mx-auto space-y-3 mb-14" data-reveal>
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-gold-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-gold-700">
                        <Sparkles className="h-3.5 w-3.5 text-gold-600" />
                        <span>Dokumentasi Sekolah</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy-950 tracking-tight">
                        Galeri Kegiatan & Momen
                    </h2>
                    <p className="text-sm sm:text-base text-navy-600">
                        Rangkuman berbagai aktivitas akademik, ekstrakurikuler, dan momen berharga civitas akademika sekolah.
                    </p>
                </div>

                {/* Masonry or Grid Layout for Gallery */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {galleries.map((gallery, idx) => (
                        <div
                            key={gallery.id || idx}
                            className="landing-card group relative rounded-2xl overflow-hidden bg-white shadow-sm border border-navy-100/50"
                        >
                            <div className="aspect-[4/3] w-full overflow-hidden">
                                {gallery.image_url ? (
                                    <img
                                        src={gallery.image_url}
                                        alt={gallery.title || 'Galeri Sekolah'}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-navy-50 text-navy-300">
                                        <ImageIcon className="h-8 w-8 opacity-50" />
                                    </div>
                                )}
                            </div>
                            
                            {/* Overlay Gradient on Hover */}
                            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-navy-950/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex flex-col justify-end p-4">
                                {gallery.category && (
                                    <span className="inline-block px-2 py-1 bg-gold-500/90 text-navy-950 text-[10px] font-bold uppercase tracking-wider rounded mb-2 w-fit">
                                        {gallery.category}
                                    </span>
                                )}
                                <h3 className="text-white font-semibold text-sm line-clamp-2">
                                    {gallery.title || 'Momen Sekolah'}
                                </h3>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
