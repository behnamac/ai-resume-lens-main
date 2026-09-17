import { Link, useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";
import Summary from "~/components/Summary";
import ATS from "~/components/ATS";
import Details from "~/components/Details";
import ScoreRing from "~/components/ScoreRing";
import { numberWord, scanStamp } from "~/lib/signal";

export const meta = () => ([
    { title: 'Signal | Review' },
    { name: 'description', content: 'Detailed overview of your resume' },
])

const Resume = () => {
    const { auth, isLoading, fs, kv } = usePuterStore();
    const { id } = useParams();
    const [imageUrl, setImageUrl] = useState('');
    const [resumeUrl, setResumeUrl] = useState('');
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [target, setTarget] = useState({ companyName: '', jobTitle: '', createdAt: '' });
    const [missing, setMissing] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if(!isLoading && !auth.isAuthenticated) navigate(`/auth?next=/resume/${id}`);
    }, [isLoading])

    useEffect(() => {
        const loadResume = async () => {
            const resume = await kv.get(`resume:${id}`);

            if(!resume) return setMissing(true);

            const data = JSON.parse(resume);
            setTarget({
                companyName: data.companyName || '',
                jobTitle: data.jobTitle || '',
                createdAt: data.createdAt || '',
            });

            const resumeBlob = await fs.read(data.resumePath);
            if(resumeBlob) {
                const pdfBlob = new Blob([resumeBlob], { type: 'application/pdf' });
                setResumeUrl(URL.createObjectURL(pdfBlob));
            }

            const imageBlob = await fs.read(data.imagePath);
            if(imageBlob) setImageUrl(URL.createObjectURL(imageBlob));

            if(data.feedback) setFeedback(data.feedback);
            else setMissing(true);
        }

        loadResume();
    }, [id]);

    const flagged = feedback
        ? [feedback.toneAndStyle, feedback.content, feedback.structure, feedback.skills]
            .flatMap((category) => category.tips || [])
            .filter((tip) => tip.type === 'improve').length
        : 0;

    const lead = feedback
        ? feedback.overallScore > 70 ? 'Strong' : feedback.overallScore > 49 ? 'Solid' : 'Weak'
        : '';

    const targetLine = [target.companyName, target.jobTitle]
        .filter(Boolean)
        .join(' / ')
        .toUpperCase();

    return (
        <main className="ground-left min-h-screen lg:h-screen flex flex-col lg:overflow-hidden">
            <header className="screen-bar">
                <div className="flex items-center gap-6">
                    <Link to="/" className="wordmark">RESUME LENS</Link>
                    <Link to="/" className="nav-link">&larr; ALL SCANS</Link>
                </div>
                <div className="flex items-center gap-4">
                    <span className="mono-meta">SCAN · {scanStamp(target.createdAt)}</span>
                    <Link to="/upload" className="btn-quiet">RE-SCAN</Link>
                </div>
            </header>

            <div className="flex-1 flex flex-col lg:flex-row min-h-0">
                <aside className="w-full lg:w-[480px] shrink-0 lg:border-r border-hairline p-6 md:p-8 flex flex-col gap-4.5 min-h-0">
                    {imageUrl ? (
                        <>
                            <div className="border border-accent/25 p-3.5 min-h-0 flex-1 overflow-hidden max-lg:h-[520px]">
                                <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                                    <img
                                        src={imageUrl}
                                        alt="Your resume"
                                        title="Open the PDF"
                                        className="block w-full h-full object-cover object-top"
                                        style={{ filter: "grayscale(1) contrast(1.1) brightness(0.9)" }}
                                    />
                                </a>
                            </div>
                            <div className="flex justify-between mono-faint">
                                <span>{flagged} FLAGGED {flagged === 1 ? 'FINDING' : 'FINDINGS'}</span>
                                {resumeUrl && (
                                    <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="text-dim hover:text-ink">
                                        OPEN PDF
                                    </a>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 border border-hairline animate-signal-pulse" />
                    )}
                </aside>

                <section className="flex-1 min-w-0 min-h-0 lg:overflow-y-auto px-6 md:px-10 py-8 flex flex-col gap-6.5">
                    <div className="flex justify-between items-start gap-8">
                        <div>
                            {targetLine && <div className="mono-label">{targetLine}</div>}
                            <h1 className="display text-4xl md:text-5xl lg:text-[52px] mt-2.5">
                                {feedback ? (
                                    flagged > 0 ? (
                                        <>{lead}, with<br />{numberWord(flagged).toLowerCase()} {flagged === 1 ? 'gap' : 'gaps'}.</>
                                    ) : (
                                        <>{lead}, with<br />nothing flagged.</>
                                    )
                                ) : missing ? (
                                    <>This scan has<br />no report.</>
                                ) : (
                                    <>Compiling<br />the report.</>
                                )}
                            </h1>
                        </div>
                        {feedback && <ScoreRing score={feedback.overallScore} />}
                    </div>

                    {feedback ? (
                        <div className="flex flex-col gap-6.5 animate-in fade-in duration-700">
                            <ATS score={feedback.ATS.score || 0} suggestions={feedback.ATS.tips || []} />
                            <Summary feedback={feedback} />
                            <Details feedback={feedback} />
                        </div>
                    ) : missing ? (
                        <div className="flex flex-col gap-5 max-w-[520px]">
                            <p className="text-lg leading-relaxed text-muted">
                                The analysis for this scan never finished, so there is nothing to
                                read here. Run it again and Signal will keep the new report.
                            </p>
                            <Link to="/upload" className="btn-signal w-fit">RUN IT AGAIN</Link>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-5 py-10">
                            <div className="w-64 h-px bg-hairline relative overflow-hidden">
                                <div className="absolute inset-y-0 w-1/3 bg-accent animate-sweep" />
                            </div>
                            <span className="mono-faint">READING THE REPORT</span>
                        </div>
                    )}
                </section>
            </div>
        </main>
    )
}
export default Resume
