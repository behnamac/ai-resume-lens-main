import { toneHex } from "~/lib/signal";

const Category = ({ title, score }: { title: string; score: number }) => {
    const tone = toneHex(score);

    return (
        <div className="border border-hairline px-5 py-4.5 flex flex-col gap-3">
            <div className="flex justify-between items-baseline gap-3">
                <span className="mono-label">{title.toUpperCase()}</span>
                <span
                    className="text-[28px] font-bold tracking-[-0.02em]"
                    style={{ color: tone }}
                >
                    {score}
                </span>
            </div>
            <div className="h-0.5 bg-hairline relative">
                <div
                    className="absolute left-0 inset-y-0"
                    style={{ width: `${Math.min(Math.max(score, 0), 100)}%`, background: tone }}
                />
            </div>
        </div>
    );
};

const Summary = ({ feedback }: { feedback: Feedback }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Category title="Tone & Style" score={feedback.toneAndStyle.score} />
            <Category title="Content" score={feedback.content.score} />
            <Category title="Structure" score={feedback.structure.score} />
            <Category title="Skills" score={feedback.skills.score} />
        </div>
    );
};

export default Summary;
