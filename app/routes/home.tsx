import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import ResumeRow from "~/components/ResumeRow";
import Modal from "~/components/Modal";
import RevealText from "~/components/RevealText";
import Reveal from "~/components/Reveal";
import Counter from "~/components/Counter";
import { usePuterStore } from "~/lib/puter";
import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { median, numberWord } from "~/lib/signal";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Signal" },
    { name: "description", content: "See your resume the way the filter sees it." },
  ];
}

export default function Home() {
  const { auth, fs, kv } = usePuterStore();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [pendingDelete, setPendingDelete] = useState<Resume | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if(!auth.isAuthenticated) navigate('/auth?next=/');
  }, [auth.isAuthenticated])

  useEffect(() => {
    const loadResumes = async () => {
      setLoadingResumes(true);

      const resumes = (await kv.list('resume:*', true)) as KVItem[];

      const parsedResumes = resumes?.map((resume) => (
          JSON.parse(resume.value) as Resume
      ))

      setResumes(parsedResumes || []);
      setLoadingResumes(false);
    }

    loadResumes()
  }, []);

  /** Drop the record and the files it points at. A missing file should not block the record. */
  const handleDelete = async (resume: Resume) => {
    setDeletingId(resume.id);
    setDeleteError(null);

    try {
      const paths = [resume.resumePath, resume.imagePath].filter(Boolean);
      await Promise.all(
          paths.map((path) =>
              fs.delete(path).catch((err) => {
                // A 404 here means the drive no longer holds that file. The record still goes.
                console.warn(`[signal] could not delete ${path}`, err);
                return null;
              })
          )
      );
      await kv.delete(`resume:${resume.id}`);

      setResumes((prev) => prev.filter((item) => item.id !== resume.id));
      setPendingDelete(null);
    } catch (err) {
      console.error("[signal] delete failed", err);
      setDeleteError("COULD NOT DELETE THAT SCAN. TRY AGAIN.");
    } finally {
      setDeletingId(null);
    }
  };

  const scores = resumes
      .filter((resume) => Boolean(resume.feedback))
      .map((resume) => resume.feedback.overallScore);
  const ready = scores.filter((score) => score > 70).length;
  const best = scores.length ? Math.max(...scores) : 0;
  const isEmpty = !loadingResumes && resumes.length === 0;

  return (
    <main className="ground-center min-h-screen flex flex-col">
      <Navbar
          meta={
            !loadingResumes && resumes.length > 0 ? (
                <span className="mono-meta text-faint">
                  {resumes.length} SCANS · {ready} READY
                </span>
            ) : loadingResumes ? null : (
                <span className="mono-meta text-faint">NO SCANS YET</span>
            )
          }
      >
        <Link to="/upload" className="btn-outline">RUN NEW SCAN</Link>
        <button className="btn-exit" onClick={auth.signOut}>SIGN OUT</button>
      </Navbar>

      {loadingResumes && (
          <div className="flex-1 flex flex-col items-center justify-center gap-5 py-32">
            <div className="w-64 h-px bg-hairline relative overflow-hidden">
              <div className="absolute inset-y-0 w-1/3 bg-accent animate-sweep" />
            </div>
            <span className="mono-faint">READING YOUR SCANS</span>
          </div>
      )}

      {isEmpty && (
          <>
            <div className="flex-1 flex items-center justify-center relative px-6 py-24">
              <div className="absolute w-[620px] h-[620px] rounded-full border border-ink/5" />
              <div className="absolute w-[400px] h-[400px] rounded-full border border-ink/[0.07]" />
              <div className="relative flex flex-col items-center gap-7 text-center max-w-[600px]">
                <Reveal
                    className="w-24 h-24 border border-accent/35 flex items-center justify-center animate-signal-pulse"
                    delay={0.1}
                    distance={0}
                >
                  <div className="w-0.5 h-13 bg-accent" />
                </Reveal>
                <RevealText
                    as="h1"
                    className="display text-4xl md:text-5xl lg:text-[52px] leading-[1.02]"
                    unit="words"
                    delay={0.3}
                    duration={0.8}
                    stagger={0.07}
                >
                  Nothing scanned yet
                </RevealText>
                <RevealText
                    as="p"
                    className="text-lg leading-relaxed text-muted max-w-[480px]"
                    delay={0.55}
                    duration={0.8}
                    stagger={0.07}
                >
                  Upload a resume and paste the listing you want it measured against.
                  The first scan takes about forty seconds.
                </RevealText>
                <Reveal delay={0.85}>
                  <Link to="/upload" className="btn-signal">UPLOAD A RESUME</Link>
                </Reveal>
              </div>
            </div>
            <Reveal className="strip" delay={1} distance={14} stagger={0.12}>
              <div className="strip-cell text-faint">PDF UP TO 20 MB</div>
              <div className="strip-cell text-faint">ONE PAGE OR TWO</div>
              <div className="strip-cell text-faint">STORED IN YOUR OWN DRIVE</div>
            </Reveal>
          </>
      )}

      {!loadingResumes && resumes.length > 0 && (
          <>
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 px-6 md:px-10 pt-12 pb-9 border-b border-hairline">
              <RevealText
                  as="h1"
                  className="display text-5xl md:text-6xl lg:text-[72px] max-w-[620px]"
                  delay={0.1}
                  duration={0.95}
                  stagger={0.1}
              >
                {numberWord(resumes.length)} scan{resumes.length === 1 ? "" : "s"}.{" "}
                {ready > 0 ? (
                    <>
                      <span className="text-accent">{numberWord(ready)}</span> worth sending.
                    </>
                ) : (
                    <>None worth sending yet.</>
                )}
              </RevealText>
              {scores.length > 0 && (
                  <Reveal className="flex gap-10 md:gap-13 pb-2.5" delay={0.45} stagger={0.12}>
                    <div>
                      <div className="mono-label">MEDIAN</div>
                      <Counter
                          value={median(scores)}
                          delay={0.65}
                          className="block text-5xl font-bold tracking-[-0.03em] leading-tight"
                      />
                    </div>
                    <div>
                      <div className="mono-label">BEST</div>
                      <Counter
                          value={best}
                          delay={0.75}
                          className="block text-5xl font-bold tracking-[-0.03em] leading-tight text-accent"
                      />
                    </div>
                    <div>
                      <div className="mono-label">SCORED</div>
                      <Counter
                          value={scores.length}
                          delay={0.85}
                          className="block text-5xl font-bold tracking-[-0.03em] leading-tight"
                      />
                    </div>
                  </Reveal>
              )}
            </div>

            <div className="px-6 md:px-10 pb-16">
              <div className="hidden md:grid grid-cols-[80px_1fr_200px_120px_100px_120px_44px] items-center gap-5 px-6 py-4 border-b border-hairline mono-label">
                <div>SCORE</div>
                <div>ROLE</div>
                <div>COMPANY</div>
                <div>SCANNED</div>
                <div>ATS</div>
                <div></div>
                <div></div>
              </div>

              <div className="flex flex-col">
                {resumes.map((resume) => (
                    <ResumeRow
                        key={resume.id}
                        resume={resume}
                        onDelete={setPendingDelete}
                        deleting={deletingId === resume.id}
                    />
                ))}
              </div>
            </div>
          </>
      )}
      {pendingDelete && (
          <Modal
              label="DELETE SCAN"
              meta={pendingDelete.companyName || undefined}
              onClose={() => {
                if (deletingId) return;
                setPendingDelete(null);
                setDeleteError(null);
              }}
          >
            <div className="px-6 py-6 flex flex-col gap-6">
              <p className="text-base leading-relaxed text-muted">
                This removes the scan for{" "}
                <span className="text-ink">{pendingDelete.jobTitle || "this role"}</span>
                {pendingDelete.companyName ? (
                    <> at <span className="text-ink">{pendingDelete.companyName}</span></>
                ) : null}
                , along with the resume stored in your drive. It cannot be undone.
              </p>

              {deleteError && <div className="mono-faint text-flag">{deleteError}</div>}

              <div className="flex flex-wrap gap-3">
                <button
                    className="btn-exit"
                    onClick={() => handleDelete(pendingDelete)}
                    disabled={Boolean(deletingId)}
                >
                  {deletingId ? "DELETING" : "DELETE SCAN"}
                </button>
                <button
                    className="btn-quiet"
                    onClick={() => {
                      setPendingDelete(null);
                      setDeleteError(null);
                    }}
                    disabled={Boolean(deletingId)}
                >
                  CANCEL
                </button>
              </div>
            </div>
          </Modal>
      )}
    </main>
  );
}
