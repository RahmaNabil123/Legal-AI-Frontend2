import Button from "../../components/Button/Button";

export default function ConfirmDialog({ title, message, confirmLabel, cancelLabel, isLoading, onConfirm, onCancel }) {
    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
            <button
                type="button"
                aria-hidden="true"
                tabIndex={-1}
                onClick={onCancel}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="confirm-dialog-title"
                className="relative w-full max-w-sm rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120] text-slate-900 dark:text-white p-6 shadow-2xl backdrop-blur-md"
            >
                <h2 id="confirm-dialog-title" className="text-base font-bold text-slate-900 dark:text-white">
                    {title}
                </h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{message}</p>

                <div className="mt-6 flex justify-end gap-3">
                    <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading} className="w-auto">
                        {cancelLabel}
                    </Button>
                    <Button type="button" variant="danger" onClick={onConfirm} isLoading={isLoading} className="w-auto">
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </div>
    );
}