import { useRef, type ElementType, type ReactNode } from "react";
import { EASE, SplitText, gsap, useGSAP, withMotion } from "~/lib/motion";

type Unit = "lines" | "words" | "chars";

/**
 * Type that arrives instead of appearing: the text is split and each piece
 * rises into place a beat after the one before it.
 *
 * Lines rise out from behind their own edge — they are block boxes, so they
 * can be masked safely (`.reveal-line` buys back the room descenders need
 * under this leading). Words and chars sit inline, where a mask would drag
 * the baseline around, so those just lift and fade.
 *
 * The markup renders whole, so the sentence is there before the JS is. The
 * split only happens on the client, and `autoSplit` re-cuts it when the web
 * fonts land or the column changes width.
 */
const RevealText = ({
    as: Tag = "div",
    className,
    children,
    unit = "lines",
    delay = 0,
    duration = 0.9,
    stagger = 0.09,
    distance,
}: {
    as?: ElementType;
    className?: string;
    children: ReactNode;
    /** What the text breaks into before it moves. */
    unit?: Unit;
    delay?: number;
    duration?: number;
    stagger?: number;
    /** How far below its slot each piece starts, in % of its own height. */
    distance?: number;
}) => {
    const scope = useRef<HTMLElement>(null);
    const masked = unit === "lines";
    const rise = distance ?? (masked ? 110 : 70);

    useGSAP(
        () =>
            withMotion(() => {
                const split = SplitText.create(scope.current, {
                    type: unit,
                    mask: masked ? "lines" : undefined,
                    linesClass: "reveal-line",
                    autoSplit: true,
                    onSplit: (self) =>
                        gsap.from(self[unit], {
                            yPercent: rise,
                            autoAlpha: 0,
                            duration,
                            delay,
                            stagger,
                            ease: EASE,
                        }),
                });
                return () => split.revert();
            }),
        { scope, dependencies: [unit, delay, duration, stagger, rise] }
    );

    return (
        <Tag ref={scope} className={className}>
            {children}
        </Tag>
    );
};

export default RevealText;
