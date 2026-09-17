import { usePuterStore } from "~/lib/puter";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import ScanVisual from "~/components/ScanVisual";

export const meta = () => ([
    { title: 'Signal | Sign in' },
    { name: 'description', content: 'See your resume the way the filter sees it.' },
])

const Auth = () => {
    const { isLoading, error, auth } = usePuterStore();
    const location = useLocation();
    const next = location.search.split('next=')[1];
    const navigate = useNavigate();
    const [showSignIn, setShowSignIn] = useState(false);

    useEffect(() => {
        if(auth.isAuthenticated) navigate(next || '/');
    }, [auth.isAuthenticated, next])

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setShowSignIn(false);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    return (
        <main className="ground-center min-h-screen flex flex-col">
            <header className="screen-bar">
                <span className="wordmark">SIGNAL</span>
                <nav className="flex items-center gap-5 md:gap-6">
                    <a href="#how-it-reads" className="nav-link">HOW IT READS</a>
                    {auth.isAuthenticated ? (
                        <button className="btn-outline" onClick={auth.signOut}>SIGN OUT</button>
                    ) : (
                        <button className="btn-outline" onClick={() => setShowSignIn(true)}>SIGN IN</button>
                    )}
                </nav>
            </header>

            <div className="flex-1 flex flex-col lg:flex-row">
                <div className="w-full lg:w-[56%] px-6 md:px-10 py-16 lg:py-0 flex flex-col justify-center gap-8">
                    <div className="mono-eyebrow">RESUME ANALYSIS — ATS SCORING</div>
                    <h1 className="display text-5xl md:text-7xl lg:text-[86px] lg:leading-[0.95] max-w-[660px] text-pretty">
                        See your resume the way the filter sees it.
                    </h1>
                    <p className="text-lg md:text-[19px] leading-relaxed text-muted max-w-[520px]">
                        Drop in a PDF and the listing you are aiming at. You get one score,
                        the four things behind it, and the exact lines to change.
                    </p>
                    <div className="flex flex-wrap items-center gap-4">
                        <button className="btn-signal" onClick={() => setShowSignIn(true)}>
                            RUN YOUR FIRST SCAN
                        </button>
                        <span className="mono-faint">FREE PUTER ACCOUNT</span>
                    </div>
                    <div
                        id="how-it-reads"
                        className="flex flex-wrap gap-11 pt-5 border-t border-hairline max-w-[560px]"
                    >
                        <div>
                            <div className="text-[34px] font-bold tracking-[-0.03em]">6</div>
                            <div className="font-mono uppercase text-[11px] tracking-[0.14em] text-dim">
                                PASSES PER SCAN
                            </div>
                        </div>
                        <div>
                            <div className="text-[34px] font-bold tracking-[-0.03em]">~40s</div>
                            <div className="font-mono uppercase text-[11px] tracking-[0.14em] text-dim">
                                TO A FULL REPORT
                            </div>
                        </div>
                        <div>
                            <div className="text-[34px] font-bold tracking-[-0.03em]">4</div>
                            <div className="font-mono uppercase text-[11px] tracking-[0.14em] text-dim">
                                SCORED DIMENSIONS
                            </div>
                        </div>
                    </div>
                </div>

                <div className="hidden lg:flex w-[44%] border-l border-hairline items-center justify-center">
                    <ScanVisual src="/images/resume_01.png" caption="SAMPLE SCAN · 78 / 100" />
                </div>
            </div>

            <div className="strip">
                <div className="strip-cell">01&nbsp;&nbsp;UPLOAD PDF + LISTING</div>
                <div className="strip-cell">02&nbsp;&nbsp;SIX ANALYSIS PASSES</div>
                <div className="strip-cell">03&nbsp;&nbsp;SCORE + LINE EDITS</div>
            </div>

            {showSignIn && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
                    <div
                        className="absolute inset-0 bg-void/70"
                        onClick={() => setShowSignIn(false)}
                    />
                    <div className="relative w-full max-w-[520px] border border-edge bg-panel">
                        <div className="flex justify-between items-center px-6 py-4 border-b border-hairline mono-label">
                            <span>SESSION</span>
                            <span className="text-accent">YOUR OWN DRIVE</span>
                        </div>
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
                                onClick={() => setShowSignIn(false)}
                            >
                                CANCEL
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}

export default Auth
