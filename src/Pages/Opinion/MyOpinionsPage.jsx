import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    BookOpen,
    Plus,
    Search,
    CheckCircle2,
    Clock,
    XCircle,
    FileText,
    Trash2,
    ArrowRight,
    ArrowLeft,
    AlertCircle,
    Loader2,
    Calendar,
    MessageSquare,
    Eye,
} from "lucide-react";
import Navbar from "../../components/home/Navbar";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { getMyOpinions, deleteOpinion } from "../../services/opinionApi";
import Alert from "../../components/Alert/Alert";

export default function MyOpinionsPage() {
    const { lang, dir } = useLanguage();
    const { isAdvisor } = useAuth();
    const navigate = useNavigate();

    const isAr = lang === "ar";

    const [opinions, setOpinions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedOpinion, setSelectedOpinion] = useState(null);
    const [actionError, setActionError] = useState("");

    const loadOpinions = useCallback(async () => {
        setIsLoading(true);
        setActionError("");
        try {
            const data = await getMyOpinions({ status: statusFilter, search: searchQuery });
            setOpinions(data || []);
        } catch {
            setActionError(isAr ? "تعذر جلب الآراء القانونية." : "Failed to load opinions.");
        } finally {
            setIsLoading(false);
        }
    }, [statusFilter, searchQuery, isAr]);

    useEffect(() => {
        loadOpinions();
    }, [loadOpinions]);

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm(isAr ? "هل أنت متأكد من حذف هذا الرأي القانوني؟" : "Are you sure to delete this opinion?")) {
            return;
        }

        try {
            await deleteOpinion(id);
            setOpinions((prev) => prev.filter((op) => op.id !== id));
            if (selectedOpinion?.id === id) setSelectedOpinion(null);
        } catch {
            setActionError(isAr ? "فشل حذف الرأي القانوني." : "Failed to delete opinion.");
        }
    };

    const getStatusBadge = (status) => {
        if (status === "Approved") {
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-500">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{isAr ? "معتمد ومفهرس في AI" : "Approved & Indexed"}</span>
                </span>
            );
        }
        if (status === "RevisionRequired") {
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/15 border border-purple-500/30 px-3 py-1 text-xs font-bold text-purple-400">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>{isAr ? "يتطلب تعديل" : "Revision Required"}</span>
                </span>
            );
        }
        if (status === "Rejected") {
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 border border-red-500/30 px-3 py-1 text-xs font-bold text-red-500">
                    <XCircle className="h-3.5 w-3.5" />
                    <span>{isAr ? "مرفوض" : "Rejected"}</span>
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-xs font-bold text-amber-500">
                <Clock className="h-3.5 w-3.5" />
                <span>{isAr ? "قيد مراجعة المدير" : "Pending Review"}</span>
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#070A14] text-slate-900 dark:text-white transition-colors duration-200">
            <Navbar />

            <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="rounded-full bg-purple-500/15 border border-purple-500/30 px-3 py-0.5 text-xs font-bold text-purple-400">
                                {isAr ? "أرشيف المستشار القانوني" : "Advisor Archive"}
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                            {isAr ? "آرائي وفتاواي القانونية" : "My Legal Opinions"}
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {isAr
                                ? "استعراض ومتابعة حالات الفتاوى القانونية المقدمة منك لمدير الشؤون القانونية."
                                : "Track your submitted legal opinions, approvals, and manager feedback."}
                        </p>
                    </div>

                    <Link
                        to="/legal-opinion"
                        className="inline-flex items-center gap-2 rounded-2xl bg-purple-600 hover:bg-purple-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-purple-600/30 transition-all hover:scale-105 active:scale-95"
                    >
                        <Plus className="h-4 w-4" />
                        <span>{isAr ? "كتابة رأي قانوني جديد" : "Draft New Opinion"}</span>
                    </Link>
                </div>

                {actionError && (
                    <div className="mb-6">
                        <Alert>{actionError}</Alert>
                    </div>
                )}

                {/* Filters & Search Bar */}
                <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120]/80 p-5 shadow-xl backdrop-blur-md mb-8">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        {/* Status Tabs */}
                        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                            {[
                                { key: "ALL", label: isAr ? "كافة الآراء" : "All Opinions" },
                                { key: "Pending", label: isAr ? "قيد المراجعة" : "Pending" },
                                { key: "RevisionRequired", label: isAr ? "يتطلب تعديل" : "Revision Required" },
                                { key: "Approved", label: isAr ? "المعتمدة" : "Approved" },
                                { key: "Rejected", label: isAr ? "المرفوضة" : "Rejected" },
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => setStatusFilter(tab.key)}
                                    className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                                        statusFilter === tab.key
                                            ? "bg-purple-600 text-white shadow-md shadow-purple-600/25"
                                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Search Input */}
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute top-1/2 -translate-y-1/2 start-3.5 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder={isAr ? "بحث في الفتاوى والأسئلة…" : "Search opinions..."}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0E1528] py-2.5 pe-4 ps-10 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-purple-500 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* List of Opinions */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20 text-slate-500">
                        <Loader2 className="h-6 w-6 animate-spin text-purple-500 me-2" />
                        <span>{isAr ? "جارٍ جلب الآراء القانونية…" : "Loading opinions..."}</span>
                    </div>
                ) : opinions.length === 0 ? (
                    <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120]/70 p-12 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-600/15 text-purple-500 border border-purple-500/25 mb-4">
                            <BookOpen className="h-7 w-7" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            {isAr ? "لا توجد فتاوى أو آراء قانونية مطابقة" : "No opinions found"}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            {isAr
                                ? "لم تقم بعد بإضافة آراء في هذا التصنيف أو لم تتطابق كلمة البحث."
                                : "No opinions match your current filters."}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {opinions.map((op) => (
                            <div
                                key={op.id}
                                onClick={() => navigate(`/opinions/${op.id}`)}
                                className="group flex flex-col justify-between rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120]/80 p-6 shadow-xl dark:shadow-[0_10px_30px_rgba(0,0,0,0.3)] backdrop-blur-md transition-all hover:-translate-y-1 hover:border-purple-500/40 cursor-pointer"
                            >
                                <div>
                                    <div className="flex items-center justify-between gap-2 mb-3">
                                        {getStatusBadge(op.status)}
                                        <span className="flex items-center gap-1 text-[11px] text-slate-400">
                                            <Calendar className="h-3 w-3" />
                                            {op.submissionDate}
                                        </span>
                                    </div>

                                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-purple-400 transition-colors line-clamp-2">
                                        {op.title}
                                    </h3>

                                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                                        <strong className="text-slate-700 dark:text-slate-300">{isAr ? "السؤال: " : "Q: "}</strong>
                                        {op.question}
                                    </p>

                                    {/* Rejection Note Warning Banner */}
                                    {op.status === "Rejected" && op.rejectionReason && (
                                        <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-400">
                                            <p className="font-bold flex items-center gap-1">
                                                <AlertCircle className="h-3.5 w-3.5" />
                                                <span>{isAr ? "ملاحظة المدير:" : "Manager Note:"}</span>
                                            </p>
                                            <p className="mt-0.5 line-clamp-2 text-[11px]">{op.rejectionReason}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 flex items-center justify-between border-t border-slate-100 dark:border-white/10 pt-4 text-xs">
                                    {op.attachedFileName ? (
                                        <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
                                            <FileText className="h-3.5 w-3.5 text-purple-500 flex-shrink-0" />
                                            <span className="truncate">{op.attachedFileName}</span>
                                        </span>
                                    ) : (
                                        <span className="text-slate-400 text-[11px]">{isAr ? "بدون مرفق" : "No attachments"}</span>
                                    )}

                                    <div className="flex items-center gap-2">
                                        {op.status !== "Approved" && op.statusCode !== 2 && (
                                            <button
                                                type="button"
                                                onClick={(e) => handleDelete(op.id, e)}
                                                className="rounded-lg p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                                title={isAr ? "حذف الرأي" : "Delete"}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        )}
                                        <span className="text-xs font-bold text-purple-500 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                                            <span>{isAr ? "عرض وتعديل" : "View & Edit"}</span>
                                            <Eye className="h-3.5 w-3.5" />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Detailed Modal / Overlay for Selected Opinion */}
                {selectedOpinion && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#0B1120] p-6 sm:p-8 shadow-2xl space-y-6">
                            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
                                <div className="flex items-center gap-3">
                                    {getStatusBadge(selectedOpinion.status)}
                                    <span className="text-xs text-slate-400">{selectedOpinion.submissionDate}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedOpinion(null)}
                                    className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                                >
                                    ✕
                                </button>
                            </div>

                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                                    {selectedOpinion.title}
                                </h2>
                            </div>

                            {/* Question */}
                            <div className="rounded-2xl border border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20 p-4">
                                <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
                                    {isAr ? "السؤال القانوني المبحوث:" : "Legal Inquiry:"}
                                </p>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                    "{selectedOpinion.question}"
                                </p>
                            </div>

                            {/* Answer */}
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    {isAr ? "التحليل والرأي القانوني المستخلص:" : "Legal Analysis & Answer:"}
                                </p>
                                <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] p-5 text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-line">
                                    {selectedOpinion.answer}
                                </div>
                            </div>

                            {/* Rejection reason if any */}
                            {selectedOpinion.rejectionReason && (
                                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
                                    <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-1">
                                        {isAr ? "سبب وملاحظة الرفض من المدير القانوني:" : "Rejection Reason from Manager:"}
                                    </p>
                                    <p className="text-sm text-red-300">
                                        {selectedOpinion.rejectionReason}
                                    </p>
                                </div>
                            )}

                            {/* Attachment */}
                            {selectedOpinion.attachedFileName && (
                                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0E1528] p-3 text-xs">
                                    <FileText className="h-4 w-4 text-purple-500" />
                                    <span className="font-bold text-slate-800 dark:text-slate-200">{selectedOpinion.attachedFileName}</span>
                                    <span className="text-slate-400 ms-auto">{selectedOpinion.attachedFileSize}</span>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedOpinion(null)}
                                    className="rounded-xl border border-slate-200 dark:border-white/15 px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                                >
                                    {isAr ? "إغلاق" : "Close"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
