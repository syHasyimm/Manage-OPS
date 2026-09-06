import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    Award,
    Calendar,
    Bell,
    FileText,
    FolderOpen,
    GraduationCap,
    HelpCircle,
    LayoutDashboard,
    LogOut,
    MessageSquare,
    Settings,
    Smartphone,
    User as UserIcon,
    Users,
    UserCheck,
    Contact,
    Globe,
    Target,
    Heart,
    Star,
    Image as ImageIcon,
    Building2,
    Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Toaster } from '@/Components/ui/sonner';

function Item({ href, active, icon: Icon, children, onClick }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active
                    ? 'bg-gold-500 text-navy-950 shadow-sm'
                    : 'text-navy-100 hover:bg-navy-800 hover:text-white',
            )}
        >
            <Icon className="h-4 w-4" />
            {children}
        </Link>
    );
}

function MobileTab({ href, active, icon: Icon, label, onClick }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={cn(
                'flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-colors',
                active ? 'text-gold-600' : 'text-navy-500 hover:text-navy-800',
            )}
        >
            <Icon className="h-5 w-5" />
            <span className="leading-none">{label}</span>
        </Link>
    );
}

function MobileTabButton({ active, icon: Icon, label, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-colors',
                active ? 'text-gold-600' : 'text-navy-500 hover:text-navy-800',
            )}
        >
            <Icon className="h-5 w-5" />
            <span className="leading-none">{label}</span>
        </button>
    );
}

function SheetItem({ item, onClick }) {
    const Icon = item.icon;

    return (
        <Link
            href={item.href}
            onClick={onClick}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-navy-700 hover:bg-navy-50"
        >
            <Icon className="h-4 w-4" />
            {item.label}
        </Link>
    );
}

export default function AdminSidebar({ children }) {
    const { auth, school } = usePage().props;
    const [accountOpen, setAccountOpen] = useState(false);
    const isCurrent = (name) => route().current(name);

    const navigationGroups = [
        {
            label: 'Ringkasan',
            items: [
                { href: route('admin.dashboard'), name: 'admin.dashboard', icon: LayoutDashboard, label: 'Dashboard', mobileLabel: 'Dashboard' },
            ],
        },
        {
            label: 'Penerimaan Siswa (SPMB)',
            items: [
                { href: route('admin.periods.index'), name: 'admin.periods.*', icon: Calendar, label: 'Periode', mobileLabel: 'Periode' },
                { href: route('admin.registrations.index'), name: 'admin.registrations.*', icon: UserCheck, label: 'Data Pendaftar', mobileLabel: 'Pendaftar' },
            ],
        },
        {
            label: 'Akademik & Kesiswaan',
            items: [
                { href: route('admin.students.index'), name: 'admin.students.*', icon: GraduationCap, label: 'Buku Induk Siswa' },
                { href: route('admin.staff.index'), name: 'admin.staff.*', icon: Users, label: 'Data Guru & Tendik' },
                { href: route('admin.academic-calendars.index'), name: 'admin.academic-calendars.*', icon: Calendar, label: 'Kalender Pendidikan' },
                { href: route('admin.kartu-nisn.index'), name: 'admin.kartu-nisn.*', icon: Contact, label: 'Cetak Kartu NISN' },
            ],
        },
        {
            label: 'Administrasi & Surat',
            items: [
                { href: route('admin.surat-tugas.create'), name: 'admin.surat-tugas.*', icon: FileText, label: 'Surat Tugas' },
                { href: route('admin.graduation-letters.index'), name: 'admin.graduation-letters.*', icon: Award, label: 'Surat Kelulusan' },
                { href: route('admin.documents.index'), name: 'admin.documents.*', icon: FolderOpen, label: 'Arsip Dokumen' },
            ],
        },
        {
            label: 'Komunikasi',
            items: [
                { href: route('admin.notifications.index'), name: 'admin.notifications.*', icon: Bell, label: 'Kirim Notifikasi' },
                { href: route('admin.notification-templates.index'), name: 'admin.notification-templates.*', icon: MessageSquare, label: 'Template Pesan' },
                { href: route('admin.faqs.index'), name: 'admin.faqs.*', icon: HelpCircle, label: 'Kelola FAQ' },
            ],
        },
        {
            label: 'Landing Page',
            items: [
                { href: route('admin.school-missions.index'), name: 'admin.school-missions.*', icon: Target, label: 'Misi Sekolah' },
                { href: route('admin.school-values.index'), name: 'admin.school-values.*', icon: Heart, label: 'Nilai Karakter' },
                { href: route('admin.school-programs.index'), name: 'admin.school-programs.*', icon: Star, label: 'Program Unggulan' },
                { href: route('admin.school-facilities.index'), name: 'admin.school-facilities.*', icon: Building2, label: 'Fasilitas' },
                { href: route('admin.extracurriculars.index'), name: 'admin.extracurriculars.*', icon: Activity, label: 'Ekstrakurikuler' },
                { href: route('admin.achievements.index'), name: 'admin.achievements.*', icon: Award, label: 'Prestasi' },
                { href: route('admin.school-galleries.index'), name: 'admin.school-galleries.*', icon: ImageIcon, label: 'Galeri & Foto' },
            ],
        },
        {
            label: 'Sistem',
            items: [
                { href: route('admin.school-settings.edit'), name: 'admin.school-settings.*', icon: Settings, label: 'Profil Sekolah' },
                { href: route('admin.whatsapp-settings.edit'), name: 'admin.whatsapp-settings.*', icon: Smartphone, label: 'Koneksi WhatsApp' },
                { href: route('admin.users.index'), name: 'admin.users.*', icon: Users, label: 'Kelola Pengguna' },
            ],
        },
    ];

    const mobileItems = navigationGroups.slice(0, 2).flatMap((group) => group.items);
    const totalCols = mobileItems.length + 1; // + tab Akun

    return (
        <div className="min-h-screen bg-navy-50">
            <Toaster richColors closeButton position="top-right" />

            <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-64 lg:flex-col lg:bg-navy-950 lg:text-white">
                <div className="flex items-center gap-3 border-b border-navy-800 px-5 py-4">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-500 text-navy-950">
                        <GraduationCap className="h-5 w-5" />
                    </span>
                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-gold-400">Manage OPS</p>
                        <p className="text-xs font-semibold leading-tight">{school?.name}</p>
                    </div>
                </div>
                <nav className="sidebar-scroll flex-1 space-y-4 overflow-y-auto px-3 py-5">
                    {navigationGroups.map((group) => (
                        <div key={group.label} className="space-y-1">
                            <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-navy-400">
                                {group.label}
                            </p>
                            {group.items.map((item) => (
                                <Item key={item.name} href={item.href} active={isCurrent(item.name)} icon={item.icon}>
                                    {item.label}
                                </Item>
                            ))}
                        </div>
                    ))}
                </nav>
                <div className="border-t border-navy-800 px-3 py-4">
                    <div className="mb-2 rounded-lg bg-navy-900/60 px-3 py-2">
                        <p className="text-sm font-medium">{auth?.user?.name}</p>
                        <p className="text-xs text-navy-300">{auth?.user?.phone}</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => router.post(route('logout'))}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-navy-100 hover:bg-navy-800"
                    >
                        <LogOut className="h-4 w-4" />
                        Keluar
                    </button>
                </div>
            </aside>

            {children}

            {/* Bottom nav (mobile) */}
            <nav
                className="fixed inset-x-0 bottom-0 z-30 grid border-t border-navy-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_12px_-6px_rgba(15,23,42,0.12)] lg:hidden"
                style={{ gridTemplateColumns: `repeat(${totalCols}, minmax(0, 1fr))` }}
            >
                {mobileItems.map((item) => (
                    <MobileTab
                        key={item.name}
                        href={item.href}
                        active={isCurrent(item.name)}
                        icon={item.icon}
                        label={item.mobileLabel ?? item.label}
                    />
                ))}
                <MobileTabButton
                    active={accountOpen}
                    icon={UserIcon}
                    label="Akun"
                    onClick={() => setAccountOpen(true)}
                />
            </nav>

            {/* Account bottom sheet (mobile) */}
            {accountOpen && (
                <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
                    <div
                        className="fixed inset-0 bg-navy-950/40"
                        onClick={() => setAccountOpen(false)}
                    />
                    <div className="fixed inset-x-0 bottom-0 rounded-t-2xl bg-white pb-[env(safe-area-inset-bottom)] shadow-2xl">
                        <div className="flex justify-center pt-2">
                            <span className="h-1 w-10 rounded-full bg-navy-200" />
                        </div>
                        <div className="px-5 py-4">
                            <p className="text-xs uppercase tracking-widest text-navy-400">Akun</p>
                            <p className="mt-1 text-sm font-semibold text-navy-900">{auth?.user?.name ?? '-'}</p>
                            <p className="text-xs text-navy-500">{auth?.user?.phone ?? '-'}</p>
                        </div>
                        <div className="space-y-4 border-t border-navy-100 px-3 py-4">
                            {navigationGroups.slice(2).map((group) => (
                                <div key={group.label} className="space-y-1">
                                    <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-navy-400">
                                        {group.label}
                                    </p>
                                    {group.items.map((item) => (
                                        <SheetItem key={item.name} item={item} onClick={() => setAccountOpen(false)} />
                                    ))}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => {
                                    setAccountOpen(false);
                                    router.post(route('logout'));
                                }}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                            >
                                <LogOut className="h-4 w-4" />
                                Keluar
                            </button>
                        </div>
                        <div className="border-t border-navy-100 px-3 py-2">
                            <button
                                type="button"
                                onClick={() => setAccountOpen(false)}
                                className="flex w-full items-center justify-center rounded-lg px-3 py-2.5 text-sm font-medium text-navy-500 hover:bg-navy-50"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
