// Motion for the landing screens. GSAP is registered once, here, so every
// component animates on the same eases and the same reduced-motion contract:
// under "prefers-reduced-motion: reduce" nothing runs and the markup is the
// finished state already — text is readable, numbers read their real value.
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, SplitText);

/** The one curve the product moves on: fast out of the gate, long settle. */
export const EASE = "power3.out";
export const EASE_COUNT = "power2.out";

/** Wrap the animation so it only exists where motion is welcome. */
export const withMotion = (build: () => void | (() => void)) => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", build);
    return () => mm.revert();
};

export { gsap, SplitText, useGSAP };
