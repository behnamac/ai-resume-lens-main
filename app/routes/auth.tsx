import { usePuterStore } from "~/lib/puter";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import ScanVisual from "~/components/ScanVisual";
import RevealText from "~/components/RevealText";
import Reveal from "~/components/Reveal";
import Counter from "~/components/Counter";
import Modal from "~/components/Modal";
import HowItReads from "~/components/HowItReads";

export const meta = () => ([
    { title: 'Signal | Sign in' },
    { name: 'description', content: 'See your resume the way the filter sees it.' },
])

const Auth = () => {
    const { isLoading, error, auth } = usePuterStore();
    const location = useLocation();
    const next = location.search.split('next=')[1];
    const navigate = useNavigate();
    /** Only one dialog is ever up: the sign-in panel or the explainer. */
    const [overlay, setOverlay] = useState<'signin' | 'how' | null>(null);

    useEffect(() => {
        if(auth.isAuthenticated) navigate(next || '/');
    }, [auth.isAuthenticated, next])

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOverlay(null);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    return (
        <main className="ground-center min-h-screen flex flex-col">
            <header className="screen-bar">
                <span className="wordmark">RESUME LENS</span>
                <nav className="flex items-center gap-5 md:gap-6">
                    <button
                        className="nav-link cursor-pointer"
                        onClick={() => setOverlay('how')}
                    >
                        HOW IT READS
                    </button>
                    {auth.isAuthenticated ? (
                        <button className="btn-exit" onClick={auth.signOut}>SIGN OUT</button>
                    ) : (
                        <button className="btn-outline" onClick={() => setOverlay('signin')}>SIGN IN</button>
                    )}
                </nav>
            </header>

            <div className="flex-1 flex flex-col lg:flex-row">
                <div className="w-full lg:w-[56%] px-6 md:px-10 py-16 lg:py-0 flex flex-col justify-center gap-8">
                    {/* The hero lands in order: label, headline, promise, action, numbers. */}
                    <RevealText
                        className="mono-eyebrow"
                        unit="chars"
                        delay={0.1}
                        duration={0.5}
                        stagger={0.012}
                        distance={90}
                    >
                        RESUME ANALYSIS — ATS SCORING
                    </RevealText>
                    <RevealText
                        as="h1"
                        className="display text-5xl md:text-7xl lg:text-[86px] lg:leading-[0.95] max-w-[660px] text-pretty"
                        delay={0.24}
                        duration={1}
                        stagger={0.1}
                    >
                        See your resume the way the filter sees it.
                    </RevealText>
                    <RevealText
                        as="p"
                        className="text-lg md:text-[19px] leading-relaxed text-muted max-w-[520px]"
                        delay={0.62}
                        duration={0.8}
                        stagger={0.07}
                    >
                        Drop in a PDF and the listing you are aiming at. You get one score,
                        the four things behind it, and the exact lines to change.
                    </RevealText>
                    <Reveal className="flex flex-wrap items-center gap-4" delay={0.9} stagger={0.1}>
                        <button className="btn-signal" onClick={() => setOverlay('signin')}>
                            RUN YOUR FIRST SCAN
                        </button>
                        <span className="mono-faint">FREE PUTER ACCOUNT</span>
                    </Reveal>
                    <Reveal
                        className="flex flex-wrap gap-11 pt-5 border-t border-hairline max-w-[560px]"
                        delay={1.05}
                        stagger={0.12}
                    >
                        <div>
                            <Counter
                                value={6}
                                delay={1.25}
                                className="block text-[34px] font-bold tracking-[-0.03em]"
                            />
                            <div className="font-mono uppercase text-[11px] tracking-[0.14em] text-dim">
                                PASSES PER SCAN
                            </div>
                        </div>
                        <div>
                            <Counter
                                value={40}
                                prefix="~"
                                suffix="s"
                                delay={1.35}
                                className="block text-[34px] font-bold tracking-[-0.03em]"
                            />
                            <div className="font-mono uppercase text-[11px] tracking-[0.14em] text-dim">
                                TO A FULL REPORT
                            </div>
                        </div>
                        <div>
                            <Counter
                                value={4}
                                delay={1.45}
                                className="block text-[34px] font-bold tracking-[-0.03em]"
                            />
                            <div className="font-mono uppercase text-[11px] tracking-[0.14em] text-dim">
                                SCORED DIMENSIONS
                            </div>
                        </div>
                    </Reveal>
                </div>

                <div className="hidden lg:flex w-[44%] border-l border-hairline items-center justify-center">
                    <ScanVisual src="/images/resume_01.png" caption="SAMPLE SCAN · 78 / 100" />
                </div>
            </div>

            <Reveal className="strip" delay={1.3} distance={14} stagger={0.12}>
                <div className="strip-cell">01&nbsp;&nbsp;UPLOAD PDF + LISTING</div>
                <div className="strip-cell">02&nbsp;&nbsp;SIX ANALYSIS PASSES</div>
                <div className="strip-cell">03&nbsp;&nbsp;SCORE + LINE EDITS</div>
            </Reveal>

            {overlay === 'how' && (
                <Modal
                    label="HOW IT READS"
                    meta="6 PASSES · ~40s"
                    onClose={() => setOverlay(null)}
                    className="max-w-[620px]"
                >
                    <HowItReads
                        onStart={() => setOverlay('signin')}
                        onClose={() => setOverlay(null)}
                    />
                </Modal>
            )}

            {overlay === 'signin' && (
                <Modal
                    label="SESSION"
                    meta="YOUR OWN DRIVE"
                    onClose={() => setOverlay(null)}
                >
                    <div className="p-8 md:p-10 flex flex-col gap-6">
                        <div>
                            <h2 className="display text-4xl md:text-[44px] leading-none">Sign in</h2>
                            <p className="mt-3 text-base leading-relaxed text-muted">
                                Signal stores your resumes and scans in your own Puter drive.
                                Signing in is how it reaches them.
                            </p>
                        </div>
                        <button
                            className="btn-signal"
                            onClick={auth.signIn}
                            disabled={isLoading}
                        >
                            {isLoading ? "OPENING SECURE WINDOW…" : "CONTINUE WITH PUTER"}
                        </button>
                        {error && (
                            <div className="font-mono uppercase text-[11px] tracking-[0.14em] text-flag text-center">
                                {error}
                            </div>
                        )}
                        <button
                            className="mono-faint text-center cursor-pointer hover:text-dim"
                            onClick={() => setOverlay(null)}
                        >
                            CANCEL
                        </button>
                    </div>
                </Modal>
            )}
        </main>
    )
}

export default Auth
