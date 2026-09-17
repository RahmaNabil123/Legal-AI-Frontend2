import Button from "../../components/Button/Button";
import { AlertTriangle } from "lucide-react";

export default function ConfirmDialog({ title, message, confirmLabel, cancelLabel, isLoading, onConfirm, onCancel }) {
    return (
        <div className="fixed inset-0 z-[70] flex min-h-screen items-center justify-center px-4 py-6">
            <button
                type="button"
                aria-hidden="true"
                tabIndex={-1}
                onClick={onCancel}
                className="absolute inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity"
            />

            <div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="confirm-dialog-title"
                aria-describedby="confirm-dialog-message"
                className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-7 text-center text-slate-900 shadow-[0_25px_80px_rgba(15,23,42,0.3)] dark:border-white/10 dark:bg-[#0B1120] dark:text-white dark:shadow-[0_25px_80px_rgba(0,0,0,0.55)]"
            >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/25 bg-red-500/10 text-red-500 shadow-sm">
                    <AlertTriangle className="h-7 w-7" aria-hidden="true" />
                </div>
                <h2 id="confirm-dialog-title" className="mt-5 text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    {title}
                </h2>
                <p id="confirm-dialog-message" className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
                    {message}
                </p>

                <div className="mt-7 grid grid-cols-2 gap-3">
                    <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
                        {cancelLabel}
                    </Button>
                    <Button type="button" variant="danger" onClick={onConfirm} isLoading={isLoading}>
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </div>
    );
}