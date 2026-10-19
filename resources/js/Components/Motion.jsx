import { forwardRef } from 'react';
import { usePage } from '@inertiajs/react';
import { MotionConfig, motion, stagger, useReducedMotion } from 'motion/react';

export const motionEase = [0.22, 1, 0.36, 1];

export function MotionProvider({ children }) {
    return (
        <MotionConfig reducedMotion="user" transition={{ duration: 0.4, ease: motionEase }}>
            {children}
        </MotionConfig>
    );
}

// Ignore query-string changes so filtering, validation and polling keep form state.
export function PageTransition({ as = 'div', distance = 12, children, ...props }) {
    const { component, url } = usePage();
    const reducedMotion = useReducedMotion();
    const Element = motion[as];

    return (
        <Element
            key={`${component}:${url.split(/[?#]/)[0]}`}
            data-motion-page=""
            initial={reducedMotion ? false : { opacity: 0, ...(distance ? { y: distance } : {}) }}
            animate={{ opacity: 1, ...(distance ? { y: 0 } : {}) }}
            transition={{ duration: reducedMotion ? 0 : 0.36, ease: motionEase }}
            {...props}
        >
            {children}
        </Element>
    );
}

export const Reveal = forwardRef(function Reveal({ as = 'div', delay = 0, distance = 24, direction = 'up', children, ...props }, ref) {
    const reducedMotion = useReducedMotion();
    const Element = motion[as];
    const offset = direction === 'right' ? { x: distance } : { y: distance };

    return (
        <Element
            ref={ref}
            data-motion-reveal=""
            initial={reducedMotion ? false : { opacity: 0, ...offset }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, amount: 'some' }}
            transition={{ duration: reducedMotion ? 0 : 0.55, delay: reducedMotion ? 0 : delay, ease: motionEase }}
            {...props}
        >
            {children}
        </Element>
    );
});

export function Stagger({ as = 'div', inView = false, children, ...props }) {
    const reducedMotion = useReducedMotion();
    const Element = motion[as];

    return (
        <Element
            initial={reducedMotion ? false : 'hidden'}
            {...(inView ? { whileInView: 'visible', viewport: { once: true, amount: 'some' } } : { animate: 'visible' })}
            variants={{ hidden: {}, visible: { transition: { delayChildren: reducedMotion ? 0 : stagger(0.075) } } }}
            {...props}
        >
            {children}
        </Element>
    );
}

export function MotionItem({ as = 'div', children, ...props }) {
    const reducedMotion = useReducedMotion();
    const Element = motion[as];

    return (
        <Element
            variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }}
            transition={{ duration: reducedMotion ? 0 : 0.5, ease: motionEase }}
            {...props}
        >
            {children}
        </Element>
    );
}
