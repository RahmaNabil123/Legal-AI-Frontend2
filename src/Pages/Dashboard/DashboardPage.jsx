import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Scale,
    Sparkles,
    FileText,
    CheckCircle2,
    Clock,
    Search,
    FilePlus,
    Users,
    TrendingUp,
    ShieldCheck,
    ArrowUpRight,
    Landmark,
    AlertCircle,
    ChevronRight,
    Activity,
    BookOpen,
    Shield,
    UserCheck,
    UserX,
    FolderOpen,
} from "lucide-react";
import Navbar from "../../components/home/Navbar";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { getMyOpinions, getPendingOpinions } from "../../services/opinionApi";
import { getUsers } from "../../services/userApi";

export default function DashboardPage() {
    const { lang, dir } = useLanguage();
    const { user, role, isAdvisor, isManager, isLawyer, isAdmin } = useAuth();
    const navigate = useNavigate();

    const isAr = lang === "ar";

    const userName = user?.firstName
        ? `${user.firstName} ${user.lastName || ""}`.trim()
        : isAr
        ? "المستشار القانوني"
        : "Legal Counsel";

    // Search bar shortcut state
    const [searchQuery, setSearchQuery] = useState("");

    // Role-specific live data states
    const [advisorOpinions, setAdvisorOpinions] = useState([]);
    const [pendingReviewsCount, setPendingReviewsCount] = useState(0);
    const [pendingOpinionsList, setPendingOpinionsList] = useState([]);
    const [adminUserStats, setAdminUserStats] = useState({
        total: 12,
        active: 10,
        blocked: 2,
        totalDocs: 14820,
    });
    const [isLoadingData, setIsLoadingData] = useState(false);

    // Fetch role-specific widget data
    useEffect(() => {
        let isMounted = true;
        async function fetchWidgetData() {
            setIsLoadingData(true);
            try {
                if (isAdvisor) {
                    const data = await getMyOpinions();
                    if (isMounted && data) {
                        setAdvisorOpinions(data);
                    }
                } else if (isManager) {
                    const pending = await getPendingOpinions();
                    if (isMounted && pending) {
                        setPendingReviewsCount(pending.length);
                        setPendingOpinionsList(pending.slice(0, 4));
                    }
                } else if (isAdmin) {
                    const users = await getUsers();
                    if (isMounted && users) {
                        const total = users.length;
                        const active = users.filter((u) => u.isActive).length;
                        const blocked = total - active;
                        setAdminUserStats({
                            total,
                            active,
                            blocked,
                            totalDocs: 14820,
                        });
                    }
                }
            } catch {
                // Keep default state gracefully
            } finally {
                if (isMounted) setIsLoadingData(false);
            }
        }
        fetchWidgetData();
        return () => {
            isMounted = false;
        };
    }, [isAdvisor, isManager, isAdmin]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    };

    // Recently viewed / relevant judicial documents (for Lawyer & Legal Advisor)
    const recentDocuments = [
        {
            id: 1,
            title: isAr
                ? "طعن نقض رقم 4182 لسنة 88 ق - شروط الفسخ الرضائي للاعتمادات المستندية"
                : "Cassation Appeal No. 4182/88Q - Letters of Credit Cancellation",
            court: isAr ? "محكمة النقض - الدائرة التجارية" : "Court of Cassation - Commercial Circuit",
            year: "2024",
            tag: isAr ? "اعتمادات مستندية" : "Letters of Credit",
        },
        {
            id: 2,
            title: isAr
                ? "حكم المحكمة الاقتصادية العليا - بطلان الفوائد المركبة في القروض المصرفية"
                : "High Economic Court - Nullity of Compound Interest in Bank Loans",
            court: isAr ? "المحكمة الاقتصادية العليا" : "High Economic Court",
            year: "2023",
            tag: isAr ? "فوائد وتسهيلات" : "Interest & Loans",
        },
        {
            id: 3,
            title: isAr
                ? "طعن رقم 7120 لسنة 85 ق - مدى مسؤولية البنك عن التزوير في الشيكات المسحوبة"
                : "Appeal No. 7120/85Q - Bank Liability in Check Forgery Cases",
            court: isAr ? "محكمة النقض المصرية" : "Egyptian Court of Cassation",
            year: "2023",
            tag: isAr ? "شيكات مصرفية" : "Bank Checks",
        },
    ];

    const getStatusBadge = (status) => {
        if (status === "Approved" || status === 2) {
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-bold text-emerald-500">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{isAr ? "معتمد" : "Approved"}</span>
                </span>
            );
        }
        if (status === "RevisionRequired" || status === 4) {
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-xs font-bold text-amber-500">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>{isAr ? "مطلوب تعديل" : "Revision Required"}</span>
                </span>
            );
        }
        if (status === "Rejected" || status === 3) {
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 border border-red-500/30 px-2.5 py-0.5 text-xs font-bold text-red-500">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>{isAr ? "مرفوض" : "Rejected"}</span>
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/15 border border-blue-500/30 px-2.5 py-0.5 text-xs font-bold text-blue-500">
                <Clock className="h-3.5 w-3.5" />
                <span>{isAr ? "قيد المراجعة" : "Submitted"}</span>
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#070A14] text-slate-900 dark:text-white transition-colors duration-200">
            <Navbar />

            <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8 space-y-10">
                {/* 1. Welcome Header Banner */}
                <div className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-r from-blue-900/40 via-[#0B1120] to-purple-900/30 p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
                    <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="rounded-full bg-blue-500/20 px-3.5 py-1 text-xs font-extrabold text-blue-400 border border-blue-500/30">
                                    {role}
                                </span>
                                <span className="text-xs text-slate-400 font-semibold">
                                    {isAr ? "القطاع القانوني وإدارة المخاطر" : "Banking Legal Intelligence"}
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                                {isAr ? `أهلاً بك، ${userName}` : `Welcome back, ${userName}`}
                            </h1>
                            <p className="mt-2 text-sm text-slate-300 max-w-2xl leading-relaxed">
                                {isAr
                                    ? "لوحة العمل المخصصة لدورك الوظيفي. يمكنك الوصول الفوري لمحرك البحث، ومتابعة الفتاوى وإدارة المنظومة."
                                    : "Your personalized legal intelligence workspace based on your allocated bank role."}
                            </p>
                        </div>

                        {/* Direct Shortcuts */}
                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                type="button"
                                onClick={() => navigate("/search")}
                                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-500 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-blue-600/30 transition-all hover:scale-105 active:scale-95"
                            >
                                <Search className="h-4 w-4" />
                                <span>{isAr ? "محرك البحث الذكي" : "Semantic Search"}</span>
                            </button>

                            {isAdvisor && (
                                <button
                                    type="button"
                                    onClick={() => navigate("/legal-opinion")}
                                    className="inline-flex items-center gap-2 rounded-2xl border border-purple-500/30 bg-purple-500/20 hover:bg-purple-500/30 px-5 py-3 text-xs font-bold text-purple-300 transition-all hover:scale-105 active:scale-95"
                                >
                                    <FilePlus className="h-4 w-4" />
                                    <span>{isAr ? "صياغة ورفع فتوى جديدة" : "Draft / Upload Opinion"}</span>
                                </button>
                            )}

                            {isManager && (
                                <button
                                    type="button"
                                    onClick={() => navigate("/review-queue")}
                                    className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/20 hover:bg-emerald-500/30 px-5 py-3 text-xs font-bold text-emerald-300 transition-all hover:scale-105 active:scale-95"
                                >
                                    <CheckCircle2 className="h-4 w-4" />
                                    <span>{isAr ? "قائمة المراجعة" : "Review Queue"}</span>
                                </button>
                            )}

                            {isAdmin && (
                                <button
                                    type="button"
                                    onClick={() => navigate("/users")}
                                    className="inline-flex items-center gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/20 hover:bg-amber-500/30 px-5 py-3 text-xs font-bold text-amber-300 transition-all hover:scale-105 active:scale-95"
                                >
                                    <Users className="h-4 w-4" />
                                    <span>{isAr ? "إدارة المستخدمين" : "User Management"}</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. SPECIFICATION ROLE 1 & 2: Lawyer / Legal Advisor Semantic Search Bar Shortcut & Recent Documents */}
                {(isLawyer || isAdvisor) && (
                    <section className="space-y-6">
                        {/* Search Bar Shortcut */}
                        <div className="rounded-3xl border border-blue-500/30 bg-white dark:bg-[#0B1120]/90 p-6 sm:p-8 shadow-xl backdrop-blur-md">
                            <div className="flex items-center gap-2 mb-3">
                                <Sparkles className="h-5 w-5 text-blue-500" />
                                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                                    {isAr
                                        ? "البحث الدلالي السريع في السوابق القضائية (Semantic Search Shortcut)"
                                        : "Semantic Precedent Search Shortcut"}
                                </h2>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                                {isAr
                                    ? "ابحث باللغة الطبيعية عن أسانيد أحكام النقض والمحاكم الاقتصادية والفتاوى البنكية."
                                    : "Enter your legal question or case citation to search verified precedents instantly."}
                            </p>

                            <form onSubmit={handleSearchSubmit} className="flex gap-3">
                                <div className="relative flex-1">
                                    <Search className="absolute start-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder={
                                            isAr
                                                ? "اكتب استفسارك القضائي أو رقم الطعن هنا… (مثال: شروط مصادرة خطاب الضمان)"
                                                : "Search legal precedent or case law… e.g. Letter of guarantee disputes"
                                        }
                                        className="w-full rounded-2xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-white/5 ps-12 pe-4 py-3.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none transition-colors"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="rounded-2xl bg-blue-600 hover:bg-blue-500 px-6 py-3.5 text-xs font-bold text-white shadow-md transition-all hover:scale-105 active:scale-95"
                                >
                                    {isAr ? "بحث فوري" : "Search"}
                                </button>
                            </form>

                            {/* Quick Tags */}
                            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                                <span className="text-slate-400 text-[11px] font-semibold">
                                    {isAr ? "سوابق شائعة:" : "Quick topics:"}
                                </span>
                                {[
                                    { label: isAr ? "خطابات الضمان" : "Letters of Guarantee", q: "خطابات الضمان" },
                                    { label: isAr ? "فوائد القروض" : "Loan Interests", q: "فوائد القروض المصرفية" },
                                    { label: isAr ? "الاعتمادات المستندية" : "Letters of Credit", q: "الاعتمادات المستندية" },
                                    { label: isAr ? "الشيك بدون رصيد" : "Bounced Checks", q: "الشيكات المصرفية" },
                                ].map((topic, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => navigate(`/search?q=${encodeURIComponent(topic.q)}`)}
                                        className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:border-blue-500/40 hover:text-blue-500 transition-all"
                                    >
                                        {topic.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* List of Recently Viewed or Relevant Documents */}
                        <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120]/80 p-6 sm:p-8 shadow-xl backdrop-blur-md">
                            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4 mb-6">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-blue-500" />
                                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                                        {isAr ? "الأحكام والسوابق القضائية ذات الصلة" : "Recently Viewed & Relevant Documents"}
                                    </h2>
                                </div>
                                <Link
                                    to="/search"
                                    className="text-xs font-bold text-blue-500 hover:underline inline-flex items-center gap-1"
                                >
                                    <span>{isAr ? "عرض محرك البحث الكامل" : "Explore All"}</span>
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </Link>
                            </div>

                            <div className="space-y-3">
                                {recentDocuments.map((doc) => (
                                    <div
                                        key={doc.id}
                                        onClick={() => navigate("/search")}
                                        className="cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200/80 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] p-4 transition-all hover:bg-blue-500/5 hover:border-blue-500/30"
                                    >
                                        <div>
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <span className="rounded-md bg-blue-500/10 border border-blue-500/25 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                                                    {doc.tag}
                                                </span>
                                                <span className="text-[11px] text-slate-400 font-semibold">{doc.year}</span>
                                            </div>
                                            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                                {doc.title}
                                            </h3>
                                            <p className="text-[11px] text-slate-400 mt-1">{doc.court}</p>
                                        </div>

                                        <div className="flex items-center gap-2 text-xs font-bold text-blue-500 self-end sm:self-center">
                                            <span>{isAr ? "مطالعة السابقة" : "View"}</span>
                                            <ArrowUpRight className="h-4 w-4" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* 3. SPECIFICATION ROLE 2: Legal Advisor Widget showing draft/submitted opinions & their status */}
                {isAdvisor && (
                    <section className="rounded-3xl border border-purple-500/30 bg-white dark:bg-[#0B1120]/80 p-6 sm:p-8 shadow-xl backdrop-blur-md">
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4 mb-6">
                            <div>
                                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <BookOpen className="h-5 w-5 text-purple-500" />
                                    <span>{isAr ? "متابعة آرائي القانونية وحالتها (My Opinions Status Widget)" : "My Draft & Submitted Opinions"}</span>
                                </h2>
                                <p className="text-xs text-slate-400 mt-1">
                                    {isAr ? "حالة الفتاوى التي قمت بصياغتها وقرارات الاعتماد الصادرة عليها" : "Track status of your authored opinions"}
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => navigate("/legal-opinion")}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 px-3.5 py-2 text-xs font-bold text-white transition-all shadow-md"
                                >
                                    <FilePlus className="h-3.5 w-3.5" />
                                    <span>{isAr ? "صياغة رأي جديد" : "Draft New"}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate("/my-opinions")}
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 px-3.5 py-2 text-xs font-bold text-purple-400 transition-all"
                                >
                                    <FolderOpen className="h-3.5 w-3.5" />
                                    <span>{isAr ? "أرشيف فتاواي الكامل" : "View Archive"}</span>
                                </button>
                            </div>
                        </div>

                        {/* Opinions List Preview */}
                        <div className="space-y-3">
                            {advisorOpinions.length === 0 ? (
                                <div className="text-center py-8 text-xs text-slate-400">
                                    {isAr ? "لم تقم بصياغة أي فتاوى بعد. ابدأ بصياغة أول رأي قانوني." : "No legal opinions drafted yet."}
                                </div>
                            ) : (
                                advisorOpinions.slice(0, 4).map((op) => (
                                    <div
                                        key={op.id}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200/80 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] p-4"
                                    >
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                {getStatusBadge(op.status)}
                                                <span className="text-[11px] text-slate-400">#{op.id}</span>
                                            </div>
                                            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                                {op.title}
                                            </h3>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => navigate("/my-opinions")}
                                            className="text-xs font-bold text-purple-500 hover:underline self-end sm:self-center"
                                        >
                                            {isAr ? "تفاصيل الفتوى" : "Details"}
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                )}

                {/* 4. SPECIFICATION ROLE 3: Legal Manager Widget showing count of opinions awaiting review with shortcut */}
                {isManager && (
                    <section className="rounded-3xl border border-emerald-500/30 bg-white dark:bg-[#0B1120]/80 p-6 sm:p-8 shadow-xl backdrop-blur-md space-y-6">
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
                            <div>
                                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <ShieldCheck className="h-5 w-5 text-emerald-500" />
                                    <span>{isAr ? "فحص واعتماد الفتاوى (Opinions Awaiting Manager Review)" : "Opinions Awaiting Manager Review"}</span>
                                </h2>
                                <p className="text-xs text-slate-400 mt-1">
                                    {isAr ? "الفتاوى القانونية المصاغة من المستشارين وتنتظر موافقتك للاعتماد في الـ AI" : "Advisor opinions pending approval"}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => navigate("/review-queue")}
                                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 transition-all hover:scale-105 active:scale-95"
                            >
                                <CheckCircle2 className="h-4 w-4" />
                                <span>{isAr ? "فتح قائمة المراجعة (Review Queue)" : "Open Review Queue"}</span>
                            </button>
                        </div>

                        {/* Highlight Count Widget */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                        {isAr ? "فتاوى تنتظر قرارك الآن" : "Awaiting Your Decision"}
                                    </span>
                                    <Clock className="h-5 w-5 text-emerald-500" />
                                </div>
                                <p className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white">
                                    {pendingReviewsCount}
                                </p>
                                <p className="text-[11px] text-slate-400 mt-1">
                                    {isAr ? "تتطلب الموافقة أو الرفض أو التعديل" : "Requires Manager Decision"}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-5">
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                    {isAr ? "فتاوى معتمدة في الـ AI" : "Indexed in Legal AI"}
                                </span>
                                <p className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white">
                                    412
                                </p>
                                <p className="text-[11px] text-emerald-500 font-bold mt-1">
                                    {isAr ? "أسانيد قضائية نشطة" : "Active Certified Precedents"}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-5">
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                    {isAr ? "إجمالي آراء هذا الشهر" : "Total Submissions This Month"}
                                </span>
                                <p className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white">
                                    58
                                </p>
                                <p className="text-[11px] text-slate-400 mt-1">
                                    {isAr ? "من كافة المستشارين" : "Across Bank Legal Team"}
                                </p>
                            </div>
                        </div>

                        {/* Pending Opinions Preview */}
                        <div className="space-y-3 pt-2">
                            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                {isAr ? "أحدث الفتاوى في قائمة المراجعة:" : "Latest Pending Submissions:"}
                            </h3>
                            {pendingOpinionsList.length === 0 ? (
                                <p className="text-xs text-slate-400 py-4 text-center">
                                    {isAr ? "لا توجد فتاوى معلقة للمراجعة حالياً." : "No pending opinions awaiting review."}
                                </p>
                            ) : (
                                pendingOpinionsList.map((op) => (
                                    <div
                                        key={op.id}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200/80 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] p-4"
                                    >
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="rounded-md bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-500">
                                                    {isAr ? "بانتظار الاعتماد" : "Pending Review"}
                                                </span>
                                                <span className="text-[11px] text-slate-400">
                                                    {isAr ? `بواسطة: ${op.createdByName || "المستشار"}` : `By: ${op.createdByName || "Advisor"}`}
                                                </span>
                                            </div>
                                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                                {op.title}
                                            </h4>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => navigate(`/review-opinion/${op.id}`)}
                                            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-500 hover:underline self-end sm:self-center"
                                        >
                                            <span>{isAr ? "فحص واعتماد" : "Review"}</span>
                                            <ArrowUpRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                )}

                {/* 5. SPECIFICATION ROLE 4: System Administrator Widget (high-level counts: total users, total documents + shortcuts) */}
                {isAdmin && (
                    <section className="rounded-3xl border border-amber-500/30 bg-white dark:bg-[#0B1120]/80 p-6 sm:p-8 shadow-xl backdrop-blur-md space-y-6">
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
                            <div>
                                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-amber-500" />
                                    <span>{isAr ? "إحصائيات المنظومة والرقابة (System Governance Widget)" : "System Administrator Overview"}</span>
                                </h2>
                                <p className="text-xs text-slate-400 mt-1">
                                    {isAr ? "التحكم في حسابات المستشارين والمحامين وتدقيق نشاطات النظام" : "Total user counts and administrative governance"}
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => navigate("/users/new")}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 px-3.5 py-2 text-xs font-bold text-white transition-all shadow-md"
                                >
                                    <Users className="h-3.5 w-3.5" />
                                    <span>{isAr ? "إضافة مستخدم جديد" : "Add User"}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate("/users")}
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 px-3.5 py-2 text-xs font-bold text-amber-400 transition-all"
                                >
                                    <span>{isAr ? "إدارة المستخدمين" : "User Management"}</span>
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>

                        {/* High-Level Counts: Total Users & Total Documents */}
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                                        {isAr ? "إجمالي المستخدمين المسجلين" : "Total Users"}
                                    </span>
                                    <Users className="h-5 w-5 text-blue-500" />
                                </div>
                                <p className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white">
                                    {adminUserStats.total}
                                </p>
                                <p className="text-[11px] text-slate-400 mt-1">
                                    {isAr ? "حسابات أعضاء البنك" : "Bank Staff Accounts"}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                        {isAr ? "حسابات نشطة ومفعلة" : "Active Users"}
                                    </span>
                                    <UserCheck className="h-5 w-5 text-emerald-500" />
                                </div>
                                <p className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white">
                                    {adminUserStats.active}
                                </p>
                                <p className="text-[11px] text-emerald-500 font-bold mt-1">
                                    {isAr ? "صلاحيات سارية" : "Authorized & Active"}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-red-600 dark:text-red-400">
                                        {isAr ? "حسابات معطلة أو محظورة" : "Blocked Accounts"}
                                    </span>
                                    <UserX className="h-5 w-5 text-red-500" />
                                </div>
                                <p className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white">
                                    {adminUserStats.blocked}
                                </p>
                                <p className="text-[11px] text-red-500 font-bold mt-1">
                                    {isAr ? "محظور من الدخول" : "Access Blocked"}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-5">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                                        {isAr ? "إجمالي المستندات المفهرسة" : "Total Documents"}
                                    </span>
                                    <FileText className="h-5 w-5 text-purple-500" />
                                </div>
                                <p className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white">
                                    {adminUserStats.totalDocs.toLocaleString()}
                                </p>
                                <p className="text-[11px] text-slate-400 mt-1">
                                    {isAr ? "أحكام وسوابق قضائية" : "Judicial Precedents"}
                                </p>
                            </div>
                        </div>

                        {/* Direct Shortcuts into User Management & Audit Logs */}
                        <div className="pt-2 flex flex-wrap items-center gap-3">
                            <button
                                type="button"
                                onClick={() => navigate("/users")}
                                className="inline-flex items-center gap-2 rounded-2xl bg-amber-600 hover:bg-amber-500 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-amber-600/30 transition-all hover:scale-105 active:scale-95"
                            >
                                <Users className="h-4 w-4" />
                                <span>{isAr ? "الانتقال لإدارة وتفعيل المستخدمين" : "Go to User Management"}</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate("/users/new")}
                                className="inline-flex items-center gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 px-5 py-3 text-xs font-bold text-amber-400 transition-all"
                            >
                                <FilePlus className="h-4 w-4" />
                                <span>{isAr ? "إنشاء حساب مستخدم جديد" : "Create New User"}</span>
                            </button>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}
