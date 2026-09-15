import { Link } from "react-router";
import { scanDate, stateWord, toneHex } from "~/lib/signal";

/** One scan in the dashboard table. */
const ResumeRow = ({ resume }: { resume: Resume }) => {
    const { id, companyName, jobTitle, feedback, createdAt } = resume;
    const scored = Boolean(feedback);
    const score = scored ? feedback.overallScore : 0;
    const tone = scored ? toneHex(score) : "#5a6478";

    return (
        <Link
            to={`/resume/${id}`}
            className="grid grid-cols-[64px_1fr] md:grid-cols-[80px_1fr_200px_120px_100px_120px] items-center
                gap-x-4 md:gap-x-5 gap-y-1 px-6 md:px-10 py-6 border-b border-hairline-soft
                transition-colors duration-150 hover:bg-accent/5"
        >
            <div
                className="text-3xl font-bold tracking-[-0.03em]"
                style={{ color: tone }}
            >
                {scored ? score : "—"}
            </div>

            <div className="min-w-0">
                <div className="text-xl md:text-[22px] font-medium tracking-[-0.015em] text-ink truncate">
                    {jobTitle || "Untitled role"}
                </div>
                <div className="md:hidden mono-faint mt-1 truncate">
                    {companyName || "—"} · {scanDate(createdAt)}
                </div>
            </div>

            <div className="hidden md:block text-base text-muted truncate">
                {companyName || "—"}
            </div>

            <div className="hidden md:block font-mono uppercase text-xs text-faint">
                {scanDate(createdAt)}
            </div>

            <div className="hidden md:block font-mono uppercase text-xs text-muted">
                {scored ? feedback.ATS.score : "—"}
            </div>

            <div className="col-start-2 md:col-start-auto flex md:justify-end mt-2 md:mt-0">
                <span
                    className="font-mono uppercase text-[11px] tracking-[0.12em] border px-2.5 py-1"
                    style={{ color: tone, borderColor: tone }}
                >
                    {scored ? stateWord(score) : "PENDING"}
                </span>
            </div>
        </Link>
    );
};

export default ResumeRow;
