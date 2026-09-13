import { Sparkles, Landmark, ShieldCheck, Languages } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

const ICONS = [Sparkles, Landmark, ShieldCheck, Languages];

export default function TrustStrip() {
    const { t } = useLanguage();

    return (
        <section className="border-y border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#0A0F1D]/80 backdrop-blur-md transition-colors duration-200">
            <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-4 px-6 py-6 sm:grid-cols-4 lg:px-8">
                {t.trust.items.map((label, index) => {
                    const Icon = ICONS[index];
                    return (
                        <div key={label} className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/20 text-blue-600 dark:text-blue-400">
                                <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                            </div>
                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{label}</span>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}