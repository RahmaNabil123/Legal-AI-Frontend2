import { useNavigate } from "react-router-dom";
import { FileText, Sparkles, ArrowRight, ArrowLeft } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

function getRelevanceTier(relevance, t) {
    if (relevance >= 90) {
        return { label: t.search.precedents.relevanceHigh, badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" };
    }
    if (relevance >= 75) {
        return { label: t.search.precedents.relevanceMed, badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" };
    }
    return { label: t.search.precedents.relevanceLow, badgeClass: "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10" };
}

export default function PrecedentCard({ precedent, onViewCase }) {
    const { t, dir } = useLanguage();
    const navigate = useNavigate();
    const tier = getRelevanceTier(precedent.relevance, t);
    const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;

    const handleViewDocument = () => {
        if (precedent?.id) {
            navigate(`/documents/${precedent.id}`);
        } else if (onViewCase) {
            onViewCase(precedent);
        }
    };

    return (
        <div className="group rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120]/80 p-6 shadow-sm backdrop-blur-md transition-all duration-200 hover:border-blue-500/40 hover:shadow-lg dark:hover:shadow-[0_10px_30px_rgba(37,99,235,0.1)]">
            <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 transition-all group-hover:scale-105">
                    <FileText className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        {precedent.caseNumber}
                    </p>
                    <h3 className="mt-1 text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                        {precedent.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{precedent.court || precedent.category}</p>
                </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className={`rounded-full border px-3 py-0.5 text-xs font-bold ${tier.badgeClass}`}>
                    {precedent.relevance}% {tier.label}
                </span>
                {precedent.citedInAi && (
                    <span className="flex items-center gap-1 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-0.5 text-xs font-semibold text-purple-600 dark:text-purple-400">
                        <Sparkles className="h-3 w-3 text-purple-500" aria-hidden="true" />
                        {t.search.precedents.citedInAi}
                    </span>
                )}
            </div>

            <p className="mt-3.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300 font-normal">
                "{precedent.excerpt}"
            </p>

            <div className="mt-5 border-t border-slate-100 dark:border-white/5 pt-4 flex items-center justify-between">
                <button
                    type="button"
                    onClick={handleViewDocument}
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                    <span>{t.search.precedents.viewCase}</span>
                    <Arrow className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}