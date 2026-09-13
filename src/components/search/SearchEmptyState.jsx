import { Scale } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export default function SearchEmptyState() {
    const { t } = useLanguage();

    return (
        <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-[#0B1120]/60 p-10 text-center backdrop-blur-md">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shadow-[0_0_20px_rgba(37,99,235,0.15)]">
                <Scale className="h-7 w-7" aria-hidden="true" />
            </div>
            <h2 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">
                {t.search.emptyState.title}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {t.search.emptyState.subtitle}
            </p>
        </div>
    );
}