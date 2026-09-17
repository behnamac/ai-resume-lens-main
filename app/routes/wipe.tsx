import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import Navbar from "~/components/Navbar";
import { usePuterStore } from "~/lib/puter";

export const meta = () => ([
    { title: 'Signal | Wipe' },
    { name: 'description', content: 'Delete everything Signal has stored for you.' },
])

const WipeApp = () => {
    const { auth, isLoading, error, fs, kv } = usePuterStore();
    const navigate = useNavigate();
    const [files, setFiles] = useState<FSItem[]>([]);
    const [confirming, setConfirming] = useState(false);

    const loadFiles = async () => {
        const files = (await fs.readDir("./")) as FSItem[];
        setFiles(files);
    };

    useEffect(() => {
        loadFiles();
    }, []);

    useEffect(() => {
        if (!isLoading && !auth.isAuthenticated) {
            navigate("/auth?next=/wipe");
        }
    }, [isLoading]);

    const handleDelete = async () => {
        await Promise.all(files.map((file) => fs.delete(file.path)));
        await kv.flush();
        setConfirming(false);
        loadFiles();
    };

    return (
        <main className="ground-center min-h-screen flex flex-col">
            <Navbar meta={<Link to="/" className="nav-link">&larr; ALL SCANS</Link>}>
                <span className="mono-meta">{auth.user?.username ?? "—"}</span>
            </Navbar>

            <div className="flex-1 px-6 md:px-10 py-12 flex flex-col gap-8 max-w-3xl">
                <div>
                    <div className="mono-eyebrow text-flag">DESTRUCTIVE</div>
                    <h1 className="display text-4xl md:text-5xl mt-3">Wipe everything.</h1>
                    <p className="text-lg leading-relaxed text-muted mt-4">
                        This deletes every file Signal stored in your drive and clears all scan
                        records. It cannot be undone.
                    </p>
                </div>

                {isLoading && <div className="mono-faint">LOADING</div>}
                {error && <div className="mono-faint text-flag">{error}</div>}

                <div className="flex flex-col gap-3">
                    <div className="mono-label">STORED FILES · {files.length}</div>
                    <div className="flex flex-col">
                        {files.map((file) => (
                            <div
                                key={file.id}
                                className="font-mono text-[13px] text-dim py-2.5 border-b border-hairline-soft truncate"
                            >
                                {file.name}
                            </div>
                        ))}
                        {!isLoading && files.length === 0 && (
                            <div className="mono-faint py-2.5">NOTHING STORED</div>
                        )}
                    </div>
                </div>

                {confirming ? (
                    <div className="flex flex-wrap gap-4">
                        <button
                            className="btn-signal bg-flag hover:bg-flag"
                            onClick={handleDelete}
                        >
                            YES, DELETE EVERYTHING
                        </button>
                        <button className="btn-quiet" onClick={() => setConfirming(false)}>
                            CANCEL
                        </button>
                    </div>
                ) : (
                    <button
                        className="btn-quiet w-fit"
                        onClick={() => setConfirming(true)}
                        disabled={files.length === 0}
                    >
                        WIPE APP DATA
                    </button>
                )}
            </div>
        </main>
    );
};

export default WipeApp;
