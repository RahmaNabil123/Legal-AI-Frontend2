import { Check, Lightbulb } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export default function KeyFindings({ items }) {
    const { t } = useLanguage();

    if (!items || items.length === 0) return null;

    return (
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120]/80 p-6 sm:p-7 shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-4">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                <p className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                    {t.search.keyFindings.heading}
                </p>
            </div>
            <ul className="mt-5 space-y-3.5">
                {items.map((finding, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                        <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 mt-0.5" aria-hidden="true">
                            <Check className="h-3 w-3" />
                        </span>
                        <span>{finding}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}