import { Link } from "react-router";
import { scanDate, stateWord, toneHex } from "~/lib/signal";

/** One scan in the dashboard table. The link covers the row; the delete control sits above it. */
const ResumeRow = ({
    resume,
    onDelete,
    deleting = false,
}: {
    resume: Resume;
    onDelete: (resume: Resume) => void;
    deleting?: boolean;
}) => {
    const { id, companyName, jobTitle, feedback, createdAt } = resume;
    const scored = Boolean(feedback);
    const score = scored ? feedback.overallScore : 0;
    const tone = scored ? toneHex(score) : "#5a6478";
    const label = jobTitle || "Untitled role";

    return (
        <div
            className={`group relative grid grid-cols-[64px_1fr_44px]
                md:grid-cols-[80px_1fr_200px_120px_100px_120px_44px] items-center
                gap-x-4 md:gap-x-5 gap-y-1 px-4 md:px-6 py-6 border-b border-hairline-soft
                transition-colors duration-150 hover:bg-accent/5
                ${deleting ? "opacity-40 pointer-events-none" : ""}`}
        >
            <Link
                to={`/resume/${id}`}
                aria-label={`Open the scan for ${label}`}
                className="absolute inset-0"
            />

            <div
                className="text-3xl font-bold tracking-[-0.03em]"
                style={{ color: tone }}
            >
                {scored ? score : "—"}
            </div>

            <div className="min-w-0">
                <div className="text-xl md:text-[22px] font-medium tracking-[-0.015em] text-ink truncate">
                    {label}
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

            {/* Quiet until the row is hovered, so the table stays a list of scans, not a list of buttons. */}
            <button
                type="button"
                onClick={() => onDelete(resume)}
                disabled={deleting}
                aria-label={`Delete the scan for ${label}`}
                title="Delete scan"
                className="relative z-10 col-start-3 row-start-1 md:col-start-auto md:row-start-auto
                    justify-self-end w-9 h-9 flex items-center justify-center border border-transparent
                    text-faint cursor-pointer transition-all duration-150
                    opacity-70 md:opacity-0 md:group-hover:opacity-100 focus-visible:opacity-100
                    hover:text-exit hover:border-exit/50 hover:bg-exit/10"
            >
                <svg
                    width="15"
                    height="15"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    aria-hidden="true"
                >
                    <path d="M2.5 4h11M6.5 4V2.5h3V4M4 4l.7 9.5h6.6L12 4M6.6 6.5v4.5M9.4 6.5v4.5" />
                </svg>
            </button>
        </div>
    );
};

export default ResumeRow;
