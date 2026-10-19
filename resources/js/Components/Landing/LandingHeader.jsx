import { Link, usePage } from '@inertiajs/react';
import * as Dialog from '@radix-ui/react-dialog';
import { ArrowRight, GraduationCap, LayoutDashboard, LogIn, Menu, Search, X } from 'lucide-react';
import { useRef } from 'react';
import { useReducedMotion } from 'motion/react';

const navigation = [
    { label: 'Alur', href: '#alur' },
    { label: 'Persyaratan', href: '#persyaratan' },
    { label: 'Setelah mendaftar', href: '#status' },
];

export default function LandingHeader({ canLogin = true, home = true }) {
    const { auth, school } = usePage().props;
    const schoolName = school?.name || 'SD Negeri 001 Kepenuhan';
    const dashboardRoute = auth?.user?.role === 'admin' ? 'admin.dashboard' : 'dashboard';
    const accountHref = auth?.user ? route(dashboardRoute) : canLogin ? route('login') : null;
    const AccountIcon = auth?.user ? LayoutDashboard : LogIn;
    const accountLabel = auth?.user ? 'Dashboard' : 'Masuk';
    const anchorTarget = useRef(null);
    const reducedMotion = useReducedMotion();

    const restoreMenuFocus = (event) => {
        const hash = anchorTarget.current;
        anchorTarget.current = null;
        if (!hash) return;

        // Restore focus to the section after the exit animation, without scrolling back to the trigger.
        event.preventDefault();
        const target = document.querySelector(hash);
        target?.focus({ preventScroll: true });
        target?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    };

    return (
        <header className="motion-header public-header sticky top-0 z-40 border-b border-[var(--public-line)] bg-[var(--public-surface)]">
            <div className="public-container flex h-[4.5rem] items-center justify-between gap-3">
                <Link href="/" className="public-focus flex min-w-0 items-center gap-2.5 rounded-xl sm:gap-3">
                    {school?.logo_url ? (
                        <img src={school.logo_url} alt={'Logo ' + schoolName} width="40" height="40" className="h-10 w-10 shrink-0 rounded-xl bg-white p-1 object-contain" />
                    ) : (
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--public-secondary)] text-[var(--public-ink)]">
                            <GraduationCap className="h-6 w-6" aria-hidden="true" />
                        </span>
                    )}
                    <span className="min-w-0">
                        <span className="block text-[10px] font-semibold tracking-[0.12em] text-[var(--public-muted)]">PORTAL SPMB</span>
                        <span className="block max-w-[8.5rem] truncate font-display text-xs font-semibold text-[var(--public-ink)] sm:max-w-xs sm:text-sm">{schoolName}</span>
                    </span>
                </Link>
                <nav aria-label="Navigasi SPMB" className="hidden items-center gap-1 lg:flex">
                    {navigation.map((item) => (
                        <a key={item.href} href={(home ? '' : '/') + item.href} className="public-nav-link">{item.label}</a>
                    ))}
                </nav>
                <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
                    <div className="hidden items-center gap-3 lg:flex">
                        <Link href="/cek-status" className="public-nav-link flex h-11 items-center gap-2 px-3" aria-label="Cek status pendaftaran">
                            <Search className="h-4 w-4" aria-hidden="true" />
                            <span>Cek status</span>
                        </Link>
                        {accountHref && (
                            <Link
                                href={accountHref}
                                className="public-button public-button-primary h-10 px-4"
                                aria-label={accountLabel}
                            >
                                <AccountIcon className="h-4 w-4" aria-hidden="true" />
                                <span>{accountLabel}</span>
                            </Link>
                        )}
                    </div>
                    <Dialog.Root>
                        <Dialog.Trigger asChild>
                            <button type="button" className="public-nav-link flex h-11 w-10 items-center justify-center p-0 lg:hidden" aria-label="Buka menu navigasi">
                                <Menu className="h-5 w-5" aria-hidden="true" />
                            </button>
                        </Dialog.Trigger>
                        <Dialog.Portal>
                            <Dialog.Overlay className="motion-overlay fixed inset-0 z-[60] bg-slate-950/45" />
                            <Dialog.Content onCloseAutoFocus={restoreMenuFocus} className="motion-menu spmb-public-page public-mobile-menu fixed inset-x-3 top-4 z-[60] rounded-3xl border border-[var(--public-line)] bg-[var(--public-surface)] p-6 text-[var(--public-ink)] shadow-xl sm:inset-x-auto sm:left-1/2 sm:w-[28rem] sm:-translate-x-1/2">
                                <Dialog.Title className="pr-10 font-display text-xl font-semibold">Menu SPMB</Dialog.Title>
                                <Dialog.Description className="mt-2 text-sm leading-6 text-[var(--public-muted)]">Temukan informasi pendaftaran yang Anda perlukan.</Dialog.Description>
                                <Dialog.Close className="public-focus absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl hover:bg-[var(--public-soft)]" aria-label="Tutup menu navigasi">
                                    <X className="h-5 w-5" aria-hidden="true" />
                                </Dialog.Close>
                                <nav aria-label="Navigasi SPMB seluler" className="mt-5 flex flex-col gap-1">
                                    {navigation.map((item) => (
                                        <Dialog.Close key={item.href} asChild>
                                            <a href={(home ? '' : '/') + item.href} onClick={() => { anchorTarget.current = home ? item.href : null; }} className="public-nav-link flex min-h-12 items-center justify-between px-3">
                                                {item.label}<ArrowRight className="h-4 w-4" aria-hidden="true" />
                                            </a>
                                        </Dialog.Close>
                                    ))}
                                    <Dialog.Close asChild><Link href="/cek-status" className="public-nav-link flex min-h-12 items-center gap-3 px-3"><Search className="h-4 w-4" aria-hidden="true" />Cek status</Link></Dialog.Close>
                                    {accountHref && <Dialog.Close asChild><Link href={accountHref} className="public-button public-button-primary mt-3"><AccountIcon className="h-4 w-4" aria-hidden="true" />{accountLabel}</Link></Dialog.Close>}
                                </nav>
                            </Dialog.Content>
                        </Dialog.Portal>
                    </Dialog.Root>
                </div>
            </div>
        </header>
    );
}
