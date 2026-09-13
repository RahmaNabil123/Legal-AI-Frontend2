import { useEffect, useState } from "react";
import { Sparkles, Loader2, RotateCw } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { getSuggestedQuestions } from "../../services/searchApi";

export default function SuggestedQuestions({ onSelect, count = 10 }) {
    const { t, lang } = useLanguage();
    const isAr = lang === "ar";

    const [questions, setQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchQuestions = async (isManual = false) => {
        if (isManual) setIsRefreshing(true);
        else setIsLoading(true);

        try {
            const data = await getSuggestedQuestions(count);
            if (Array.isArray(data)) {
                setQuestions(data);
            }
        } catch {
            // fallback
            setQuestions(t.search?.suggestions?.items || []);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchQuestions(false);
    }, [count]);

    if (!isLoading && questions.length === 0) return null;

    return (
        <div className="mt-6">
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                    <span>{t.search?.suggestions?.heading || (isAr ? "جرّب أن تسأل:" : "Try asking:")}</span>
                    <span className="text-[10px] font-normal text-slate-400">
                        ({questions.length || count} {isAr ? "أسئلة عشوائية" : "random questions"})
                    </span>
                </div>

                {/* Refresh 10 random questions button */}
                <button
                    type="button"
                    onClick={() => fetchQuestions(true)}
                    disabled={isLoading || isRefreshing}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-50"
                    title={isAr ? "تحديث الأسئلة العشوائية" : "Refresh random questions"}
                >
                    <RotateCw className={`h-3 w-3 ${isRefreshing ? "animate-spin text-blue-500" : ""}`} />
                    <span>{isAr ? "أسئلة أخرى" : "Shuffle"}</span>
                </button>
            </div>

            {isLoading ? (
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-400 py-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
                    <span>{isAr ? "جارٍ جلب 10 أسئلة عشوائية من قاعدة البيانات..." : "Loading 10 random questions from database..."}</span>
                </div>
            ) : (
                <div className="mt-3 flex flex-wrap gap-2 sm:gap-2.5">
                    {questions.map((item, idx) => {
                        const qText = typeof item === "string" ? item : item.question;
                        const key = (typeof item === "object" && item.id) ? item.id : `${qText}-${idx}`;

                        return (
                            <button
                                key={key}
                                type="button"
                                onClick={() => onSelect(qText)}
                                className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0E1528] px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 transition-all hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-md hover:scale-[1.01] active:scale-95 text-start cursor-pointer leading-snug"
                            >
                                {qText}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}