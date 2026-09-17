// Signal's reading of a score: above 70 it passes, 50-70 needs a revision, below is weak.
export const ACCENT = "#5be9c8";
export const MID = "#ffc65b";
export const FLAG = "#ff8a5b";

export const toneHex = (score: number) =>
    score > 70 ? ACCENT : score > 49 ? MID : FLAG;

export const toneText = (score: number) =>
    score > 70 ? "text-accent" : score > 49 ? "text-mid" : "text-flag";

export const stateWord = (score: number) =>
    score > 70 ? "READY" : score > 49 ? "REVISE" : "WEAK";

const WORDS = [
    "Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight",
    "Nine", "Ten", "Eleven", "Twelve",
];

/** Spelled-out numbers up to twelve — past that the product says the digits. */
export const numberWord = (n: number) => WORDS[n] ?? String(n);

export const median = (values: number[]) => {
    if (!values.length) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2
        ? sorted[mid]
        : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
};

export const scanDate = (iso?: string) => {
    if (!iso) return "—";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "—";
    const [day, month] = date
        .toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
        .toUpperCase()
        .split(" ");
    return `${day} ${month.slice(0, 3)}`;
};

/** "12 SEP 11:04" — the machine's date format. */
export const scanStamp = (iso?: string) => {
    if (!iso) return "—";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "—";
    return `${scanDate(iso)} ${date
        .toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
};

/** The six passes a scan runs, in order — shown live during a scan and in the explainer. */
export const SCAN_STEPS = [
    {
        label: "UPLOAD FILE",
        blurb: "Your PDF is written to your own Puter drive. It never lands on a server of ours.",
    },
    {
        label: "RENDER PAGE IMAGE",
        blurb: "The first page is rendered to an image, so the report can show you what was read.",
    },
    {
        label: "UPLOAD PREVIEW",
        blurb: "That page image is stored next to the PDF, in the same drive.",
    },
    {
        label: "PREPARE SCAN",
        blurb: "The role and the listing you pasted are folded into the instructions for the model.",
    },
    {
        label: "ANALYSE RESUME",
        blurb: "The model reads the resume against that listing and scores it — the slow pass.",
    },
    {
        label: "COMPILE REPORT",
        blurb: "Scores and line edits are parsed into the report you land on.",
    },
] as const;
