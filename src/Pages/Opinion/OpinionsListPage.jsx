import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    BookOpen,
    Plus,
    Search,
    CheckCircle2,
    Clock,
    XCircle,
    AlertTriangle,
    Eye,
    User,
    Paperclip,
    Loader2,
    HelpCircle,
} from "lucide-react";
import Navbar from "../../components/home/Navbar";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { getMyOpinions, getAllOpinions } from "../../services/opinionApi";
import Alert from "../../components/Alert/Alert";

export default function OpinionsListPage() {
    const { lang, dir } = useLanguage();
    const { isManager, isAdvisor } = useAuth();
    const navigate = useNavigate();

    const isAr = lang === "ar";
    const isRtl = dir === "rtl";

    const [opinions, setOpinions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [searchQuery, setSearchQuery] = useState("");
    const [actionError, setActionError] = useState("");

    // Data fetching depending on Role:
    // Advisor -> GET /api/LegalOpinion/Legal-Advisor-Opinions
    // Manager -> GET /api/LegalOpinion (All system opinions)
    const loadOpinions = useCallback(async () => {
        setIsLoading(true);
        setActionError("");
        try {
            const fetchFn = isManager ? getAllOpinions : getMyOpinions;
            const data = await fetchFn({ status: statusFilter, search: searchQuery });
            setOpinions(data || []);
        } catch {
            setActionError(isAr ? "تعذر تحميل قائمة الفتاوى القانونية من الخادم." : "Failed to load opinions from server.");
        } finally {
            setIsLoading(false);
        }
    }, [isManager, statusFilter, searchQuery, isAr]);

    useEffect(() => {
        loadOpinions();
    }, [loadOpinions]);

    // Status Badges (1: Submitted, 2: Approved, 3: Rejected, 4: RevisionRequired)
    const renderStatusBadge = (status, statusCode) => {
        const code = Number(statusCode) || (status === "Approved" ? 2 : status === "Rejected" ? 3 : status === "RevisionRequired" ? 4 : 1);

        if (code === 2 || status === "Approved") {
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{isAr ? "معتمد ومفهرس" : "Approved"}</span>
                </span>
            );
        }
        if (code === 3 || status === "Rejected") {
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 border border-red-500/30 px-3 py-1 text-xs font-bold text-red-600 dark:text-red-400">
                    <XCircle className="h-3.5 w-3.5" />
                    <span>{isAr ? "مرفوض" : "Rejected"}</span>
                </span>
            );
        }
        if (code === 4 || status === "RevisionRequired") {
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 px-3 py-1 text-xs font-bold text-purple-600 dark:text-purple-400">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>{isAr ? "يتطلب تعديل" : "Revision Required"}</span>
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                <Clock className="h-3.5 w-3.5" />
                <span>{isAr ? "قيد المراجعة" : "Pending Review"}</span>
            </span>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString(isAr ? "ar-EG" : "en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        } catch {
            return dateString;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#070A14] text-slate-900 dark:text-white transition-colors duration-200">
            <Navbar />

            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
                {/* Header Banner */}
                <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120]/90 p-6 sm:p-8 shadow-xl dark:shadow-[0_15px_35px_rgba(0,0,0,0.4)] backdrop-blur-md mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600/15 text-blue-500 border border-blue-500/30">
                                <BookOpen className="h-7 w-7" />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                                    {isManager
                                        ? isAr
                                            ? "فتاوى المنظومة القانونية وقائمة المراجعة"
                                            : "System Legal Opinions & Review Queue"
                                        : isAr
                                        ? "فتاواي القانونية"
                                        : "My Legal Opinions"}
                                </h1>
                                <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                                    {isManager
                                        ? isAr
                                            ? "استعراض كافة الفتاوى المقدمة من المستشارين القانونيين، والاطلاع على تفاصيلها واتخاذ قرارات الاعتماد أو التعديل."
                                            : "Browse all submitted opinions from legal advisors and take review decisions."
                                        : isAr
                                        ? "متابعة حالة فتاواك القانونية المرسلة، والاطلاع على قرارات وملاحظات مدير المنظومة."
                                        : "Track the status of your submitted legal opinions and review manager feedback."}
                                </p>
                            </div>
                        </div>

                        {/* Actions: Add New Opinion & Unanswered Questions (Only for Legal Advisor) */}
                        {isAdvisor && (
                            <div className="flex flex-wrap items-center gap-2.5">
                                <Link
                                    to="/unknown-questions"
                                    className="inline-flex items-center gap-2 rounded-2xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 px-4 py-2.5 text-xs sm:text-sm font-bold text-purple-600 dark:text-purple-400 transition-all hover:scale-105 active:scale-95 shadow-sm cursor-pointer"
                                >
                                    <HelpCircle className="h-4 w-4" />
                                    <span>{isAr ? "أسئلة بانتظار فتوى" : "Unanswered Questions"}</span>
                                </Link>
                                <Link
                                    to="/legal-opinion"
                                    className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-500 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span>{isAr ? "صياغة فتوى جديدة" : "Draft New Opinion"}</span>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {actionError && (
                    <div className="mb-6">
                        <Alert>{actionError}</Alert>
                    </div>
                )}

                {/* Controls: Search & Status Filters */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                    {/* Search Box */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={
                                isManager
                                    ? isAr
                                        ? "بحث بعنوان الفتوى أو اسم المستشار..."
                                        : "Search by opinion title or advisor..."
                                    : isAr
                                    ? "بحث في عناوين الفتاوى..."
                                    : "Search opinions..."
                            }
                            className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120] py-2.5 ps-10 pe-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                        />
                    </div>

                    {/* Status Filter Tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
                        {[
                            { id: "ALL", label: isAr ? "الكل" : "All" },
                            { id: "Pending", label: isAr ? "قيد المراجعة" : "Pending" },
                            { id: "Approved", label: isAr ? "معتمد" : "Approved" },
                            { id: "Rejected", label: isAr ? "مرفوض" : "Rejected" },
                            { id: "RevisionRequired", label: isAr ? "يتطلب تعديل" : "Revision Required" },
                        ].map((tab) => {
                            const isActive = statusFilter === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setStatusFilter(tab.id)}
                                    className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                                        isActive
                                            ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                                            : "border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Main Content: Table */}
                <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120]/90 shadow-xl overflow-hidden backdrop-blur-md">
                    {isLoading ? (
                        <div className="py-24 text-center space-y-4">
                            <Loader2 className="mx-auto h-10 w-10 animate-spin text-blue-500" />
                            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                                {isAr ? "جارٍ جلب الفتاوى القانونية من الخادم..." : "Loading opinions from server..."}
                            </p>
                        </div>
                    ) : opinions.length === 0 ? (
                        <div className="py-20 text-center px-4 space-y-4">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-400">
                                <BookOpen className="h-8 w-8" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                {isAr ? "لا توجد فتاوى قانونية مطابقة" : "No opinions found"}
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                                {isAr
                                    ? "لم يتم العثور على أي فتاوى بهذا الفلتر، يمكنك صياغة فتوى جديدة الآن."
                                    : "No opinions match your current filter. You can draft a new opinion now."}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-start text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.02] text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        <th className="px-6 py-4 text-start">{isAr ? "عنوان الفتوى" : "Opinion Title"}</th>
                                        {isManager && (
                                            <th className="px-6 py-4 text-start">{isAr ? "مقدم الفتوى" : "Created By"}</th>
                                        )}
                                        <th className="px-6 py-4 text-start">{isAr ? "تاريخ التقديم" : "Date"}</th>
                                        <th className="px-6 py-4 text-start">{isAr ? "مستند مرفق" : "Document"}</th>
                                        <th className="px-6 py-4 text-start">{isAr ? "الحالة" : "Status"}</th>
                                        <th className="px-6 py-4 text-end">{isAr ? "الإجراءات" : "Actions"}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                    {opinions.map((op) => {
                                        const hasDoc = Boolean(op.hasDocument || op.document);

                                        return (
                                            <tr
                                                key={op.id}
                                                className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors"
                                            >
                                                {/* Title */}
                                                <td className="px-6 py-4 font-bold text-slate-900 dark:text-white max-w-xs sm:max-w-md truncate">
                                                    <Link
                                                        to={`/opinions/${op.id}`}
                                                        className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                                        title={op.title}
                                                    >
                                                        {op.title}
                                                    </Link>
                                                </td>

                                                {/* Advisor (Created By) - Manager view */}
                                                {isManager && (
                                                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400">
                                                                <User className="h-3.5 w-3.5" />
                                                            </div>
                                                            <span className="font-semibold text-xs">
                                                                {op.createdByName || (isAr ? "غير محدد" : "Unknown")}
                                                            </span>
                                                        </div>
                                                    </td>
                                                )}

                                                {/* Date */}
                                                <td className="px-6 py-4 text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                                    {formatDate(op.createdAt)}
                                                </td>

                                                {/* Has Document */}
                                                <td className="px-6 py-4">
                                                    {hasDoc ? (
                                                        <span className="inline-flex items-center gap-1 rounded-lg bg-blue-500/10 px-2.5 py-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                                                            <Paperclip className="h-3 w-3" />
                                                            <span>{isAr ? "مرفق" : "Attached"}</span>
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-slate-400">-</span>
                                                    )}
                                                </td>

                                                {/* Status Badge */}
                                                <td className="px-6 py-4">
                                                    {renderStatusBadge(op.status, op.statusCode)}
                                                </td>

                                                {/* Actions */}
                                                <td className="px-6 py-4 text-end whitespace-nowrap">
                                                    {/* زر الإطلاع على الفتوى فقط */}
                                                    <Link
                                                        to={`/opinions/${op.id}`}
                                                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0E1528] px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-all hover:scale-105 active:scale-95 shadow-sm"
                                                    >
                                                        <Eye className="h-3.5 w-3.5 text-blue-500" />
                                                        <span>{isAr ? "الإطلاع على الفتوى" : "View Details"}</span>
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
