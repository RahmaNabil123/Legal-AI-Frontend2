import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    XCircle,
    FileText,
    ArrowLeft,
    ArrowRight,
    User,
    Calendar,
    FileCheck,
    Download,
    AlertTriangle,
    Loader2,
    Sparkles,
    RotateCcw,
    MessageSquare,
    X,
} from "lucide-react";

import Navbar from "../../components/home/Navbar";
import Button from "../../components/Button/Button";
import Alert from "../../components/Alert/Alert";
import {
    getOpinionById,
    approveOpinion,
    rejectOpinion,
    requestRevisionOpinion,
} from "../../services/opinionApi";
import { downloadDocumentByName } from "../../services/searchApi";
import { getErrorMessage } from "../../services/apiError";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";

export default function ReviewOpinionPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { lang, dir } = useLanguage();
    const { isManager } = useAuth();

    const isAr = lang === "ar";
    const BackArrow = dir === "rtl" ? ArrowRight : ArrowLeft;

    const [opinion, setOpinion] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    // Review decision modal state
    // decision: 1 (Approve), 2 (Reject), 3 (RevisionRequired)
    const [modalDecision, setModalDecision] = useState(null);
    const [modalComment, setModalComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [actionError, setActionError] = useState("");
    const [actionSuccess, setActionSuccess] = useState("");

    useEffect(() => {
        let isMounted = true;
        async function fetchOp() {
            setIsLoading(true);
            setFetchError(null);
            try {
                const data = await getOpinionById(id);
                if (isMounted) setOpinion(data);
            } catch (err) {
                if (isMounted) setFetchError(err);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        }
        fetchOp();
        return () => {
            isMounted = false;
        };
    }, [id]);

    const handleOpenDecisionModal = (decision) => {
        setModalDecision(decision);
        setModalComment("");
        setActionError("");
    };

    const handleCloseModal = () => {
        if (isSubmitting) return;
        setModalDecision(null);
        setModalComment("");
    };

    const handleConfirmDecision = async () => {
        if (!modalDecision || isSubmitting) return;
        setIsSubmitting(true);
        setActionError("");
        setActionSuccess("");

        try {
            let updated;
            if (modalDecision === 1) {
                updated = await approveOpinion(id, modalComment.trim());
                setActionSuccess(isAr ? "تم قبول الفتوى بنجاح وفهرستها في الذكاء الاصطناعي." : "Opinion approved successfully.");
            } else if (modalDecision === 2) {
                updated = await rejectOpinion(id, modalComment.trim());
                setActionSuccess(isAr ? "تم رفض الفتوى وإرسال الملاحظات للمستشار." : "Opinion rejected.");
            } else if (modalDecision === 3) {
                updated = await requestRevisionOpinion(id, modalComment.trim());
                setActionSuccess(isAr ? "تم إرسال طلب التعديل للمستشار القانوني بنجاح." : "Revision requested successfully.");
            }

            const statusName =
                modalDecision === 1 ? "Approved" : modalDecision === 2 ? "Rejected" : "RevisionRequired";
            const statusCode = modalDecision === 1 ? 2 : modalDecision === 2 ? 3 : 4;

            setOpinion((prev) => ({
                ...prev,
                ...(updated && typeof updated === "object" ? updated : {}),
                status: statusName,
                statusCode,
                rejectionReason: modalDecision !== 1 ? modalComment.trim() : null,
            }));
            setModalDecision(null);
            setModalComment("");
        } catch (err) {
            setActionError(getErrorMessage(err));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDownloadAttachment = () => {
        if (!opinion?.document?.fileName && !opinion?.attachedFileName) return;
        const fileName = opinion?.document?.fileName || opinion?.attachedFileName;
        downloadDocumentByName(fileName);
    };

    const isApproved = opinion?.status === "Approved" || opinion?.statusCode === 2 || String(opinion?.status).toLowerCase().includes("approved") || String(opinion?.status).includes("معتمد");
    const isRejected = opinion?.status === "Rejected" || opinion?.statusCode === 3 || String(opinion?.status).toLowerCase().includes("rejected") || String(opinion?.status).includes("مرفوض");
    const isRevision = opinion?.status === "RevisionRequired" || opinion?.statusCode === 4 || String(opinion?.status).toLowerCase().includes("revision") || String(opinion?.status).includes("تعديل");
    const isPending = (opinion?.status === "Pending" || opinion?.statusCode === 1 || opinion?.status === "Submitted" || String(opinion?.status).toLowerCase().includes("pending") || String(opinion?.status).includes("انتظار")) && !isApproved && !isRejected && !isRevision;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#070A14] text-slate-900 dark:text-white transition-colors duration-200">
            <Navbar />

            <main className="mx-auto max-w-4xl px-6 py-10 lg:px-8">
                {/* Back Link */}
                <div className="mb-6 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120] px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                    >
                        <BackArrow className="h-4 w-4" />
                        <span>{isAr ? "العودة للفتاوى" : "Back to Opinions"}</span>
                    </button>
                    <Link
                        to="/opinions"
                        className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                        {isAr ? "عرض قائمة الفتاوى الكاملة" : "View All Opinions"}
                    </Link>
                </div>

                {isLoading && (
                    <div className="mt-12 flex flex-col items-center justify-center py-20 text-center">
                        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                        <p className="mt-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
                            {isAr ? "جاري تحميل تفاصيل الفتوى..." : "Loading opinion details..."}
                        </p>
                    </div>
                )}

                {!isLoading && fetchError && (
                    <div className="mt-12 rounded-3xl border border-red-500/20 bg-white dark:bg-[#0B1120] p-10 text-center shadow-xl">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20">
                            <AlertTriangle className="h-7 w-7" />
                        </div>
                        <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
                            {getErrorMessage(fetchError)}
                        </h2>
                        <button
                            type="button"
                            onClick={() => navigate("/opinions")}
                            className="mt-6 inline-flex rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500"
                        >
                            <span>{isAr ? "العودة لقائمة الفتاوى" : "Back to Opinions"}</span>
                        </button>
                    </div>
                )}

                {!isLoading && !fetchError && opinion && (
                    <div className="space-y-8">
                        {/* Status notification */}
                        {actionSuccess && <Alert variant="success">{actionSuccess}</Alert>}
                        {actionError && <Alert>{actionError}</Alert>}

                        {/* Main Opinion Header Card */}
                        <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120]/90 p-8 shadow-xl dark:shadow-[0_15px_35px_rgba(0,0,0,0.4)] backdrop-blur-md">
                            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                                <span className="rounded-full bg-blue-500/10 border border-blue-500/20 px-3.5 py-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                                    ID: #{opinion.id}
                                </span>

                                {/* Status badge */}
                                {isPending && (
                                    <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-3.5 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                                        {isAr ? "بانتظار المراجعة" : "Pending Review"}
                                    </span>
                                )}
                                {isApproved && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                        <Sparkles className="h-3.5 w-3.5" />
                                        {isAr ? "معتمدة ومفهرسة" : "Approved & Indexed"}
                                    </span>
                                )}
                                {isRejected && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 border border-red-500/20 px-3.5 py-1 text-xs font-bold text-red-600 dark:text-red-400">
                                        <XCircle className="h-3.5 w-3.5" />
                                        {isAr ? "مرفوضة" : "Rejected"}
                                    </span>
                                )}
                                {isRevision && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 px-3.5 py-1 text-xs font-bold text-purple-600 dark:text-purple-400">
                                        <RotateCcw className="h-3.5 w-3.5" />
                                        {isAr ? "تتطلب تعديل" : "Revision Required"}
                                    </span>
                                )}
                            </div>

                            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                                {opinion.title}
                            </h1>

                            <div className="mt-4 flex flex-wrap items-center gap-6 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-white/5 pt-4">
                                <span className="flex items-center gap-1.5 font-medium">
                                    <User className="h-4 w-4 text-blue-500" />
                                    <span>{isAr ? "المستشار:" : "Submitted by:"}</span>
                                    <strong className="text-slate-800 dark:text-slate-200">
                                        {opinion.createdByName || opinion.submittedBy || (isAr ? "غير محدد" : "N/A")}
                                    </strong>
                                </span>
                                <span className="flex items-center gap-1.5 font-medium">
                                    <Calendar className="h-4 w-4 text-slate-400" />
                                    <span>{isAr ? "تاريخ التقديم:" : "Date:"}</span>
                                    <strong className="text-slate-800 dark:text-slate-200">
                                        {opinion.createdAt || opinion.submissionDate || (isAr ? "اليوم" : "Today")}
                                    </strong>
                                </span>
                            </div>
                        </div>

                        {/* Original Question Card */}
                        <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120]/90 p-8 shadow-sm backdrop-blur-md">
                            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-white/5 pb-3 mb-4">
                                {isAr ? "السؤال القانوني الأصلي" : "Original Legal Question"}
                            </h2>
                            <p className="text-base font-semibold text-slate-900 dark:text-white leading-relaxed bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-white/10">
                                {opinion.question}
                            </p>
                        </div>

                        {/* Legal Opinion Analysis Card */}
                        <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120]/90 p-8 shadow-xl dark:shadow-[0_15px_35px_rgba(0,0,0,0.4)] backdrop-blur-md">
                            <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/5 pb-4 mb-6">
                                {isAr ? "الرأي القانوني والتحليل" : "Legal Opinion Analysis"}
                            </h2>
                            <div className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-loose whitespace-pre-line font-normal">
                                {opinion.answer}
                            </div>
                        </div>

                        {/* Attachment if exists */}
                        {(opinion.document || opinion.attachedFileName) && (
                            <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120]/90 p-6 shadow-sm backdrop-blur-md">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                                    {isAr ? "المستند الداعم المرفق" : "Attached Supporting Document"}
                                </h3>
                                <div className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4">
                                    <div className="flex items-center gap-3">
                                        <FileText className="h-6 w-6 text-blue-500" />
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                {opinion.document?.fileName || opinion.attachedFileName}
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                {opinion.document?.fileSize
                                                    ? `${Math.round(opinion.document.fileSize / 1024)} KB`
                                                    : opinion.attachedFileSize || "Document"}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleDownloadAttachment}
                                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120] px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10"
                                    >
                                        <Download className="h-3.5 w-3.5" />
                                        <span>{isAr ? "تحميل الملف" : "Download"}</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Rejection or Revision Comments if available */}
                        {opinion.rejectionReason && (
                            <div className={`rounded-3xl border p-6 backdrop-blur-md ${
                                isRevision
                                    ? "border-purple-500/30 bg-purple-500/5"
                                    : "border-red-500/30 bg-red-500/5"
                            }`}>
                                <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${
                                    isRevision ? "text-purple-600 dark:text-purple-400" : "text-red-500"
                                }`}>
                                    {isRevision
                                        ? (isAr ? "ملاحظات التعديل المطلوبة من المدير:" : "Revision Notes:")
                                        : (isAr ? "سبب الرفض:" : "Rejection Reason:")}
                                </p>
                                <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                                    {opinion.rejectionReason}
                                </p>
                            </div>
                        )}

                        {/* Manager Decision Actions Bar (All 3 Cases: Approve, Reject, Revision Required) */}
                        {isManager && isPending && (
                            <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120]/90 p-6 shadow-2xl backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                                        {isAr ? "قرار المدير القانوني" : "Legal Manager Decision"}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {isAr
                                            ? "يمكنك اتخاذ أحد القرارات الثلاثة (قبول، رفض، أو طلب تعديل) مع إضافة تعليق اختياري."
                                            : "Choose one of the 3 decisions (Approve, Reject, or Request Revision) with optional comments."}
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2.5">
                                    {/* Decision 1: Reject */}
                                    <button
                                        type="button"
                                        onClick={() => handleOpenDecisionModal(2)}
                                        disabled={isSubmitting}
                                        className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50"
                                    >
                                        <XCircle className="h-4 w-4" />
                                        <span>{isAr ? "رفض الفتوى" : "Reject"}</span>
                                    </button>

                                    {/* Decision 2: Revision Required */}
                                    <button
                                        type="button"
                                        onClick={() => handleOpenDecisionModal(3)}
                                        disabled={isSubmitting}
                                        className="inline-flex items-center gap-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 py-2.5 text-xs font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 transition-all disabled:opacity-50"
                                    >
                                        <RotateCcw className="h-4 w-4" />
                                        <span>{isAr ? "طلب تعديل" : "Request Revision"}</span>
                                    </button>

                                    {/* Decision 3: Approve */}
                                    <Button
                                        type="button"
                                        onClick={() => handleOpenDecisionModal(1)}
                                        disabled={isSubmitting}
                                        className="w-auto px-5 py-2.5 text-xs bg-emerald-600 hover:bg-emerald-500"
                                    >
                                        <FileCheck className="h-4 w-4" />
                                        <span>{isAr ? "قبول واعتماد الفتوى" : "Approve Opinion"}</span>
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Informational banners when manager already decided on the opinion */}
                        {isManager && isRevision && (
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
                                    <FileCheck className="h-5 w-5 flex-shrink-0" />
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
                    </div>
                )}
            </main>

            {/* Universal Decision Modal for All 3 Cases (with optional comment) */}
            {modalDecision && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
                    <button
                        type="button"
                        onClick={handleCloseModal}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm cursor-default"
                        tabIndex={-1}
                    />

                    <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120] p-8 text-slate-900 dark:text-white shadow-2xl backdrop-blur-md">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/10 mb-4">
                            <div className="flex items-center gap-2.5">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                                    modalDecision === 1
                                        ? "bg-emerald-500/15 text-emerald-500"
                                        : modalDecision === 2
                                        ? "bg-red-500/15 text-red-500"
                                        : "bg-purple-500/15 text-purple-500"
                                }`}>
                                    {modalDecision === 1 && <FileCheck className="h-5 w-5" />}
                                    {modalDecision === 2 && <XCircle className="h-5 w-5" />}
                                    {modalDecision === 3 && <RotateCcw className="h-5 w-5" />}
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold">
                                        {modalDecision === 1 && (isAr ? "قبول واعتماد الفتوى" : "Approve Legal Opinion")}
                                        {modalDecision === 2 && (isAr ? "رفض الفتوى" : "Reject Legal Opinion")}
                                        {modalDecision === 3 && (isAr ? "طلب تعديل الفتوى" : "Request Revision on Opinion")}
                                    </h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {modalDecision === 1 && (isAr ? "سيتم فهرسة الفتوى في الذكاء الاصطناعي." : "Will be indexed into the AI precedent base.")}
                                        {modalDecision === 2 && (isAr ? "سيتم إشعار المستشار برفض الفتوى." : "Advisor will be notified of rejection.")}
                                        {modalDecision === 3 && (isAr ? "ستتاح للمستشار إمكانية تعديل الفتوى وإعادة إرسالها." : "Advisor will be able to edit and resubmit.")}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                <MessageSquare className="h-4 w-4 text-blue-500" />
                                <span>{isAr ? "تعليق وملاحظات إضافية (اختياري):" : "Decision Comments / Notes (Optional):"}</span>
                            </label>
                            <textarea
                                rows={4}
                                value={modalComment}
                                onChange={(e) => setModalComment(e.target.value)}
                                placeholder={
                                    modalDecision === 1
                                        ? (isAr ? "أضف أي توجيهات أو ملاحظات إيجابية للمستشار... (اختياري)" : "Add optional praise or notes...")
                                        : modalDecision === 2
                                        ? (isAr ? "اذكر سبب الرفض لتوجيه المستشار القانوني... (اختياري)" : "State reasons for rejection...")
                                        : (isAr ? "وضح النقاط التي تحتاج لإعادة بحث أو صياغة... (اختياري)" : "Specify areas requiring revision...")
                                }
                                className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0E1528] p-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                            />
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                disabled={isSubmitting}
                                className="rounded-xl border border-slate-200 dark:border-white/10 px-5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                            >
                                {isAr ? "إلغاء" : "Cancel"}
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmDecision}
                                disabled={isSubmitting}
                                className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-lg disabled:opacity-50 ${
                                    modalDecision === 1
                                        ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20"
                                        : modalDecision === 2
                                        ? "bg-red-600 hover:bg-red-500 shadow-red-600/20"
                                        : "bg-purple-600 hover:bg-purple-500 shadow-purple-600/20"
                                }`}
                            >
                                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                <span>
                                    {modalDecision === 1 && (isAr ? "تأكيد الاعتماد" : "Confirm Approval")}
                                    {modalDecision === 2 && (isAr ? "تأكيد الرفض" : "Confirm Rejection")}
                                    {modalDecision === 3 && (isAr ? "إرسال طلب التعديل" : "Send Revision Request")}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
