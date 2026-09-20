import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Users, UserPlus, ScanLine, Scale } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";

export default function FinalCTA() {
    const { t, lang } = useLanguage();
    const { isAdmin, isManager } = useAuth();

    return (
        <section className="relative overflow-hidden bg-[#F8FAFC] dark:bg-[#070A14] px-6 py-24 text-center lg:px-8 border-t border-slate-200 dark:border-white/5 transition-colors duration-300">
            {/* Background glowing sphere */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-r from-blue-500/15 to-purple-500/15 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative mx-auto max-w-3xl rounded-3xl border border-slate-200 dark:border-white/10 bg-gradient-to-b from-white to-blue-50/40 dark:from-[#0F172A]/80 dark:to-[#070A14]/90 p-10 sm:p-16 backdrop-blur-md shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/30 mb-6">
                    <Sparkles className="h-6 w-6" />
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                    {t.finalCta.heading}
                </h2>
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                    {isAdmin ? (
                        <>
                            <Link
                                to="/users"
                                className="cta-glow-btn inline-flex items-center gap-2 rounded-xl px-8 py-4 text-base font-bold shadow-xl transition-all"
                            >
                                <Users className="h-5 w-5" aria-hidden="true" />
                                <span>{lang === "ar" ? "إدارة المستخدمين" : "User Management"}</span>
                            </Link>
                            <Link
                                to="/users/new"
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 dark:border-white/15 bg-white/80 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 px-8 py-4 text-base font-bold text-slate-900 dark:text-white shadow-xl transition-all"
                            >
                                <UserPlus className="h-5 w-5" aria-hidden="true" />
                                <span>{lang === "ar" ? "إضافة مستخدم جديد" : "Add New User"}</span>
                            </Link>
                        </>
                    ) : isManager ? (
                        <>
                            <Link
                                to="/search"
                                className="cta-glow-btn inline-flex items-center gap-2 rounded-xl px-8 py-4 text-base font-bold shadow-xl transition-all"
                            >
                                <ScanLine className="h-5 w-5" aria-hidden="true" />
                                <span>{lang === "ar" ? "البحث في القوانين" : "Search Precedents"}</span>
                            </Link>
                            <Link
                                to="/opinions"
                                className="inline-flex items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 px-8 py-4 text-base font-bold text-purple-600 dark:text-purple-300 shadow-xl transition-all"
                            >
                                <Scale className="h-5 w-5" aria-hidden="true" />
                                <span>{lang === "ar" ? "الفتاوى القانونية" : "Legal Opinions"}</span>
                            </Link>
                        </>
                    ) : (
                        <Link
                            to="/search"
                            className="cta-glow-btn inline-flex items-center gap-2 rounded-xl px-8 py-4 text-base font-bold shadow-xl transition-all"
                        >
                            <span>{t.finalCta.button}</span>
                            <ArrowRight className="h-5 w-5 rtl:rotate-180" aria-hidden="true" />
                        </Link>
                    )}
                </div>
            </div>
        </section>
    );
}