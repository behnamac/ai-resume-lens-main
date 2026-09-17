import { SCAN_STEPS, stateWord, toneText } from "~/lib/signal";

const DIMENSIONS = [
    { title: "TONE & STYLE", blurb: "How it sounds — hedging, filler, and verbs that do no work." },
    { title: "CONTENT", blurb: "Whether the claims answer the listing you pasted, with numbers behind them." },
    { title: "STRUCTURE", blurb: "Order, length, and whether the important lines are where eyes land." },
    { title: "SKILLS", blurb: "The overlap between what you list and what the role actually asks for." },
];

/** The three bands, read off the same thresholds the reports use. */
const BANDS = [
    { score: 80, range: "71–100" },
    { score: 60, range: "50–70" },
    { score: 30, range: "0–49" },
];

/** What the scan does, in the order it does it — the explainer behind HOW IT READS. */
const HowItReads = ({ onStart, onClose }: { onStart: () => void; onClose: () => void }) => {
    return (
        <div className="p-8 md:p-10 flex flex-col gap-9">
            <div>
                <h2 className="display text-4xl md:text-[44px] leading-none">How the scan works</h2>
                <p className="mt-3 text-base leading-relaxed text-muted">
                    You give it a PDF and the listing you are aiming at. It runs six passes and comes
                    back with one score, the five things behind it, and the lines to change.
                </p>
            </div>

            <div className="flex flex-col gap-5">
                <div className="mono-label">THE SIX PASSES</div>
                {SCAN_STEPS.map((step, index) => (
                    <div key={step.label} className="flex gap-5">
                        <span className="font-mono text-[13px] text-accent pt-0.5 shrink-0">
                            {String(index + 1).padStart(2, "0")}
                        </span>
                        <div className="flex flex-col gap-1.5">
                            <span className="font-mono uppercase text-[13px] tracking-[0.06em]">
                                {step.label}
                            </span>
                            <span className="text-[15px] leading-relaxed text-muted">{step.blurb}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex flex-col gap-5 pt-7 border-t border-hairline">
                <div className="mono-label">WHAT GETS SCORED</div>
                {DIMENSIONS.map((dimension) => (
                    <div key={dimension.title} className="flex flex-col gap-1.5">
                        <span className="font-mono uppercase text-[13px] tracking-[0.06em]">
                            {dimension.title}
                        </span>
                        <span className="text-[15px] leading-relaxed text-muted">{dimension.blurb}</span>
                    </div>
                ))}
                <div className="flex flex-col gap-1.5">
                    <span className="font-mono uppercase text-[13px] tracking-[0.06em] text-accent">
                        ATS
                    </span>
                    <span className="text-[15px] leading-relaxed text-muted">
                        Scored on its own. This is how the resume reads to the software that screens
                        it before a person does.
                    </span>
                </div>
                <p className="text-[15px] leading-relaxed text-muted">
                    The four above fold into one overall score out of 100.
                </p>
            </div>

            <div className="flex flex-col gap-4 pt-7 border-t border-hairline">
                <div className="mono-label">WHAT THE SCORE MEANS</div>
                {BANDS.map((band) => (
                    <div key={band.range} className="flex items-baseline gap-4">
                        <span className={`font-mono text-[13px] tracking-[0.12em] w-20 shrink-0 ${toneText(band.score)}`}>
                            {stateWord(band.score)}
                        </span>
                        <span className="font-mono text-[13px] text-dim">{band.range}</span>
                    </div>
                ))}
            </div>

            <div className="flex flex-col gap-6">
                <button className="btn-signal" onClick={onStart}>
                    RUN YOUR FIRST SCAN
                </button>
                <button
                    className="mono-faint text-center cursor-pointer hover:text-dim"
                    onClick={onClose}
                >
                    CLOSE
                </button>
            </div>
        </div>
    );
};

export default HowItReads;
