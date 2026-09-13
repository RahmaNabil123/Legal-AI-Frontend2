import { useEffect, useState } from "react";
import { Check, Loader2, Circle } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

const STEP_INTERVAL_MS = 500;

export default function SearchLoading() {
    const { t } = useLanguage();
    const steps = t.search.loading.steps;
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        setActiveIndex(0);
        const timer = setInterval(() => {
            setActiveIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
        }, STEP_INTERVAL_MS);
        return () => clearInterval(timer);
    }, [steps.length]);

    return (
        <div
            role="status"
            aria-live="polite"
            className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120]/80 px-7 py-8 shadow-xl dark:shadow-[0_15px_35px_rgba(0,0,0,0.4)] backdrop-blur-md"
        >
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-4">
                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                <p className="text-sm font-bold text-slate-900 dark:text-white">{t.search.loading.heading}</p>
            </div>
            <ul className="mt-5 space-y-3.5">
                {steps.map((step, index) => {
                    const isDone = index < activeIndex;
                    const isActive = index === activeIndex;

                    return (
                        <li key={step} className="flex items-center gap-3 text-sm">
                            {isDone && (
                                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                    <Check className="h-3 w-3" aria-hidden="true" />
                                </span>
                            )}
                            {isActive && (
                                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-blue-500">
                                    <Loader2 className="h-4 w-4 motion-safe:animate-spin" aria-hidden="true" />
                                </span>
                            )}
                            {!isDone && !isActive && (
                                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-slate-400 dark:text-slate-600">
                                    <Circle className="h-3 w-3" aria-hidden="true" />
                                </span>
                            )}
                            <span className={isDone || isActive ? "font-semibold text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-500"}>
                                {step}
                            </span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}