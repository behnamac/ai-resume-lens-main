import { toneHex } from "~/lib/signal";

const ScoreRing = ({
    score,
    size = 160,
    label = "OVERALL",
}: {
    score: number;
    size?: number;
    label?: string;
}) => {
    const radius = 44;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - Math.min(Math.max(score, 0), 100) / 100);

    return (
        <div className="relative shrink-0" style={{ width: size, height: size }}>
            <svg viewBox="0 0 100 100" width={size} height={size} className="-rotate-90">
                <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke="rgba(232,237,247,0.12)"
                    strokeWidth="3"
                />
                <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke={toneHex(score)}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div
                    className="font-bold tracking-[-0.03em]"
                    style={{ fontSize: size * 0.29 }}
                >
                    {score}
                </div>
                <div className="font-mono uppercase text-[10px] tracking-[0.16em] text-dim">
                    {label}
                </div>
            </div>
        </div>
    );
};

export default ScoreRing;
