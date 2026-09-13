import { useEffect } from "react";
import { X, FileText, Calendar, Building, Scale, Sparkles } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export default function CaseDetailsDrawer({ precedent, onClose }) {
    const { t } = useLanguage();
    const isOpen = !!precedent;

    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex justify-end">
            {/* Backdrop */}
            <button
                type="button"
                aria-label={t.search.drawer.close}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            />

            <div
                role="dialog"
                aria-modal="true"
                aria-label={t.search.drawer.heading}
                className="relative flex h-full w-full max-w-lg flex-col overflow-y-auto border-s border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120] text-slate-900 dark:text-white shadow-2xl transition-all"
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 px-6 py-5">
                    <div className="flex items-center gap-2">
                        <Scale className="h-5 w-5 text-blue-500" />
                        <p className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                            {t.search.drawer.heading}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label={t.search.drawer.close}
                        className="rounded-xl border border-slate-200 dark:border-white/10 p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white"
                    >
                        <X className="h-5 w-5" aria-hidden="true" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-6 px-6 py-6">
                    <div>
                        <span className="inline-block rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                            {precedent.caseNumber}
                        </span>
                        <h2 className="mt-3 text-xl font-bold text-slate-900 dark:text-white leading-tight">
                            {precedent.title}
                        </h2>
                    </div>

                    <dl className="grid grid-cols-2 gap-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4 text-sm">
                        <div className="flex items-start gap-2.5">
                            <Building className="h-4 w-4 text-slate-400 mt-0.5" />
                            <div>
                                <dt className="text-xs text-slate-500 dark:text-slate-400">{t.search.drawer.court}</dt>
                                <dd className="mt-0.5 font-bold text-slate-900 dark:text-white">{precedent.court}</dd>
                            </div>
                        </div>
                        <div className="flex items-start gap-2.5">
                            <Calendar className="h-4 w-4 text-slate-400 mt-0.5" />
                            <div>
                                <dt className="text-xs text-slate-500 dark:text-slate-400">{t.search.drawer.year}</dt>
                                <dd className="mt-0.5 font-bold text-slate-900 dark:text-white">{precedent.year}</dd>
                            </div>
                        </div>
                    </dl>

                    <div className="space-y-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            {t.search.drawer.keyLegalIssue}
                        </h3>
                        <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4 font-medium">
                            {precedent.issue}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            {t.search.drawer.holding}
                        </h3>
                        <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4">
                            {precedent.holding}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            {t.search.drawer.summary}
                        </h3>
                        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                            {precedent.summary}
                        </p>
                    </div>
                </div>

                {/* Footer action */}
                <div className="border-t border-slate-200 dark:border-white/10 p-6 bg-slate-50 dark:bg-[#070A14]">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-500"
                    >
                        {t.search.drawer.close}
                    </button>
                </div>
            </div>
        </div>
    );
}