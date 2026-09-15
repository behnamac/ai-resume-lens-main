/** The six passes, with the one in flight marked. */
const ProcessingPanel = ({
    steps,
    current,
    failed = false,
}: {
    steps: string[];
    current: number;
    failed?: boolean;
}) => {
    return (
        <div className="flex flex-col gap-3.5 max-w-[600px]">
            {steps.map((label, index) => {
                const done = index < current;
                const active = index === current;
                const color = done
                    ? "text-accent"
                    : active
                        ? failed ? "text-flag" : "text-accent"
                        : "text-faint";
                const mark = done ? "✓" : active ? (failed ? "×" : "›") : "·";

                return (
                    <div
                        key={label}
                        className={`flex items-center gap-4 font-mono text-[13px] ${color}`}
                    >
                        <span className="w-4.5">{mark}</span>
                        <span className="w-[190px] tracking-[0.06em] shrink-0">{label}</span>
                        <span className="flex-1 h-px bg-hairline relative overflow-hidden">
                            {done && <span className="absolute inset-0 bg-accent" />}
                            {active && !failed && (
                                <span className="absolute inset-y-0 w-1/3 bg-accent animate-sweep" />
                            )}
                            {active && failed && <span className="absolute inset-0 bg-flag" />}
                        </span>
                        <span className="w-12 text-right text-faint">
                            {done ? "100%" : active ? (failed ? "FAIL" : "···") : "0%"}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

export default ProcessingPanel;
