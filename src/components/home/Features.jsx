import { Search, BrainCircuit, ShieldCheck, GitBranch } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

const ICONS = [Search, BrainCircuit, ShieldCheck, GitBranch];

export default function Features() {
    const { t } = useLanguage();

    return (
        <section id="features" className="relative bg-[#F8FAFC] dark:bg-[#070A14] px-6 py-24 lg:px-8 overflow-hidden transition-colors duration-300">
            {/* Subtle background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative mx-auto max-w-7xl">
                <div className="max-w-2xl">
                    <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white lg:text-4xl">
                        {t.features.heading}
                    </h2>
                </div>

                <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {t.features.items.map((feature, index) => {
                        const Icon = ICONS[index];
                        return (
                            <div
                                key={feature.title}
                                className="group relative rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120]/80 p-6 shadow-sm hover:shadow-xl backdrop-blur-md transition-all duration-300 hover:border-blue-500/40 hover:-translate-y-1"
                            >
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/15 to-purple-500/15 border border-blue-500/20 text-blue-600 dark:text-blue-400 transition-all duration-300 group-hover:scale-110 group-hover:border-blue-400/40">
                                    <Icon className="h-5 w-5" aria-hidden="true" />
                                </div>
                                <h3 className="mt-5 text-base font-bold text-slate-900 dark:text-white">{feature.title}</h3>
                                <p className="mt-2.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{feature.description}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}