import { useRef, type ElementType, type ReactNode } from "react";
import { EASE, gsap, useGSAP, withMotion } from "~/lib/motion";

/**
 * The plain lift-and-fade, for the things that are not sentences: buttons,
 * stat blocks, the strip along the bottom. Pass `stagger` and the direct
 * children come up one after another instead of as a block.
 */
const Reveal = ({
    as: Tag = "div",
    className,
    children,
    delay = 0,
    duration = 0.8,
    distance = 24,
    stagger,
}: {
    as?: ElementType;
    className?: string;
    children: ReactNode;
    delay?: number;
    duration?: number;
    /** How far below its slot the block starts, in px. */
    distance?: number;
    /** Set to stagger the direct children instead of moving the whole block. */
    stagger?: number;
}) => {
    const scope = useRef<HTMLElement>(null);

    useGSAP(
        () =>
            withMotion(() => {
                const targets =
                    stagger === undefined
                        ? scope.current
                        : Array.from(scope.current?.children ?? []);

                gsap.from(targets, {
                    y: distance,
                    autoAlpha: 0,
                    duration,
                    delay,
                    stagger,
                    ease: EASE,
                });
            }),
        { scope, dependencies: [delay, duration, distance, stagger] }
    );

    return (
        <Tag ref={scope} className={className}>
            {children}
        </Tag>
    );
};

export default Reveal;
