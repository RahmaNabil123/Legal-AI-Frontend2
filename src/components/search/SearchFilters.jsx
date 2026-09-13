import { SlidersHorizontal } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export default function SearchFilters() {
    const { t } = useLanguage();

    const filterCategories = [
        { label: t.search.filters.court, options: ["محكمة النقض", "المحكمة الاقتصادية", "محكمة الاستئناف"] },
        { label: t.search.filters.caseType, options: ["نزاعات بنكية", "عقود تجارية", "مسؤولية مدنية"] },
        { label: t.search.filters.year, options: ["2024 - 2026", "2020 - 2023", "سوابق أقدم"] },
    ];

    return (
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120]/80 p-6 shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-4">
                <SlidersHorizontal className="h-4 w-4 text-blue-500" />
                <p className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                    {t.search.filters.heading}
                </p>
            </div>

            <div className="mt-5 space-y-4">
                {filterCategories.map((category) => (
                    <div key={category.label}>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">{category.label}</p>
                        <div className="flex flex-wrap gap-1.5">
                            {category.options.map((opt, i) => (
                                <span
                                    key={opt}
                                    className={`cursor-pointer rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                                        i === 0
                                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                                            : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10"
                                    }`}
                                >
                                    {opt}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <p className="mt-5 border-t border-slate-100 dark:border-white/5 pt-3 text-xs text-slate-400 dark:text-slate-500">
                {t.search.filters.comingSoon}
            </p>
        </div>
    );
}