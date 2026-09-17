import { useRef } from "react";
import { EASE_COUNT, gsap, useGSAP, withMotion } from "~/lib/motion";

/**
 * A number that counts up to itself. It renders at its real value, so the
 * layout never shifts and a reader without motion (or without JS) sees the
 * figure straight away; the tween only rewinds it to zero once it can run.
 */
const Counter = ({
    value,
    prefix = "",
    suffix = "",
    decimals = 0,
    duration = 1.5,
    delay = 0.2,
    className,
}: {
    value: number;
    prefix?: string;
    suffix?: string;
    /** Digits after the point — the count snaps to this precision. */
    decimals?: number;
    duration?: number;
    delay?: number;
    className?: string;
}) => {
    const ref = useRef<HTMLSpanElement>(null);
    const read = (n: number) => `${prefix}${n.toFixed(decimals)}${suffix}`;

    useGSAP(
        () =>
            withMotion(() => {
                const el = ref.current;
                if (!el) return;

                const count = { n: 0 };
                el.textContent = read(0);

                const tween = gsap.to(count, {
                    n: value,
                    duration,
                    delay,
                    ease: EASE_COUNT,
                    snap: { n: 1 / 10 ** decimals },
                    onUpdate: () => {
                        el.textContent = read(count.n);
                    },
                });

                return () => {
                    tween.kill();
                    el.textContent = read(value);
                };
            }),
        { dependencies: [value, prefix, suffix, decimals, duration, delay] }
    );

    return (
        <span ref={ref} className={className}>
            {read(value)}
        </span>
    );
};

export default Counter;
