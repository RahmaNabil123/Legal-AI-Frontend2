import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    CheckCircle2,
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
    Shield,
} from "lucide-react";

import Navbar from "../../components/home/Navbar";
import Button from "../../components/Button/Button";
import Alert from "../../components/Alert/Alert";
import { getOpinionById, approveOpinion, rejectOpinion } from "../../services/opinionApi";
import { getErrorMessage } from "../../services/apiError";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";

export default function ReviewOpinionPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t, dir } = useLanguage();
    const { isManager } = useAuth();

    const ro = t.reviewOpinion || {};
    const BackArrow = dir === "rtl" ? ArrowRight : ArrowLeft;

    const [opinion, setOpinion] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    const [isApproving, setIsApproving] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [actionError, setActionError] = useState("");
    const [actionSuccess, setActionSuccess] = useState("");

    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");

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

    const handleApprove = async () => {
        if (isApproving || isRejecting) return;
        setIsApproving(true);
        setActionError("");
        setActionSuccess("");

        try {
            const updated = await approveOpinion(id);
            setOpinion(updated);
            setActionSuccess(ro.successApproved || "Opinion approved and queued for AI indexing.");
        } catch (err) {
            setActionError(getErrorMessage(err));
        } finally {
            setIsApproving(false);
        }
    };

    const handleConfirmReject = async () => {
        if (!rejectionReason.trim()) return;
        setIsRejecting(true);
        setActionError("");
        setActionSuccess("");

        try {
            const updated = await rejectOpinion(id, rejectionReason.trim());
            setOpinion(updated);
            setShowRejectModal(false);
            setActionSuccess(ro.successRejected || "Opinion rejected and feedback sent.");
        } catch (err) {
            setActionError(getErrorMessage(err));
        } finally {
            setIsRejecting(false);
        }
    };

    const isPending = opinion?.status === "Pending";
    const isApproved = opinion?.status === "Approved";
    const isRejected = opinion?.status === "Rejected";

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#070A14] text-slate-900 dark:text-white transition-colors duration-200">
            <Navbar />

            <main className="mx-auto max-w-4xl px-6 py-10 lg:px-8">
                {/* Back Link */}
                <div className="mb-6 flex items-center justify-between">
                    <Link
                        to="/review-queue"
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120] px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                    >
                        <BackArrow className="h-4 w-4" />
                        <span>{ro.queueTitle || "Review Queue"}</span>
                    </Link>
                </div>

                {isLoading && (
                    <div className="mt-12 flex flex-col items-center justify-center py-20 text-center">
                        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                        <p className="mt-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
                            {ro.loading || "Loading opinion details..."}
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
                        <Link
                            to="/review-queue"
                            className="mt-6 inline-flex rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500"
                        >
                            {ro.queueTitle || "Back to Queue"}
                        </Link>
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
                                    ID: {opinion.id}
                                </span>

                                {/* Status badge */}
                                {isPending && (
                                    <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-3.5 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                                        {ro.statusPending || "Pending Review"}
                                    </span>
                                )}
                                {isApproved && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                        <Sparkles className="h-3.5 w-3.5" />
                                        {ro.statusApproved || "Approved & Indexed"}
                                    </span>
                                )}
                                {isRejected && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 border border-red-500/20 px-3.5 py-1 text-xs font-bold text-red-600 dark:text-red-400">
                                        <XCircle className="h-3.5 w-3.5" />
                                        {ro.statusRejected || "Rejected"}
                                    </span>
                                )}
                            </div>

                            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                                {opinion.title}
                            </h1>

                            <div className="mt-4 flex flex-wrap items-center gap-6 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-white/5 pt-4">
                                <span className="flex items-center gap-1.5 font-medium">
                                    <User className="h-4 w-4 text-blue-500" />
                                    {ro.submittedBy}: <strong className="text-slate-800 dark:text-slate-200">{opinion.submittedBy}</strong>
                                </span>
                                <span className="flex items-center gap-1.5 font-medium">
                                    <Calendar className="h-4 w-4 text-slate-400" />
                                    {ro.submissionDate}: <strong className="text-slate-800 dark:text-slate-200">{opinion.submissionDate}</strong>
                                </span>
                            </div>
                        </div>

                        {/* Original Question Card */}
                        <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120]/90 p-8 shadow-sm backdrop-blur-md">
                            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-white/5 pb-3 mb-4">
                                {ro.originalQuestion || "Original Legal Question"}
                            </h2>
                            <p className="text-base font-semibold text-slate-900 dark:text-white leading-relaxed bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-white/10">
                                "{opinion.question}"
                            </p>
                        </div>

                        {/* Legal Opinion Analysis Card */}
                        <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120]/90 p-8 shadow-xl dark:shadow-[0_15px_35px_rgba(0,0,0,0.4)] backdrop-blur-md">
                            <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/5 pb-4 mb-6">
                                {ro.advisorOpinion || "Legal Advisor Analysis"}
                            </h2>
                            <div className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-loose whitespace-pre-line font-normal">
                                {opinion.answer}
                            </div>
                        </div>

                        {/* Attachment if exists */}
                        {opinion.attachedFileName && (
                            <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120]/90 p-6 shadow-sm backdrop-blur-md">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                                    {ro.attachment || "Attached Supporting Document"}
                                </h3>
                                <div className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4">
                                    <div className="flex items-center gap-3">
                                        <FileText className="h-6 w-6 text-blue-500" />
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">{opinion.attachedFileName}</p>
                                            <p className="text-xs text-slate-400">{opinion.attachedFileSize || "Document"}</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120] px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10"
                                    >
                                        <Download className="h-3.5 w-3.5" />
                                        <span>Download</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Rejection Note if Rejected */}
                        {isRejected && opinion.rejectionReason && (
                            <div className="rounded-3xl border border-red-500/30 bg-red-500/5 p-6 backdrop-blur-md">
                                <p className="text-xs font-bold uppercase tracking-wider text-red-500 mb-2">
                                    {ro.rejectReasonLabel || "Rejection Reason"}
                                </p>
                                <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                                    {opinion.rejectionReason}
                                </p>
                            </div>
                        )}

                        {/* Manager Decision Actions Bar (Only when Pending) */}
                        {isPending && (
                            <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120]/90 p-6 shadow-2xl backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                                        Decision & Approval Workflow
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Approving will immediately index this opinion for all enterprise users.
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowRejectModal(true)}
                                        disabled={isApproving || isRejecting}
                                        className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-2.5 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50"
                                    >
                                        {ro.rejectBtn || "Reject with Reason"}
                                    </button>

                                    <Button
                                        type="button"
                                        onClick={handleApprove}
                                        isLoading={isApproving}
                                        disabled={isRejecting}
                                        className="w-auto px-6 py-2.5"
                                    >
                                        <FileCheck className="h-4 w-4" />
                                        <span>{ro.approveBtn || "Approve & Index into AI"}</span>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Rejection Modal Dialog */}
            {showRejectModal && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
                    <button
                        type="button"
                        onClick={() => setShowRejectModal(false)}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        tabIndex={-1}
                    />

                    <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120] p-8 text-slate-900 dark:text-white shadow-2xl backdrop-blur-md">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            {ro.confirmRejectTitle || "Reject Legal Opinion?"}
                        </h2>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                            {ro.confirmRejectDesc || "Please specify the reason for rejection to guide the Legal Advisor."}
                        </p>

                        <div className="mt-4">
                            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                {ro.rejectReasonLabel || "Rejection Reason"}
                            </label>
                            <textarea
                                rows={4}
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder={ro.rejectReasonPlaceholder || "State reasons for rejection..."}
                                className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0E1528] p-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
                            />
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowRejectModal(false)}
                                disabled={isRejecting}
                                className="rounded-xl border border-slate-200 dark:border-white/10 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                            >
                                {ro.cancel || "Cancel"}
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmReject}
                                disabled={!rejectionReason.trim() || isRejecting}
                                className="rounded-xl bg-red-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-600/25 hover:bg-red-500 disabled:opacity-50"
                            >
                                {isRejecting ? (ro.rejectingBtn || "Submitting...") : (ro.confirm || "Confirm Reject")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
