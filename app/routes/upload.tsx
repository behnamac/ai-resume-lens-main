import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from "react-router";
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import ProcessingPanel from "~/components/ProcessingPanel";
import ScanVisual from "~/components/ScanVisual";
import { usePuterStore } from "~/lib/puter";
import { convertPdfToImage } from "~/lib/pdf2img";
import { formatSize, generateUUID } from "~/lib/utils";
import { SCAN_STEPS } from "~/lib/signal";
import { prepareInstructions } from "../../constants";

export const meta = () => ([
    { title: 'Signal | New scan' },
    { name: 'description', content: 'Upload a resume and the listing you are aiming at.' },
])

const STEPS = SCAN_STEPS.map((step) => step.label);

const MAX_DESCRIPTION = 8000;

const Upload = () => {
    const { fs, ai, kv } = usePuterStore();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [step, setStep] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [target, setTarget] = useState({ companyName: '', jobTitle: '' });
    const [descriptionLength, setDescriptionLength] = useState(0);

    const fail = (message: string) => {
        setError(message);
    };

    const handleAnalyze = async ({ companyName, jobTitle, jobDescription, file }: { companyName: string, jobTitle: string, jobDescription: string, file: File  }) => {
        setIsProcessing(true);
        setError(null);
        setStep(0);

        const uploadedFile = await fs.upload([file]);
        if(!uploadedFile) return fail('Could not upload the file to your drive.');

        setStep(1);
        const imageFile = await convertPdfToImage(file);
        if(!imageFile.file) return fail('Could not render the first page of that PDF.');
        setPreviewUrl(imageFile.imageUrl);

        setStep(2);
        const uploadedImage = await fs.upload([imageFile.file]);
        if(!uploadedImage) return fail('Could not upload the page image.');

        setStep(3);
        const uuid = generateUUID();
        const data = {
            id: uuid,
            resumePath: uploadedFile.path,
            imagePath: uploadedImage.path,
            companyName, jobTitle, jobDescription,
            createdAt: new Date().toISOString(),
            feedback: '',
        }
        await kv.set(`resume:${uuid}`, JSON.stringify(data));

        setStep(4);
        const feedback = await ai.feedback(
            uploadedFile.path,
            prepareInstructions({ jobTitle, jobDescription })
        )
        if (!feedback) return fail('The model did not return an analysis.');

        setStep(5);
        const feedbackText = typeof feedback.message.content === 'string'
            ? feedback.message.content
            : feedback.message.content[0].text;

        try {
            data.feedback = JSON.parse(feedbackText);
        } catch {
            return fail('The analysis came back in a shape Signal could not read.');
        }
        await kv.set(`resume:${uuid}`, JSON.stringify(data));
        navigate(`/resume/${uuid}`);
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const companyName = formData.get('company-name') as string;
        const jobTitle = formData.get('job-title') as string;
        const jobDescription = formData.get('job-description') as string;

        if(!file) return;

        setTarget({ companyName, jobTitle });
        handleAnalyze({ companyName, jobTitle, jobDescription, file }).catch((err) => {
            fail(err instanceof Error ? err.message : 'Something went wrong during the scan.');
        });
    }

    const targetLine = [target.companyName, target.jobTitle]
        .filter(Boolean)
        .join(' / ')
        .toUpperCase() || 'UNTITLED TARGET';

    if (isProcessing) {
        return (
            <main className="ground-center min-h-screen flex flex-col">
                <Navbar meta={<span className="mono-meta">{targetLine}</span>}>
                    <span className={`mono-meta ${error ? 'text-flag' : 'text-accent'}`}>
                        {error ? 'STOPPED' : 'SCANNING'}
                    </span>
                </Navbar>

                <div className="flex-1 flex flex-col lg:flex-row">
                    <div className="w-full lg:w-[58%] px-6 md:px-10 py-14 flex flex-col justify-center gap-8">
                        <div className={error ? 'mono-eyebrow text-flag' : 'mono-eyebrow'}>
                            {error
                                ? `STOPPED AT PASS 0${step + 1} OF 06`
                                : `ANALYSING — PASS 0${step + 1} OF 06`}
                        </div>
                        <h1 className="display text-4xl md:text-6xl lg:text-[72px] max-w-[640px] text-pretty">
                            {error
                                ? 'The scan stopped short.'
                                : 'Reading your resume the way the filter does.'}
                        </h1>

                        <ProcessingPanel steps={STEPS} current={step} failed={Boolean(error)} />

                        {error ? (
                            <div className="flex flex-col gap-5 max-w-[600px]">
                                <p className="text-lg leading-relaxed text-muted">{error}</p>
                                <div className="flex flex-wrap gap-4">
                                    <button
                                        className="btn-signal"
                                        onClick={() => { setIsProcessing(false); setError(null); }}
                                    >
                                        BACK TO THE FORM
                                    </button>
                                    <Link to="/" className="btn-quiet self-center">ALL SCANS</Link>
                                </div>
                            </div>
                        ) : (
                            <div className="mono-faint tracking-[0.16em]">
                                KEEP THIS TAB OPEN · SIGNAL OPENS THE REPORT WHEN IT IS DONE
                            </div>
                        )}
                    </div>

                    <div className="hidden lg:flex w-[42%] border-l border-hairline items-center justify-center">
                        <ScanVisual src={previewUrl || undefined} width={250} height={340} paused={Boolean(error)} />
                    </div>
                </div>

                <div className="strip">
                    <div className="strip-cell">
                        FILE&nbsp;&nbsp;<span className="text-ink normal-case">{file?.name}</span>
                    </div>
                    <div className="strip-cell">
                        SIZE&nbsp;&nbsp;<span className="text-ink">{file ? formatSize(file.size) : '—'}</span>
                    </div>
                    <div className="strip-cell">
                        PASS&nbsp;&nbsp;<span className={error ? 'text-flag' : 'text-ink'}>0{step + 1} / 06</span>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="ground-center min-h-screen flex flex-col">
            <Navbar meta={<Link to="/" className="nav-link">&larr; ALL SCANS</Link>}>
                <span className="mono-meta">STEP 01 OF 02</span>
            </Navbar>

            <form id="upload-form" onSubmit={handleSubmit} className="flex-1 flex flex-col lg:flex-row">
                <div className="w-full lg:w-[52%] px-6 md:px-10 py-11 flex flex-col gap-7">
                    <div>
                        <div className="mono-eyebrow">NEW SCAN</div>
                        <h1 className="display text-4xl md:text-5xl lg:text-[58px] mt-3">
                            What are you aiming at?
                        </h1>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 flex flex-col gap-2.5">
                            <label className="mono-label" htmlFor="company-name">COMPANY</label>
                            <input className="field" type="text" name="company-name" id="company-name" placeholder="Northwind" />
                        </div>
                        <div className="flex-1 flex flex-col gap-2.5">
                            <label className="mono-label" htmlFor="job-title">ROLE</label>
                            <input className="field" type="text" name="job-title" id="job-title" placeholder="Senior Product Designer" />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2.5">
                        <label className="mono-label" htmlFor="job-description">JOB DESCRIPTION</label>
                        <textarea
                            className="field resize-none leading-relaxed"
                            rows={7}
                            name="job-description"
                            id="job-description"
                            maxLength={MAX_DESCRIPTION}
                            onChange={(e) => setDescriptionLength(e.target.value.length)}
                            placeholder="Paste the listing. The more of it the better — keyword matching runs against this text."
                        />
                        <div className="mono-faint">
                            {descriptionLength} / {MAX_DESCRIPTION} CHARACTERS
                        </div>
                    </div>

                    <button className="btn-signal" type="submit" disabled={!file}>
                        {file ? 'RUN SCAN' : 'ADD A RESUME TO RUN'}
                    </button>
                </div>

                <div className="w-full lg:w-[48%] border-t lg:border-t-0 lg:border-l border-hairline px-6 md:px-10 py-11 flex flex-col gap-5.5">
                    <div className="mono-label">RESUME FILE</div>

                    <FileUploader onFileSelect={setFile} />

                    <div className="flex flex-col gap-4 pt-5 border-t border-hairline">
                        <div className="mono-label">WHAT THE SCAN DOES</div>
                        <div className="flex flex-col gap-3">
                            {STEPS.map((label, index) => (
                                <div key={label} className="flex items-center gap-4 font-mono text-[13px] text-faint">
                                    <span className="w-6">0{index + 1}</span>
                                    <span className="tracking-[0.06em]">{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </form>
        </main>
    )
}
export default Upload
