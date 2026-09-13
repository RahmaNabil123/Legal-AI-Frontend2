import { useLanguage } from "../../context/LanguageContext";

export default function HowItWorks() {
    const { t } = useLanguage();

    return (
        <section id="how-it-works" className="relative bg-slate-100/60 dark:bg-[#0A0F1D] px-6 py-24 lg:px-8 border-t border-slate-200 dark:border-white/5 transition-colors duration-300">
            <div className="mx-auto max-w-7xl">
                <div className="max-w-2xl">
                    <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white lg:text-4xl">
                        {t.howItWorks.heading}
                    </h2>
                </div>

                <div className="mt-12 grid gap-8 lg:grid-cols-3">
                    {t.howItWorks.steps.map((step) => (
                        <div
                            key={step.number}
                            className="relative rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0E1528]/80 p-8 shadow-sm hover:shadow-xl backdrop-blur-sm transition-all duration-300 hover:border-purple-500/30"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                                    {step.number}
                                </span>
                                <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
                            </div>
                            <h3 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">{step.title}</h3>
                            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}