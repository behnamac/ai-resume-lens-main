/**
 * The scan: concentric rings around a resume with a line sweeping down it.
 * Without a page image it still reads — the rings carry the motion.
 */
const ScanVisual = ({
    src,
    caption,
    width = 270,
    height = 360,
    paused = false,
}: {
    src?: string;
    caption?: string;
    width?: number;
    height?: number;
    paused?: boolean;
}) => {
    return (
        <div className="relative flex items-center justify-center overflow-hidden w-full h-full min-h-[440px]">
            <div
                className={`absolute rounded-full border border-accent/15 ${paused ? "" : "animate-ring"}`}
                style={{ width: 560, height: 560 }}
            />
            <div
                className={`absolute rounded-full border border-accent/20 ${paused ? "" : "animate-ring [animation-delay:2s]"}`}
                style={{ width: 380, height: 380 }}
            />
            <div
                className="absolute rounded-full border border-accent/30"
                style={{
                    width: 210,
                    height: 210,
                    boxShadow: "0 0 70px rgba(91,233,200,0.16) inset",
                }}
            />

            <div className="relative p-3.5 border border-accent/25">
                {src ? (
                    <img
                        src={src}
                        alt="Resume being scanned"
                        className="block object-cover object-top opacity-55"
                        style={{ width, height, filter: "grayscale(1) contrast(1.2)" }}
                    />
                ) : (
                    <div
                        className={`bg-panel/60 ${paused ? "" : "animate-signal-pulse"}`}
                        style={{ width, height }}
                    />
                )}
                {!paused && (
                    <div className="absolute left-3.5 right-3.5 top-1/2 h-0.5 animate-scan bg-gradient-to-r from-transparent via-accent to-transparent" />
                )}
            </div>

            {caption && (
                <div className="absolute bottom-7 left-0 right-0 text-center font-mono uppercase text-[11px] tracking-[0.18em] text-faint">
                    {caption}
                </div>
            )}
        </div>
    );
};

export default ScanVisual;
