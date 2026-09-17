import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import ResumeRow from "~/components/ResumeRow";
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
  const { auth, kv } = usePuterStore();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(true);

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
        <button className="nav-link cursor-pointer" onClick={auth.signOut}>
          SIGN OUT
        </button>
        <Link to="/upload" className="btn-outline">RUN NEW SCAN</Link>
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
                <div className="w-24 h-24 border border-accent/35 flex items-center justify-center animate-signal-pulse">
                  <div className="w-0.5 h-13 bg-accent" />
                </div>
                <h1 className="display text-4xl md:text-5xl lg:text-[52px] leading-[1.02]">
                  Nothing scanned yet
                </h1>
                <p className="text-lg leading-relaxed text-muted max-w-[480px]">
                  Upload a resume and paste the listing you want it measured against.
                  The first scan takes about forty seconds.
                </p>
                <Link to="/upload" className="btn-signal">UPLOAD A RESUME</Link>
              </div>
            </div>
            <div className="strip">
              <div className="strip-cell text-faint">PDF UP TO 20 MB</div>
              <div className="strip-cell text-faint">ONE PAGE OR TWO</div>
              <div className="strip-cell text-faint">STORED IN YOUR OWN DRIVE</div>
            </div>
          </>
      )}

      {!loadingResumes && resumes.length > 0 && (
          <>
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 px-6 md:px-10 pt-12 pb-9 border-b border-hairline">
              <h1 className="display text-5xl md:text-6xl lg:text-[72px] max-w-[620px]">
                {numberWord(resumes.length)} scan{resumes.length === 1 ? "" : "s"}.{" "}
                {ready > 0 ? (
                    <>
                      <span className="text-accent">{numberWord(ready)}</span> worth sending.
                    </>
                ) : (
                    <>None worth sending yet.</>
                )}
              </h1>
              {scores.length > 0 && (
                  <div className="flex gap-10 md:gap-13 pb-2.5">
                    <div>
                      <div className="mono-label">MEDIAN</div>
                      <div className="text-5xl font-bold tracking-[-0.03em] leading-tight">
                        {median(scores)}
                      </div>
                    </div>
                    <div>
                      <div className="mono-label">BEST</div>
                      <div className="text-5xl font-bold tracking-[-0.03em] leading-tight text-accent">
                        {best}
                      </div>
                    </div>
                    <div>
                      <div className="mono-label">SCORED</div>
                      <div className="text-5xl font-bold tracking-[-0.03em] leading-tight">
                        {scores.length}
                      </div>
                    </div>
                  </div>
              )}
            </div>

            <div className="hidden md:grid grid-cols-[80px_1fr_200px_120px_100px_120px] items-center gap-5 px-10 py-4 border-b border-hairline mono-label">
              <div>SCORE</div>
              <div>ROLE</div>
              <div>COMPANY</div>
              <div>SCANNED</div>
              <div>ATS</div>
              <div></div>
            </div>

            <div className="flex flex-col">
              {resumes.map((resume) => (
                  <ResumeRow key={resume.id} resume={resume} />
              ))}
            </div>
          </>
      )}
    </main>
  );
}
