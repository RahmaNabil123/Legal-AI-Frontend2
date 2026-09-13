import { Clock, ArrowUpRight, Trash2 } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export default function SearchHistory({ items, onSelect, onClear }) {
    const { t, lang } = useLanguage();
    const isAr = lang === "ar";

    if (!items || items.length === 0) return null;

    // Show only the latest 5 questions
    const displayItems = items.slice(0, 5);

    return (
        <div className="mt-8 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120]/80 p-5 sm:p-6 shadow-sm backdrop-blur-md">
            {/* Header: Title + Clear history button */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
                <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" aria-hidden="true" />
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        {t.search?.history?.heading || (isAr ? "عمليات البحث الأخيرة" : "Recent Searches")}
                    </p>
                </div>
                {onClear && (
                    <button
                        type="button"
                        onClick={onClear}
                        className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                        title={t.search?.history?.clear || (isAr ? "مسح السجل" : "Clear history")}
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>{t.search?.history?.clear || (isAr ? "مسح السجل" : "Clear")}</span>
                    </button>
                )}
            </div>

            {/* List: 5 latest questions directly under each other */}
            <ul className="mt-2 divide-y divide-slate-100 dark:divide-white/5">
                {displayItems.map((item, index) => (
                    <li key={`${item.question}-${index}`}>
                        <button
                            type="button"
                            onClick={() => onSelect(item.question)}
                            className="group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-start text-sm font-medium text-slate-700 dark:text-slate-300 transition-all hover:bg-slate-100 dark:hover:bg-white/5 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                        >
                            <span className="truncate flex-1 pe-3">{item.question}</span>
                            <ArrowUpRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100 rtl:rotate-90 text-blue-500 flex-shrink-0" />
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}