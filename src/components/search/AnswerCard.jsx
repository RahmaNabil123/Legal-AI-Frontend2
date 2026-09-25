import { useState, useEffect } from "react";
import {
    Sparkles,
    CheckCircle2,
    FileText,
    Download,
    Eye,
    X,
    Loader2,
    FileCheck2,
    Scale,
    AlertCircle,
    HelpCircle,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import {
    getDocumentForViewing,
    downloadDocumentByName,
} from "../../services/searchApi";

export default function AnswerCard({
    answer,
    source,
    selected_legal_evidence,
}) {
    const { lang, t } = useLanguage();

    const isAr = lang === "ar";

    // Primary source document filename (from real backend response)
    const effectiveSource =
        source ||
        selected_legal_evidence?.[0]?.source ||
        selected_legal_evidence?.[0]?.fileName ||
        "";

    const fileExt = (effectiveSource.split(".").pop() || "txt").toLowerCase();

    // Document Modal State
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [docData, setDocData] = useState(null);
    const [docContent, setDocContent] = useState("");
    const [isViewing, setIsViewing] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [docError, setDocError] = useState("");
    const [viewRaw, setViewRaw] = useState(false);

    // Citations highlighting
    const [highlightedCitation, setHighlightedCitation] = useState(null);

    // Close modal on Escape
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") setViewModalOpen(false);
        };
        if (viewModalOpen) {
            window.addEventListener("keydown", handleKeyDown);
        }
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [viewModalOpen]);

    // Action: View Document
    const handleViewDocument = async (fileName) => {
        setIsViewing(true);
        setDocError("");
        setViewModalOpen(true);
        try {
            const result = await getDocumentForViewing(fileName);
            setDocData(result);
            setDocContent(result.text || "");
        } catch (err) {
            setDocError(err.message || (isAr ? "فشل جلب محتوى المستند." : "Failed to load document content."));
        } finally {
            setIsViewing(false);
        }
    };

    // Action: Download Document
    const handleDownloadDocument = async (fileName) => {
        setIsDownloading(true);
        try {
            await downloadDocumentByName(fileName);
        } finally {
            setIsDownloading(false);
        }
    };

    // Parse Question & Answer from raw document text if structured (as in backend Q&A files)
    const parseDocContent = (text) => {
        if (!text) return null;
        const qMatch = text.match(/Question:\s*([\s\S]*?)(?=Answer:|$)/i);
        const aMatch = text.match(/Answer:\s*([\s\S]*)/i);

        if (qMatch && aMatch) {
            return {
                question: qMatch[1].trim(),
                answer: aMatch[1].trim(),
            };
        }
        return null;
    };

    const parsedQA = parseDocContent(docContent);

    // Formatted answer with clickable citation tags [1], [2]
    const renderFormattedAnswer = (text) => {
        if (!text) return null;
        const parts = text.split(/(\[\d+\])/g);

        return parts.map((part, index) => {
            const match = part.match(/\[(\d+)\]/);
            if (match) {
                const citationKey = part;
                const isHighlighted = highlightedCitation === citationKey;

                return (
                    <button
                        key={index}
                        type="button"
                        onClick={() => {
                            setHighlightedCitation(citationKey);
                            const el = document.getElementById(`evidence-${citationKey}`);
                            if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                        }}
                        className={`inline-flex items-center justify-center mx-1 px-2 py-0.5 text-xs font-extrabold rounded-md transition-all cursor-pointer ${
                            isHighlighted
                                ? "bg-blue-600 text-white ring-2 ring-blue-400 scale-110 shadow-md"
                                : "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 hover:bg-blue-500 hover:text-white"
                        }`}
                        title={isAr ? `الانتقال إلى المرجع ${part}` : `Jump to Citation ${part}`}
                    >
                        {part}
                    </button>
                );
            }
            return <span key={index}>{part}</span>;
        });
    };

    return (
        <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120]/85 p-6 sm:p-8 shadow-xl dark:shadow-[0_15px_35px_rgba(0,0,0,0.4)] backdrop-blur-md">
            {/* 1. Card Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-5">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/20 text-blue-500 border border-blue-500/30">
                        <Sparkles className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                        {t.search?.answer?.heading || (isAr ? "التحليل والإجابة الذكية المستخلصة" : "Synthesized Legal Answer")}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>{isAr ? "سابقة قضائية موثقة" : "Verified Precedent"}</span>
                    </span>
                </div>
            </div>

            {/* 2. Main AI Synthesized Answer */}
            <div className="mt-6">
                <div className="rounded-2xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/5 p-5 sm:p-6">
                    <p className="text-base sm:text-lg leading-relaxed text-slate-800 dark:text-slate-100 font-normal">
                        {renderFormattedAnswer(answer)}
                    </p>
                </div>
            </div>

            {/* 3. Source Document & Direct Actions (تحت على جنب: الإطلاع والتحميل) */}
            {effectiveSource && (
                <div className="mt-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-[#0E1528] p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
                    {/* Source Information */}
                    <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-500 border border-blue-500/30">
                            <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    {isAr ? "المستند المصدري المعتمد:" : "Verified Source Document:"}
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                    <FileCheck2 className="h-3 w-3" />
                                    <span>{isAr ? "موثق" : "Verified"}</span>
                                </span>
                            </div>
                            <p
                                className="font-mono text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate"
                                title={effectiveSource}
                            >
                                {effectiveSource}
                            </p>
                        </div>
                    </div>

                    {/* Actions: "دول تحت على جنب" */}
                    <div className="flex items-center gap-2.5 w-full md:w-auto justify-end flex-shrink-0">
                        {/* 1. زر الاطلاع على المستند */}
                        <button
                            type="button"
                            onClick={() => handleViewDocument(effectiveSource)}
                            disabled={isViewing}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#0B1120] hover:bg-slate-100 dark:hover:bg-white/10 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 shadow-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
                        >
                            {isViewing ? (
                                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                            ) : (
                                <Eye className="h-4 w-4 text-blue-500" />
                            )}
                            <span>{isAr ? "الاطلاع على المستند" : "View Document"}</span>
                        </button>

                        {/* 2. زر تحميل المستند */}
                        <button
                            type="button"
                            onClick={() => handleDownloadDocument(effectiveSource)}
                            disabled={isDownloading}
                            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-blue-600/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
                        >
                            {isDownloading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Download className="h-4 w-4" />
                            )}
                            <span>{isAr ? "تحميل المستند" : "Download Document"}</span>
                        </button>
                    </div>
                </div>
            )}

            {/* 4. Bottom Verified Footer */}
            <div className="mt-8 flex items-center justify-between border-t border-slate-200 dark:border-white/10 pt-4 text-xs text-slate-400 dark:text-slate-500">
                <div className="flex items-center gap-2">
                    <FileCheck2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span>
                        {isAr
                            ? "تم التحقق والاستشهاد بالنصوص المعتمدة في السجلات القضائية"
                            : "Verified with authenticated judicial sources"}
                    </span>
                </div>
                <span className="font-semibold text-blue-500">Legal AI Precedent Engine</span>
            </div>

            {/* 5. Document Viewer Modal (معاينة المستند القانوني بالكامل) */}
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
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                                            {isAr ? "معاينة المستند المصدري" : "Source Document Preview"}
                                        </span>
                                        <span className="rounded-full bg-slate-200 dark:bg-white/10 px-2 py-0.5 text-[10px] font-mono text-slate-600 dark:text-slate-300">
                                            .{fileExt}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate" title={effectiveSource}>
                                        {effectiveSource}
                                    </h3>
                                </div>
                            </div>

                            {/* Header Actions - Only Close Button */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setViewModalOpen(false)}
                                    className="rounded-xl p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                                    aria-label="Close"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
                            {isViewing ? (
                                <div className="py-16 text-center space-y-4">
                                    <Loader2 className="mx-auto h-10 w-10 animate-spin text-blue-500" />
                                    <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
                                        {isAr ? "جارٍ جلب وقراءة المستند من خادم المنظومة..." : "Loading document from server..."}
                                    </p>
                                </div>
                            ) : docError ? (
                                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center space-y-3">
                                    <AlertCircle className="mx-auto h-8 w-8 text-red-500" />
                                    <p className="text-sm font-bold text-red-500">{docError}</p>
                                    <button
                                        type="button"
                                        onClick={() => handleViewDocument(effectiveSource)}
                                        className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-500"
                                    >
                                        {isAr ? "إعادة المحاولة" : "Try Again"}
                                    </button>
                                </div>
                            ) : docData?.type === "pdf" ? (
                                /* PDF Preview with iframe */
                                <div className="w-full h-[65vh] rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-900 shadow-inner">
                                    <iframe
                                        src={docData.url}
                                        title={effectiveSource}
                                        className="w-full h-full border-none"
                                    />
                                </div>
                            ) : (
                                <>
                                    {/* Toggle between structured Q&A and Raw Text if parsed */}
                                    {parsedQA && (
                                        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10">
                                            <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400">
                                                {isAr ? "طريقة العرض:" : "View Mode:"}
                                            </span>
                                            <div className="inline-flex rounded-xl bg-slate-100 dark:bg-white/5 p-1 border border-slate-200 dark:border-white/10">
                                                <button
                                                    type="button"
                                                    onClick={() => setViewRaw(false)}
                                                    className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                                                        !viewRaw
                                                            ? "bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-sm"
                                                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                                                    }`}
                                                >
                                                    {isAr ? "عرض منسق" : "Formatted"}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setViewRaw(true)}
                                                    className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                                                        viewRaw
                                                            ? "bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-sm"
                                                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                                                    }`}
                                                >
                                                    {isAr ? "النص الخام" : "Raw"}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {!viewRaw && parsedQA ? (
                                        /* Formatted Structured View */
                                        <div className="space-y-6">
                                            {/* Question Box */}
                                            <div className="rounded-2xl border border-blue-500/30 bg-blue-500/5 p-5 sm:p-6 space-y-2">
                                                <div className="flex items-center gap-2 text-xs font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                                                    <HelpCircle className="h-4 w-4" />
                                                    <span>{isAr ? "السؤال القانوني المدون بالمستند" : "Document Question"}</span>
                                                </div>
                                                <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                                                    {parsedQA.question}
                                                </p>
                                            </div>

                                            {/* Answer Box */}
                                            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] p-5 sm:p-6 space-y-3">
                                                <div className="flex items-center gap-2 text-xs font-extrabold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                                                    <Scale className="h-4 w-4" />
                                                    <span>{isAr ? "الرأي والحكم القانوني المعتمد" : "Legal Ruling & Answer"}</span>
                                                </div>
                                                <div className="text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-line font-normal">
                                                    {parsedQA.answer}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        /* Raw Document Text View (Exact verbatim output matching Postman) */
                                        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-900 text-slate-100 p-5 sm:p-6 font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto whitespace-pre-wrap">
                                            {docContent}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end gap-3 border-t border-slate-200 dark:border-white/10 p-4 sm:p-5 bg-slate-50/80 dark:bg-white/[0.02] text-xs">
                            <button
                                type="button"
                                onClick={() => setViewModalOpen(false)}
                                className="rounded-xl border border-slate-300 dark:border-white/15 px-4 py-2 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                            >
                                {isAr ? "إغلاق" : "Close"}
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDownloadDocument(effectiveSource)}
                                disabled={isDownloading}
                                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2 font-bold text-white shadow-md shadow-blue-600/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                            >
                                {isDownloading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Download className="h-4 w-4" />
                                )}
                                <span>{isAr ? "تحميل الملف" : "Download File"}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}