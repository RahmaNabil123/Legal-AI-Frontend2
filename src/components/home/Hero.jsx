import { Link } from "react-router-dom";
import { Sparkles, Clock, ArrowRight, ScanLine, FileText, Users, UserPlus, Scale } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import "./Hero.css";

export default function Hero() {
    const { t, lang } = useLanguage();
    const { isAdmin, isManager } = useAuth();

    return (
        <section className="hero-container relative px-6 pt-12 pb-24 lg:px-12 lg:pt-16 lg:pb-32 text-slate-900 dark:text-white transition-colors duration-300">
            {/* Ambient background particles & stars */}
            <div className="hero-stars" aria-hidden="true" />

            <div className="relative mx-auto max-w-7xl">
                {/* Main Hero Header Title matching Reference */}
                <div className="max-w-4xl">
                    <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-slate-900 dark:text-white">
                        <span className="block">{t.hero.titleLine1}</span>
                        <span className="block text-blue-600 dark:text-blue-400">{t.hero.titleLine2}</span>
                        <span className="block bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 dark:from-white dark:via-white/80 dark:to-white/40 bg-clip-text text-transparent">
                            {t.hero.titleLine3}
                        </span>
                    </h1>
                </div>

                {/* Grid layout containing 3D Glass Stack on the left and Subtitle/CTAs on the right */}
                <div className="mt-12 grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
                    {/* Left: 3D Isometric Glass Stack */}
                    <div className="lg:col-span-7 flex justify-center lg:justify-start">
                        <Hero3DVisual t={t} />
                    </div>

                    {/* Right: Subtitle, Badge, and Action Buttons */}
                    <div className="lg:col-span-5 flex flex-col items-start space-y-6">
                        {/* "More time for what matters" Badge with Gold & Light Blue accent */}
                        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 dark:bg-blue-500/15 px-4 py-1.5 text-xs sm:text-sm font-semibold text-blue-700 dark:text-blue-300 backdrop-blur-md">
                            <Clock className="h-4 w-4 text-amber-500" aria-hidden="true" />
                            <span>{t.hero.badge}</span>
                        </div>

                        {/* Description */}
                        <p className="text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-300 font-normal max-w-lg">
                            {t.hero.subtitle}
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-wrap items-center gap-4 pt-2 w-full sm:w-auto">
                            {isAdmin ? (
                                <>
                                    <Link
                                        to="/users"
                                        className="cta-glow-btn inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold shadow-lg"
                                    >
                                        <Users className="h-4 w-4" aria-hidden="true" />
                                        <span>{lang === "ar" ? "إدارة المستخدمين" : "User Management"}</span>
                                    </Link>
                                    <Link
                                        to="/users/new"
                                        className="cta-ghost-btn inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-white/10 bg-white/70 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 px-6 py-3.5 text-sm font-semibold text-slate-800 dark:text-white transition-all shadow-sm"
                                    >
                                        <UserPlus className="h-4 w-4" aria-hidden="true" />
                                        <span>{lang === "ar" ? "إضافة مستخدم جديد" : "Add New User"}</span>
                                    </Link>
                                </>
                            ) : isManager ? (
                                <>
                                    <Link
                                        to="/search"
                                        className="cta-glow-btn inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold shadow-lg"
                                    >
                                        <ScanLine className="h-4 w-4" aria-hidden="true" />
                                        <span>{lang === "ar" ? "البحث في القوانين" : "Search Precedents"}</span>
                                    </Link>
                                    <Link
                                        to="/opinions"
                                        className="cta-ghost-btn inline-flex items-center justify-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 px-6 py-3.5 text-sm font-semibold text-purple-700 dark:text-purple-300 transition-all shadow-sm"
                                    >
                                        <Scale className="h-4 w-4" aria-hidden="true" />
                                        <span>{lang === "ar" ? "الفتاوى القانونية" : "Legal Opinions"}</span>
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/search"
                                        className="cta-glow-btn inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold shadow-lg"
                                    >
                                        <ScanLine className="h-4 w-4" aria-hidden="true" />
                                        <span>{t.hero.ctaPrimary}</span>
                                    </Link>

                                    <a
                                        href="#features"
                                        className="cta-ghost-btn inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-white/10 bg-white/70 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 px-6 py-3.5 text-sm font-semibold text-slate-800 dark:text-white transition-all shadow-sm"
                                    >
                                        <span>{t.hero.ctaSecondary}</span>
                                        <ArrowRight className="h-4 w-4 rtl:rotate-180 text-slate-500 dark:text-slate-400" aria-hidden="true" />
                                    </a>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function Hero3DVisual({ t }) {
    return (
        <div className="isometric-scene w-full max-w-[420px]" aria-hidden="true">
            <div className="isometric-stack">
                {/* Back glass cards receding in perspective */}
                <div className="glass-layer glass-layer-back-3" />
                <div className="glass-layer glass-layer-back-2" />
                <div className="glass-layer glass-layer-back-1" />

                {/* Main Illuminated Center Glass Card */}
                <div className="glass-layer glass-layer-main">
                    <div className="card-ambient-glow" />
                    <div className="card-scan-beam" />

                    {/* Top simulated card content */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <div className="flex items-center gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400 border border-blue-400/30">
                                    <FileText className="h-4 w-4" />
                                </div>
                                <div>
                                    <div className="h-2 w-20 rounded bg-white/70" />
                                    <div className="mt-1 h-1.5 w-12 rounded bg-white/30" />
                                </div>
                            </div>
                            <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                        </div>

                        {/* Mock doc details */}
                        <div className="doc-mock-block">
                            <div className="doc-line-skeleton w-3/4" />
                            <div className="doc-line-skeleton w-full" />
                            <div className="doc-line-skeleton w-1/2" />
                        </div>
                    </div>

                    {/* Bottom sub-card */}
                    <div className="doc-mock-block mt-4 bg-white/5 border-white/10">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1.5">
                                <div className="h-2 w-16 rounded bg-purple-300/80" />
                                <div className="h-1.5 w-28 rounded bg-white/30" />
                            </div>
                            <Sparkles className="h-4 w-4 text-purple-300 animate-pulse" />
                        </div>
                    </div>

                    {/* Glowing floating cursor badge "Legal AI" */}
                    <div className="legal-ai-badge">
                        <span>{t.hero.tagLegalAI}</span>
                    </div>
                </div>

                {/* Front transparent step cards */}
                <div className="glass-layer glass-layer-front-1" />
                <div className="glass-layer glass-layer-front-2" />
            </div>
        </div>
    );
}