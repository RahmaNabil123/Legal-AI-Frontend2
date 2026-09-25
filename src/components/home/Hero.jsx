import { Link } from "react-router-dom";
import {
    Sparkles,
    ArrowRight,
    ScanLine,
    FileText,
    FilePlus,
    Users,
    UserPlus,
    Scale,
    CheckCircle2,
    Compass,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import "./Hero.css";

export default function Hero() {
    const { t, lang } = useLanguage();
    const { isAdmin, isManager, isAdvisor, isLawyer } = useAuth();

    return (
        <section className="hero-container relative px-6 pt-12 pb-24 lg:px-12 lg:pt-16 lg:pb-32 text-slate-900 dark:text-white transition-colors duration-300">
            {/* Ambient background particles & golden curve matching reference design */}
            <div className="hero-stars" aria-hidden="true" />
            <div className="hero-gold-arc" aria-hidden="true" />

            <div className="relative mx-auto max-w-7xl">
                {/* Main Hero Header Title matching Reference */}
                <div className="max-w-4xl">
                    <h1 className="flex flex-col gap-2.5 sm:gap-3.5 text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-normal leading-[1.3]">
                        {/* Line 1: Pure White in Dark / Deep Navy in Light */}
                        <span className="text-slate-950 dark:text-white">
                            {t.hero.titleLine1}
                        </span>

                        {/* Line 2: Vibrant Electric Sky Blue */}
                        <span className="bg-gradient-to-r from-blue-600 to-blue-500 dark:from-[#60A5FA] dark:to-[#38BDF8] bg-clip-text text-transparent">
                            {t.hero.titleLine2}
                        </span>

                        {/* Line 3: Vertical Fade Gradient matching reference */}
                        <span className="relative inline-block">
                            <span className="block bg-gradient-to-b from-slate-950 via-slate-800 to-slate-500 dark:from-white dark:via-slate-200 dark:to-slate-400/80 bg-clip-text text-transparent">
                                {t.hero.titleLine3}
                            </span>
                            {/* Gold accent line matching reference */}
                            <span className="block h-1.5 w-28 sm:w-36 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 mt-3" />
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
                        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/15 px-4 py-1.5 text-xs sm:text-sm font-semibold text-blue-700 dark:text-blue-300 shadow-xs">
                            <Sparkles className="h-4 w-4 text-amber-500" aria-hidden="true" />
                            <span>{t.hero.badge}</span>
                        </div>

                        {/* Description */}
                        <p className="text-base sm:text-lg leading-relaxed text-slate-700 dark:text-slate-300 font-normal max-w-lg">
                            {t.hero.subtitle}
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-wrap items-center gap-4 pt-2 w-full sm:w-auto">
                            {isAdmin ? (
                                <>
                                    <Link
                                        to="/users"
                                        className="cta-primary-btn inline-flex items-center justify-center gap-2.5 rounded-full px-7 py-3.5 text-sm font-bold shadow-md hover:shadow-lg transition-all"
                                    >
                                        <Users className="h-4 w-4" aria-hidden="true" />
                                        <span>{lang === "ar" ? "إدارة المستخدمين" : "User Management"}</span>
                                    </Link>
                                    <Link
                                        to="/users/new"
                                        className="cta-secondary-btn inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition-all shadow-xs"
                                    >
                                        <UserPlus className="h-4 w-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                                        <span>{lang === "ar" ? "إضافة مستخدم جديد" : "Add New User"}</span>
                                    </Link>
                                </>
                            ) : isManager ? (
                                <>
                                    <Link
                                        to="/search"
                                        className="cta-primary-btn inline-flex items-center justify-center gap-2.5 rounded-full px-7 py-3.5 text-sm font-bold shadow-md hover:shadow-lg transition-all"
                                    >
                                        <ScanLine className="h-4 w-4" aria-hidden="true" />
                                        <span>{lang === "ar" ? "ابدأ البحث" : "Start Search"}</span>
                                    </Link>
                                    <Link
                                        to="/opinions"
                                        className="cta-secondary-btn inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition-all shadow-xs"
                                    >
                                        <Scale className="h-4 w-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                                        <span>{lang === "ar" ? "الفتاوى القانونية" : "Legal Opinions"}</span>
                                    </Link>
                                </>
                            ) : isAdvisor ? (
                                <>
                                    <Link
                                        to="/search"
                                        className="cta-primary-btn inline-flex items-center justify-center gap-2.5 rounded-full px-7 py-3.5 text-sm font-bold shadow-md hover:shadow-lg transition-all"
                                    >
                                        <ScanLine className="h-4 w-4" aria-hidden="true" />
                                        <span>{lang === "ar" ? "ابدأ البحث" : "Start Search"}</span>
                                        <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
                                    </Link>
                                    <Link
                                        to="/legal-opinion"
                                        className="cta-secondary-btn inline-flex items-center justify-center gap-2.5 rounded-full px-6 py-3.5 text-sm font-semibold transition-all shadow-xs"
                                    >
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 dark:bg-white/10 text-blue-600 dark:text-blue-400">
                                            <FilePlus className="h-3.5 w-3.5" aria-hidden="true" />
                                        </div>
                                        <span>{lang === "ar" ? "صياغة فتوى جديدة" : "Draft New Opinion"}</span>
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/search"
                                        className="cta-primary-btn inline-flex items-center justify-center gap-2.5 rounded-full px-7 py-3.5 text-sm font-bold shadow-md hover:shadow-lg transition-all"
                                    >
                                        <ScanLine className="h-4 w-4" aria-hidden="true" />
                                        <span>{lang === "ar" ? "ابدأ البحث" : "Start Search"}</span>
                                        <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
                                    </Link>

                                    <a
                                        href="#features"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            const elem = document.getElementById("features");
                                            if (elem) {
                                                elem.scrollIntoView({ behavior: "smooth" });
                                            }
                                        }}
                                        className="cta-secondary-btn inline-flex items-center justify-center gap-2.5 rounded-full px-6 py-3.5 text-sm font-semibold transition-all shadow-xs hover:border-blue-400/50"
                                    >
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 dark:bg-white/10 text-blue-600 dark:text-blue-400">
                                            <Compass className="h-3.5 w-3.5" aria-hidden="true" />
                                        </div>
                                        <span>{lang === "ar" ? "اكتشف" : "Discover"}</span>
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
        <div className="isometric-scene w-full max-w-[440px]" aria-hidden="true">
            <div className="isometric-stack">
                {/* Back legal document paper layers */}
                <div className="glass-layer glass-layer-back-3" />
                <div className="glass-layer glass-layer-back-2" />
                <div className="glass-layer glass-layer-back-1" />

                {/* Main Illuminated Center Legal Document */}
                <div className="glass-layer glass-layer-main">
                    <div className="card-ambient-glow" />
                    <div className="card-scan-beam" />

                    {/* Top document header */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/25">
                                    <FileText className="h-4 w-4" />
                                </div>
                                <div className="space-y-1">
                                    <div className="h-2.5 w-24 rounded-full bg-slate-700 dark:bg-white/80" />
                                    <div className="h-2 w-14 rounded-full bg-slate-400 dark:bg-white/40" />
                                </div>
                            </div>
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white shadow-xs">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                            </div>
                        </div>

                        {/* Legal text line skeletons - clearly visible in both light & dark */}
                        <div className="doc-mock-block space-y-2">
                            <div className="doc-line-skeleton w-3/4" />
                            <div className="doc-line-skeleton w-full" />
                            <div className="doc-line-skeleton w-5/6" />
                            <div className="doc-line-skeleton w-2/3" />
                        </div>
                    </div>

                    {/* Bottom sub-card */}
                    <div className="doc-mock-block mt-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1.5">
                                <div className="h-2.5 w-20 rounded-full bg-blue-600 dark:bg-blue-400" />
                                <div className="h-2 w-32 rounded-full bg-slate-400 dark:bg-white/40" />
                            </div>
                            <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
                        </div>
                    </div>

                    {/* Floating Luxury Amber/Gold AI Badge */}
                    <div className="legal-ai-badge">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>{t.hero.tagLegalAI}</span>
                    </div>
                </div>

                {/* Front step layers */}
                <div className="glass-layer glass-layer-front-1" />
                <div className="glass-layer glass-layer-front-2" />
            </div>
        </div>
    );
}