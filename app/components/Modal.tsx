import type { ReactNode } from "react";

/** A dialog on the void: label bar up top, backdrop click or the caller's own control closes it. */
const Modal = ({
    label,
    meta,
    onClose,
    className = "max-w-[520px]",
    children,
}: {
    label: string;
    meta?: ReactNode;
    onClose: () => void;
    className?: string;
    children: ReactNode;
}) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <div className="absolute inset-0 bg-void/70" onClick={onClose} />
            <div
                role="dialog"
                aria-modal="true"
                aria-label={label}
                className={`relative w-full ${className} border border-edge bg-panel max-h-[85vh] overflow-y-auto`}
            >
                <div className="flex justify-between items-center px-6 py-4 border-b border-hairline mono-label">
                    <span>{label}</span>
                    {meta && <span className="text-accent">{meta}</span>}
                </div>
                {children}
            </div>
        </div>
    );
};

export default Modal;
