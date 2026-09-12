import { useEffect } from 'react';

export default function useLandingMotion() {
    useEffect(() => {
        const root = document.querySelector('[data-landing-page]');

        if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return undefined;
        }

        const revealItems = Array.from(
            root.querySelectorAll('[data-reveal], .landing-card'),
        );

        root.classList.add('motion-ready');

        revealItems.forEach((item, index) => {
            const delay = item.dataset.revealDelay ?? Math.min((index % 4) * 70, 210);
            item.style.setProperty('--reveal-delay', `${delay}ms`);
        });

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;

                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                });
            },
            {
                threshold: 0.12,
                rootMargin: '0px 0px -8% 0px',
            },
        );

        revealItems.forEach((item) => observer.observe(item));

        const revealFallback = window.setTimeout(() => {
            revealItems.forEach((item) => item.classList.add('is-visible'));
        }, 1400);

        const handlePointerMove = (event) => {
            const card = event.target.closest('.landing-card');

            if (!card || !root.contains(card)) return;

            const bounds = card.getBoundingClientRect();
            card.style.setProperty('--pointer-x', `${event.clientX - bounds.left}px`);
            card.style.setProperty('--pointer-y', `${event.clientY - bounds.top}px`);
        };

        root.addEventListener('pointermove', handlePointerMove, { passive: true });

        return () => {
            window.clearTimeout(revealFallback);
            observer.disconnect();
            root.removeEventListener('pointermove', handlePointerMove);
            root.classList.remove('motion-ready');
        };
    }, []);
}
