type Tip = { type: "good" | "improve"; tip: string; explanation: string };

const Finding = ({ tip }: { tip: Tip }) => (
    <div
        className={`border-l-2 pl-4.5 ${
            tip.type === "good" ? "border-accent" : "border-flag"
        }`}
    >
        <div className="text-lg md:text-[19px] font-medium">{tip.tip}</div>
        <div className="text-[15px] leading-relaxed text-muted mt-1">
            {tip.explanation}
        </div>
    </div>
);

const Group = ({ title, tips }: { title: string; tips: Tip[] }) => {
    if (!tips?.length) return null;

    // Flags first — the reason someone opened this report.
    const ordered = [...tips].sort((a, b) =>
        a.type === b.type ? 0 : a.type === "improve" ? -1 : 1
    );

    return (
        <div className="flex flex-col gap-3.5">
            <div className="mono-label">{title}</div>
            {ordered.map((tip, index) => (
                <Finding key={`${title}-${index}`} tip={tip} />
            ))}
        </div>
    );
};

const Details = ({ feedback }: { feedback: Feedback }) => {
    return (
        <div className="flex flex-col gap-7">
            <Group title="TONE & STYLE" tips={feedback.toneAndStyle.tips} />
            <Group title="CONTENT" tips={feedback.content.tips} />
            <Group title="STRUCTURE" tips={feedback.structure.tips} />
            <Group title="SKILLS" tips={feedback.skills.tips} />
        </div>
    );
};

export default Details;
