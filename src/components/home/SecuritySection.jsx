import { KeyRound, Lock, FileClock, ShieldCheck, Route as RouteIcon } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

const ICONS = [KeyRound, Lock, FileClock, ShieldCheck, RouteIcon];

export default function SecuritySection() {
    const { t } = useLanguage();

    return (
        <section id="security" className="relative bg-[#F8FAFC] dark:bg-[#070A14] px-6 py-24 text-slate-900 dark:text-white lg:px-8 border-t border-slate-200 dark:border-white/5 transition-colors duration-300">
            <div className="mx-auto max-w-7xl">
                <div className="max-w-2xl">
                    <h2 className="text-3xl font-extrabold tracking-tight lg:text-4xl text-slate-900 dark:text-white">
                        {t.security.heading}
                    </h2>
                </div>

                <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
                    {t.security.items.map((label, index) => {
                        const Icon = ICONS[index];
                        return (
                            <div
                                key={label}
                                className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120]/60 p-6 shadow-sm hover:shadow-md backdrop-blur-sm transition-all hover:border-blue-400/30"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                    <Icon className="h-5 w-5" aria-hidden="true" />
                                </div>
                                <p className="mt-4 text-sm font-bold text-slate-800 dark:text-slate-200">{label}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}