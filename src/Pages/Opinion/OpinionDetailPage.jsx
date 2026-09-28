import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    CheckCircle2,
    XCircle,
    AlertTriangle,
    FileText,
    ArrowLeft,
    ArrowRight,
    User,
    Calendar,
    Download,
    Eye,
    Trash2,
    Loader2,
    FilePenLine,
    Clock,
    Scale,
    HelpCircle,
    Shield,
    X,
    Send,
    MessageSquare,
} from "lucide-react";

import Navbar from "../../components/home/Navbar";
import Alert from "../../components/Alert/Alert";
import {
    getOpinionById,
    reviewOpinion,
    resubmitOpinion,
    deleteOpinion,
} from "../../services/opinionApi";
import { getDocumentForViewing, downloadDocumentByName } from "../../services/searchApi";
import { getErrorMessage } from "../../services/apiError";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";

export default function OpinionDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { lang, dir } = useLanguage();
    const { isManager } = useAuth();

    const isAr = lang === "ar";
    const isRtl = dir === "rtl";
    const BackArrow = isRtl ? ArrowRight : ArrowLeft;

    const [opinion, setOpinion] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    // Manager Decision Review state
    const [reviewDecision, setReviewDecision] = useState(null); // 1: Approve, 2: Reject, 3: RevisionRequired
    const [reviewComments, setReviewComments] = useState("");
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);

    // Advisor Edit & Resubmit state
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState("");
    const [editQuestion, setEditQuestion] = useState("");
    const [editAnswer, setEditAnswer] = useState("");
    const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
    const [editError, setEditError] = useState("");

    // Delete state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Document Modal State
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [docData, setDocData] = useState(null);
    const [isViewingDoc, setIsViewingDoc] = useState(false);
    const [isDownloadingDoc, setIsDownloadingDoc] = useState(false);

    // Messages
    const [actionSuccess, setActionSuccess] = useState("");
    const [actionError, setActionError] = useState("");

    const fetchOpinionData = async () => {
        setIsLoading(true);
        setFetchError(null);
        try {
            const data = await getOpinionById(id);
            setOpinion(data);
            setEditTitle(data.title || "");
            setEditQuestion(data.question || "");
            setEditAnswer(data.answer || "");
        } catch (err) {
            setFetchError(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        let isMounted = true;
        async function load() {
            setIsLoading(true);
            setFetchError(null);
            try {
                const data = await getOpinionById(id);
                if (isMounted) {
                    setOpinion(data);
                    setEditTitle(data.title || "");
                    setEditQuestion(data.question || "");
                    setEditAnswer(data.answer || "");
                }
            } catch (err) {
                if (isMounted) setFetchError(err);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        }
        load();
        return () => {
            isMounted = false;
        };
    }, [id]);

    // Action: Manager submits Review Decision (1: Approve, 2: Reject, 3: RevisionRequired)
    const handleOpenReviewModal = (decisionCode) => {
        setReviewDecision(decisionCode);
        setReviewComments("");
        setActionError("");
        setReviewModalOpen(true);
    };

    const handleConfirmReview = async () => {
        if (!reviewDecision) return;

        // Comments is required only for RevisionRequired (Decision: 3)
        if (reviewDecision === 3 && !reviewComments.trim()) {
            setActionError(isAr ? "يرجى كتابة الملاحظات المطلوب تعديلها للمستشار." : "Please provide comments for revision.");
            return;
        }

        setIsSubmittingReview(true);
        setActionError("");
        setActionSuccess("");

        try {
            const updated = await reviewOpinion(id, reviewDecision, reviewComments.trim());
            if (updated && typeof updated === "object") {
                setOpinion((prev) => ({ ...prev, ...updated }));
            }
            fetchOpinionData();
            setReviewModalOpen(false);
            setReviewComments("");

            if (reviewDecision === 1) {
                setActionSuccess(isAr ? "تم قبول واعتماد الفتوى القانونية بنجاح." : "Opinion approved successfully.");
            } else if (reviewDecision === 2) {
                setActionSuccess(isAr ? "تم رفض الفتوى وتسجيل القرار." : "Opinion rejected.");
            } else {
                setActionSuccess(isAr ? "تم إرسال طلب التعديل إلى المستشار القانوني بنجاح." : "Revision requested from advisor successfully.");
            }
        } catch (err) {
            setActionError(getErrorMessage(err));
        } finally {
            setIsSubmittingReview(false);
        }
    };

    // Action: Advisor Resubmit (PUT /api/LegalOpinion/{id}/Resubmit)
    const handleSaveResubmit = async (e) => {
        e.preventDefault();
        if (!editTitle.trim() || !editQuestion.trim() || !editAnswer.trim()) {
            setEditError(isAr ? "يرجى ملء كافة الحقول (العنوان، السؤال، والرأي)." : "Please fill in all fields.");
            return;
        }

        setIsSubmittingEdit(true);
        setEditError("");
        setActionSuccess("");

        try {
            const updated = await resubmitOpinion(id, {
                title: editTitle.trim(),
                question: editQuestion.trim(),
                answer: editAnswer.trim(),
            });
            if (updated && typeof updated === "object") {
                setOpinion((prev) => ({
                    ...prev,
                    ...updated,
                    title: editTitle.trim(),
                    question: editQuestion.trim(),
                    answer: editAnswer.trim(),
                    status: "Pending",
                    statusCode: 1,
                    rejectionReason: null,
                }));
                setEditTitle(editTitle.trim());
                setEditQuestion(editQuestion.trim());
                setEditAnswer(editAnswer.trim());
            }
            setIsEditing(false);
            setActionSuccess(isAr ? "تم إرسال التعديل بنجاح وإعادة الفتوى لقيد المراجعة." : "Opinion resubmitted for review successfully.");
        } catch (err) {
            setEditError(getErrorMessage(err));
        } finally {
            setIsSubmittingEdit(false);
        }
    };

    // Action: Delete Opinion (DELETE /api/LegalOpinion/{id})
    const handleConfirmDelete = async () => {
        setIsDeleting(true);
        setActionError("");

        try {
            await deleteOpinion(id);
            navigate("/opinions", {
                replace: true,
                state: { message: isAr ? "تم حذف الفتوى بنجاح." : "Opinion deleted successfully." },
            });
        } catch (err) {
            setActionError(getErrorMessage(err));
            setShowDeleteModal(false);
        } finally {
            setIsDeleting(false);
        }
    };

    // Action: Document Preview Modal
    const handleViewDocument = async (fileName) => {
        if (!fileName) return;
        setIsViewingDoc(true);
        setViewModalOpen(true);
        try {
            const res = await getDocumentForViewing(fileName);
            setDocData(res);
        } catch (err) {
            setActionError(err.message || (isAr ? "تعذر قراءة ملف المستند." : "Failed to load document content."));
        } finally {
            setIsViewingDoc(false);
        }
    };

    // Action: Document Download
    const handleDownloadDocument = async (fileName) => {
        if (!fileName) return;
        setIsDownloadingDoc(true);
        try {
            await downloadDocumentByName(fileName);
        } finally {
            setIsDownloadingDoc(false);
        }
    };

    const statusCode = Number(opinion?.statusCode) || (opinion?.status === "Approved" ? 2 : opinion?.status === "Rejected" ? 3 : opinion?.status === "RevisionRequired" ? 4 : 1);
    const isApproved = statusCode === 2 || opinion?.status === "Approved" || String(opinion?.status).toLowerCase().includes("approved") || String(opinion?.status).includes("معتمد");
    const isRevisionRequired = statusCode === 4 || opinion?.status === "RevisionRequired" || String(opinion?.status).toLowerCase().includes("revision") || String(opinion?.status).includes("تعديل");
    const isRejected = statusCode === 3 || opinion?.status === "Rejected" || String(opinion?.status).toLowerCase().includes("rejected") || String(opinion?.status).includes("مرفوض");
    const isPending = (statusCode === 1 || opinion?.status === "Pending" || opinion?.status === "Submitted" || String(opinion?.status).toLowerCase().includes("pending") || String(opinion?.status).includes("انتظار")) && !isApproved && !isRevisionRequired && !isRejected;

    // Format Date
    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        try {
            return new Date(dateStr).toLocaleDateString(isAr ? "ar-EG" : "en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return dateStr;
        }
    };

    const attachedDocName = opinion?.document?.fileName || (typeof opinion?.document === "string" ? opinion?.document : null);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#070A14] text-slate-900 dark:text-white transition-colors duration-200">
            <Navbar />

            <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">
                {/* Navigation & Actions Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <Link
                        to="/opinions"
                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120] px-4 py-2 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-all shadow-sm"
                    >
                        <BackArrow className="h-4 w-4" />
                        <span>{isAr ? "العودة لجدول الفتاوى" : "Back to Opinions Table"}</span>
                    </Link>

                    {/* Delete Opinion Button (Allowed for Advisor draft opinions only, NEVER for Manager or Approved) */}
                    {!isManager && !isApproved && (
                        <button
                            type="button"
                            onClick={() => setShowDeleteModal(true)}
                            className="inline-flex items-center gap-1.5 rounded-2xl border border-red-500/25 bg-red-500/10 hover:bg-red-500 hover:text-white px-4 py-2 text-xs sm:text-sm font-bold text-red-600 dark:text-red-400 transition-all cursor-pointer"
                        >
                            <Trash2 className="h-4 w-4" />
                            <span>{isAr ? "حذف الفتوى" : "Delete Opinion"}</span>
                        </button>
                    )}
                </div>

                {/* Notifications */}
                {actionSuccess && (
                    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                            <span>{actionSuccess}</span>
                        </div>
                        <button type="button" onClick={() => setActionSuccess("")} className="text-emerald-500 hover:opacity-80">
                            &times;
                        </button>
                    </div>
                )}
                {actionError && (
                    <Alert>{actionError}</Alert>
                )}

                {/* Loading State */}
                {isLoading ? (
                    <div className="py-24 text-center space-y-4">
                        <Loader2 className="mx-auto h-10 w-10 animate-spin text-blue-500" />
                        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                            {isAr ? "جارٍ جلب تفاصيل الفتوى القانونية..." : "Loading opinion details..."}
                        </p>
                    </div>
                ) : fetchError ? (
                    <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-8 text-center space-y-3">
                        <AlertTriangle className="mx-auto h-10 w-10 text-red-500" />
                        <h2 className="text-lg font-bold text-red-500">
                            {isAr ? "تعذر تحميل الفتوى" : "Failed to load opinion"}
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                            {getErrorMessage(fetchError)}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* 1. Main Header Card with Status Badge */}
                        <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120]/90 p-6 sm:p-8 shadow-xl backdrop-blur-md">
                            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                    <Calendar className="h-3.5 w-3.5 text-blue-500" />
                                    <span>
                                        {formatDate(opinion.createdAt)}
                                    </span>
                                </div>

                                {/* Status Badge */}
                                <div>
                                    {isApproved ? (
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3.5 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                            <CheckCircle2 className="h-4 w-4" />
                                            <span>{isAr ? "معتمد ومفهرس بالذكاء الاصطناعي" : "Approved & Indexed"}</span>
                                        </span>
                                    ) : isRejected ? (
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 border border-red-500/30 px-3.5 py-1.5 text-xs font-bold text-red-600 dark:text-red-400">
                                            <XCircle className="h-4 w-4" />
                                            <span>{isAr ? "مرفوض" : "Rejected"}</span>
                                        </span>
                                    ) : isRevisionRequired ? (
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 px-3.5 py-1.5 text-xs font-bold text-purple-600 dark:text-purple-400">
                                            <AlertTriangle className="h-4 w-4" />
                                            <span>{isAr ? "يتطلب تعديل من المستشار" : "Revision Required"}</span>
                                        </span>
                                    ) : isPending ? (
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-3.5 py-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                                            <Clock className="h-4 w-4" />
                                            <span>{isAr ? "قيد مراجعة المدير" : "Pending Review"}</span>
                                        </span>
                                    ) : null}
                                </div>
                            </div>

                            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                                {opinion.title}
                            </h1>

                            {/* Author & Reviewer meta row */}
                            <div className="mt-4 flex flex-wrap items-center gap-6 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-white/5 pt-4">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-blue-500" />
                                    <span>{isAr ? "مقدم الفتوى:" : "Submitted By:"}</span>
                                    <strong className="text-slate-800 dark:text-slate-200">
                                        {opinion.createdByName || (isAr ? "مستشار قانوني" : "Advisor")}
                                    </strong>
                                </div>
                                {opinion.reviewedByName && (
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-purple-500" />
                                        <span>{isAr ? "المراجع:" : "Reviewed By:"}</span>
                                        <strong className="text-slate-800 dark:text-slate-200">
                                            {opinion.reviewedByName}
                                        </strong>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 2. Revision Alert Banner */}
                        {isRevisionRequired && (
                            <div className="rounded-3xl border border-purple-500/30 bg-purple-500/10 p-6 space-y-3">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex items-center gap-2 text-sm font-bold text-purple-600 dark:text-purple-400">
                                        <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                                        <span>
                                            {isManager
                                                ? (isAr ? "تم إرسال طلب تعديل على هذه الفتوى إلى المستشار القانوني" : "Revision requested from advisor")
                                                : (isAr ? "تنبيه: مطلوب تعديل على هذه الفتوى من قبل المدير" : "Notice: Revision requested by manager")}
                                        </span>
                                    </div>
                                    {/* Only Advisor / author sees the edit button */}
                                    {!isManager && !isEditing && (
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(true)}
                                            className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-2 text-xs font-bold text-white shadow-md transition-all cursor-pointer"
                                        >
                                            <FilePenLine className="h-3.5 w-3.5" />
                                            <span>{isAr ? "تعديل الفتوى الآن" : "Edit Opinion Now"}</span>
                                        </button>
                                    )}
                                </div>
                                {opinion.rejectionReason && (
                                    <div className="space-y-1">
                                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                                            {isAr ? "الملاحظات المرسلة للمستشار:" : "Revision Notes:"}
                                        </span>
                                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 bg-white/60 dark:bg-black/20 p-3.5 rounded-xl">
                                            "{opinion.rejectionReason}"
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 3. Inline Edit Form (When Advisor clicks Edit - never shown to manager) */}
                        {!isManager && isEditing ? (
                            <div className="rounded-3xl border border-blue-500/30 bg-white dark:bg-[#0B1120] p-6 sm:p-8 shadow-xl space-y-6">
                                <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <FilePenLine className="h-5 w-5 text-blue-500" />
                                        <span>{isAr ? "تعديل الفتوى وإعادة الإرسال للمراجعة" : "Edit & Resubmit Opinion"}</span>
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                {editError && <Alert>{editError}</Alert>}

                                <form onSubmit={handleSaveResubmit} className="space-y-5">
                                    {/* Title */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                                            {isAr ? "عنوان الفتوى" : "Title"} <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0E1528] px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>

                                    {/* Question */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                                            {isAr ? "السؤال القانوني" : "Question"} <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={editQuestion}
                                            onChange={(e) => setEditQuestion(e.target.value)}
                                            className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0E1528] p-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>

                                    {/* Answer */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                                            {isAr ? "الرأي والتحليل القانوني" : "Legal Opinion"} <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            rows={8}
                                            value={editAnswer}
                                            onChange={(e) => setEditAnswer(e.target.value)}
                                            className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0E1528] p-4 text-sm leading-relaxed text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>

                                    <div className="flex items-center justify-end gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(false)}
                                            className="rounded-xl border border-slate-200 dark:border-white/10 px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                                        >
                                            {isAr ? "إلغاء" : "Cancel"}
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmittingEdit}
                                            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/25 transition-all disabled:opacity-50 cursor-pointer"
                                        >
                                            {isSubmittingEdit ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                            <span>{isAr ? "حفظ وإعادة الإرسال للمراجعة" : "Resubmit for Review"}</span>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            /* Normal Q&A Display */
                            <div className="space-y-6">
                                {/* Legal Question */}
                                <div className="rounded-3xl border border-blue-500/20 bg-blue-500/5 p-6 sm:p-8 space-y-2">
                                    <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                                        <HelpCircle className="h-4 w-4" />
                                        <span>{isAr ? "السؤال القانوني المستفسر عنه" : "Legal Question"}</span>
                                    </div>
                                    <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                                        {opinion.question}
                                    </p>
                                </div>

                                {/* Legal Opinion Answer */}
                                <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120]/90 p-6 sm:p-8 shadow-xl space-y-3">
                                    <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                                        <Scale className="h-4 w-4" />
                                        <span>{isAr ? "نص الرأي والتحليل القانوني الشامل" : "Comprehensive Legal Opinion"}</span>
                                    </div>
                                    <div className="text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-line font-normal">
                                        {opinion.answer}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 4. Attached Document Section (If any) */}
                        {attachedDocName && (
                            <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120]/90 p-6 shadow-md">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-500 border border-blue-500/25">
                                            <FileText className="h-6 w-6" />
                                        </div>
                                        <div className="min-w-0">
                                            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                                                {isAr ? "المستند الداعم المرفق" : "Attached Document"}
                                            </span>
                                            <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate" title={attachedDocName}>
                                                {attachedDocName}
                                            </h4>
                                            {opinion.document?.fileSize && (
                                                <span className="text-xs text-slate-400">
                                                    {(opinion.document.fileSize / 1024).toFixed(1)} KB
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {/* زر معاينة المستند */}
                                        <button
                                            type="button"
                                            onClick={() => handleViewDocument(attachedDocName)}
                                            disabled={isViewingDoc}
                                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0E1528] px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer"
                                        >
                                            <Eye className="h-4 w-4 text-blue-500" />
                                            <span>{isAr ? "معاينة المستند" : "Preview"}</span>
                                        </button>

                                        {/* زر تحميل المستند */}
                                        <button
                                            type="button"
                                            onClick={() => handleDownloadDocument(attachedDocName)}
                                            disabled={isDownloadingDoc}
                                            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-bold text-white shadow-md transition-all cursor-pointer"
                                        >
                                            {isDownloadingDoc ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Download className="h-4 w-4" />
                                            )}
                                            <span>{isAr ? "تحميل" : "Download"}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 5. Reviews History Section (سجل المراجعات والتعليقات السابقة) */}
                        {Array.isArray(opinion.reviews) && opinion.reviews.length > 0 && (
                            <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120]/90 p-6 sm:p-8 shadow-xl space-y-4">
                                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-3">
                                    <MessageSquare className="h-5 w-5 text-blue-500" />
                                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                                        {isAr ? "سجل قرارات وملاحظات المراجعة" : "Review History & Feedback"}
                                    </h3>
                                </div>

                                <div className="space-y-3">
                                    {opinion.reviews.map((rev, index) => {
                                        const decisionCode = Number(rev.decision) || (rev.decision === "Approved" ? 1 : rev.decision === "Rejected" ? 2 : 3);
                                        return (
                                            <div
                                                key={index}
                                                className="rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50/70 dark:bg-[#0E1528] p-4 space-y-2"
                                            >
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <Shield className="h-4 w-4 text-purple-500" />
                                                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                                                            {rev.reviewerName || (isAr ? "مدير الشؤون القانونية" : "Legal Manager")}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[11px] text-slate-400">
                                                            {formatDate(rev.createdAt)}
                                                        </span>

                                                        {/* Decision Tag */}
                                                        {decisionCode === 1 ? (
                                                            <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                                                {isAr ? "قبول واعتماد" : "Approved"}
                                                            </span>
                                                        ) : decisionCode === 2 ? (
                                                            <span className="rounded-full bg-red-500/15 border border-red-500/30 px-2.5 py-0.5 text-[11px] font-bold text-red-600 dark:text-red-400">
                                                                {isAr ? "رفض" : "Rejected"}
                                                            </span>
                                                        ) : (
                                                            <span className="rounded-full bg-purple-500/15 border border-purple-500/30 px-2.5 py-0.5 text-[11px] font-bold text-purple-600 dark:text-purple-400">
                                                                {isAr ? "طلب تعديل" : "Revision Required"}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {rev.comments && (
                                                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium ps-6">
                                                        "{rev.comments}"
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* 6. Legal Manager Decision Action Panel (Shown only to Legal Managers when opinion is strictly PENDING review) */}
                        {isManager && isPending && (
                            <div className="rounded-3xl border border-blue-500/30 bg-white dark:bg-[#0B1120] p-6 sm:p-8 shadow-2xl space-y-4">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                        {isAr ? "اتخاذ قرار بشأن الفتوى (لوحة مراجعة المدير)" : "Manager Review Decision Panel"}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                        {isAr
                                            ? "يمكنك قبول الفتوى لاعتمادها وفهرستها في محرك الذكاء الاصطناعي، أو طلب تعديلها من المستشار، أو رفضها."
                                            : "Approve for AI indexing, request revision from advisor, or reject."}
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-3 pt-2">
                                    {/* 1. قبول (Approve - Decision 1) */}
                                    <button
                                        type="button"
                                        onClick={() => handleOpenReviewModal(1)}
                                        className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                                    >
                                        <CheckCircle2 className="h-4 w-4" />
                                        <span>{isAr ? "قبول واعتماد الفتوى" : "Approve Opinion"}</span>
                                    </button>

                                    {/* 2. محتاج تعديل (Revision Required - Decision 3) */}
                                    <button
                                        type="button"
                                        onClick={() => handleOpenReviewModal(3)}
                                        className="inline-flex items-center gap-2 rounded-2xl bg-purple-600 hover:bg-purple-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-purple-600/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                                    >
                                        <AlertTriangle className="h-4 w-4" />
                                        <span>{isAr ? "طلب تعديل من المستشار" : "Request Revision"}</span>
                                    </button>

                                    {/* 3. رفض (Reject - Decision 2) */}
                                    <button
                                        type="button"
                                        onClick={() => handleOpenReviewModal(2)}
                                        className="inline-flex items-center gap-2 rounded-2xl bg-red-600 hover:bg-red-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-red-600/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                                    >
                                        <XCircle className="h-4 w-4" />
                                        <span>{isAr ? "رفض الفتوى" : "Reject Opinion"}</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Status Info for Manager after decision is made */}
                        {isManager && isRevisionRequired && (
                            <div className="rounded-3xl border border-purple-500/30 bg-purple-500/10 p-6 sm:p-8 space-y-2 shadow-lg">
                                <div className="flex items-center gap-2.5 text-base font-bold text-purple-600 dark:text-purple-400">
                                    <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                                    <span>
                                        {isAr
                                            ? "تم إرسال طلب التعديل إلى المستشار القانوني بنجاح"
                                            : "Revision Requested - Awaiting Advisor Modifications"}
                                    </span>
                                </div>
                                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                    {isAr
                                        ? "الفتوى الآن بعهدة المستشار القانوني لإجراء التعديلات المطلوبة، وستعود تلقائياً إلى قائمة المراجعة فور قيام المستشار بإعادة إرسالها."
                                        : "The opinion is currently with the advisor for editing. It will automatically reappear in your review queue once resubmitted."}
                                </p>
                            </div>
                        )}

                        {isManager && isApproved && (
                            <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6 sm:p-8 space-y-2 shadow-lg">
                                <div className="flex items-center gap-2.5 text-base font-bold text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                                    <span>
                                        {isAr
                                            ? "فتوى قانونية معتمدة ومفهرسة بالذكاء الاصطناعي"
                                            : "Approved and Indexed Legal Opinion"}
                                    </span>
                                </div>
                                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                    {isAr
                                        ? "تم اعتماد هذه الفتوى رسمياً وتدقيقها، وهي مفهرسة ونشطة الآن في محرك الذكاء الاصطناعي."
                                        : "This opinion has been officially approved and is indexed in the AI precedent engine."}
                                </p>
                            </div>
                        )}

                        {isManager && isRejected && (
                            <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-6 sm:p-8 space-y-2 shadow-lg">
                                <div className="flex items-center gap-2.5 text-base font-bold text-red-600 dark:text-red-400">
                                    <XCircle className="h-5 w-5 flex-shrink-0" />
                                    <span>
                                        {isAr ? "فتوى قانونية مرفوضة" : "Rejected Legal Opinion"}
                                    </span>
                                </div>
                                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                    {isAr
                                        ? "تم رفض هذه الفتوى من قبل الإدارة القانونية ولم يتم اعتمادها في الذكاء الاصطناعي."
                                        : "This opinion has been rejected and is not indexed."}
                                </p>
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Manager Decision Modal (POST /api/LegalOpinion/{id}/Review) */}
            {reviewModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#0B1120] p-6 sm:p-8 shadow-2xl space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
                            <div className="flex items-center gap-2.5">
                                {reviewDecision === 1 ? (
                                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-500">
                                        <CheckCircle2 className="h-5 w-5" />
                                    </div>
                                ) : reviewDecision === 2 ? (
                                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-500/15 text-red-500">
                                        <XCircle className="h-5 w-5" />
                                    </div>
                                ) : (
                                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-500">
                                        <AlertTriangle className="h-5 w-5" />
                                    </div>
                                )}
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    {reviewDecision === 1
                                        ? isAr ? "قبول واعتماد الفتوى القانونية" : "Approve Legal Opinion"
                                        : reviewDecision === 2
                                        ? isAr ? "رفض الفتوى القانونية" : "Reject Legal Opinion"
                                        : isAr ? "طلب إجراء تعديل على الفتوى" : "Request Revision from Advisor"}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setReviewModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {actionError && <Alert>{actionError}</Alert>}

                        {/* Comments Textarea */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                {reviewDecision === 3
                                    ? isAr ? "الملاحظات والتعديلات المطلوبة (مطلوب)" : "Revision Instructions (Required)"
                                    : isAr ? "تعليق وملاحظات إضافية (اختياري)" : "Comments (Optional)"}
                                {reviewDecision === 3 && <span className="text-red-500"> *</span>}
                            </label>
                            <textarea
                                rows={4}
                                value={reviewComments}
                                onChange={(e) => setReviewComments(e.target.value)}
                                placeholder={
                                    reviewDecision === 1
                                        ? isAr ? "اكتب تعليق اعتماد إن رغبت (اختياري)..." : "Optional approval comments..."
                                        : reviewDecision === 2
                                        ? isAr ? "اكتب سبب الرفض إن رغبت (اختياري)..." : "Optional rejection comments..."
                                        : isAr ? "مثال: راجع عليها تاني، أضف الاستناد للمادة 227 مدني..." : "e.g., Please refine statutory references..."
                                }
                                className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0E1528] p-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
                            />
                        </div>

                        {/* Modal Actions */}
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setReviewModalOpen(false)}
                                className="rounded-xl border border-slate-200 dark:border-white/10 px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                            >
                                {isAr ? "إلغاء" : "Cancel"}
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmReview}
                                disabled={isSubmittingReview}
                                className={`inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-bold text-white shadow-md transition-all disabled:opacity-50 cursor-pointer ${
                                    reviewDecision === 1
                                        ? "bg-emerald-600 hover:bg-emerald-500"
                                        : reviewDecision === 2
                                        ? "bg-red-600 hover:bg-red-500"
                                        : "bg-purple-600 hover:bg-purple-500"
                                }`}
                            >
                                {isSubmittingReview ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                                <span>{isAr ? "تأكيد وإرسال القرار" : "Confirm Decision"}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal (DELETE /api/LegalOpinion/{id}) */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="relative w-full max-w-md rounded-3xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#0B1120] p-6 shadow-2xl space-y-4">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/15 text-red-500 border border-red-500/30">
                            <Trash2 className="h-7 w-7" />
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                                {isAr ? "تأكيد حذف الفتوى القانونية" : "Confirm Delete Opinion"}
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                                {isAr
                                    ? `هل أنت متأكد من رغبتك في حذف الفتوى "${opinion?.title}"؟ لا يمكن التراجع عن هذا الإجراء.`
                                    : `Are you sure you want to delete "${opinion?.title}"? This action cannot be undone.`}
                            </p>
                        </div>
                        <div className="flex items-center gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowDeleteModal(false)}
                                disabled={isDeleting}
                                className="flex-1 rounded-xl border border-slate-200 dark:border-white/10 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                            >
                                {isAr ? "إلغاء" : "Cancel"}
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmDelete}
                                disabled={isDeleting}
                                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-500 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-red-600/25 transition-all disabled:opacity-50"
                            >
                                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                <span>{isAr ? "تأكيد الحذف" : "Delete"}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Document Viewer Modal */}
            {viewModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="relative w-full max-w-3xl max-h-[88vh] flex flex-col rounded-3xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#0B1120] shadow-2xl overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 p-5 sm:p-6 bg-slate-50/80 dark:bg-white/[0.02]">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-600/15 text-blue-500 border border-blue-500/25">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                                        {isAr ? "معاينة المستند المرفق" : "Attached Document Preview"}
                                    </span>
                                    <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate" title={attachedDocName}>
                                        {attachedDocName}
                                    </h3>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setViewModalOpen(false)}
                                className="rounded-xl p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                            {isViewingDoc ? (
                                <div className="py-16 text-center space-y-4">
                                    <Loader2 className="mx-auto h-10 w-10 animate-spin text-blue-500" />
                                    <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
                                        {isAr ? "جارٍ قراءة المستند..." : "Loading document..."}
                                    </p>
                                </div>
                            ) : docData?.type === "pdf" ? (
                                <div className="w-full h-[65vh] rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-900 shadow-inner">
                                    <iframe src={docData.url} title={attachedDocName} className="w-full h-full border-none" />
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-900 text-slate-100 p-5 sm:p-6 font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto whitespace-pre-wrap">
                                    {docData?.text || (isAr ? "لا يوجد محتوى نصي مباشر لهذا المستند." : "No preview text available.")}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end gap-3 border-t border-slate-200 dark:border-white/10 p-4 sm:p-5 bg-slate-50/80 dark:bg-white/[0.02] text-xs">
                            <button
                                type="button"
                                onClick={() => setViewModalOpen(false)}
                                className="rounded-xl border border-slate-300 dark:border-white/15 px-4 py-2 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                            >
                                {isAr ? "إغلاق" : "Close"}
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDownloadDocument(attachedDocName)}
                                disabled={isDownloadingDoc}
                                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2 font-bold text-white shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                            >
                                {isDownloadingDoc ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                                <span>{isAr ? "تحميل الملف" : "Download File"}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
