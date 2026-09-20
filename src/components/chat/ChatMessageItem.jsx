import { useState } from "react";
import {
    User,
    Sparkles,
    Copy,
    Check,
    FileText,
    Download,
    Eye,
    X,
    Loader2,
    Layers,
    BookOpen,
    AlertCircle,
    Bookmark,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { downloadDocumentByName, getDocumentForViewing } from "../../services/searchApi";

/**
 * ChatMessageItem Component
 * Renders individual chat messages for both user and assistant.
 * Handles:
 * - Markdown-like paragraph rendering
 * - Citations block with conditional section / page / action (hidden if null)
 * - Copy to clipboard
 * - Two buttons for each attached file: 1) "عرض المستند" (Preview) and 2) "تحميل المستند" (Download)
 * - Modal preview for documents
 */
export default function ChatMessageItem({ message }) {
    const { lang } = useLanguage();
    const isAr = lang === "ar";

    const [isCopied, setIsCopied] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    // Document Preview Modal State
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedDocName, setSelectedDocName] = useState("");
    const [isViewingDoc, setIsViewingDoc] = useState(false);
    const [docData, setDocData] = useState(null);

    const isUser = message.role === "user";
    const content = message.content || message.answer || "";
    const citations = message.citations || [];
    const isFound = message.found !== false;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(content);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch {
            // fallback
        }
    };

    const handleDownloadSource = async (fileName) => {
        if (!fileName || isDownloading) return;
        setIsDownloading(true);
        try {
            await downloadDocumentByName(fileName);
        } catch {
            // Silently catch or handle error
        } finally {
            setIsDownloading(false);
        }
    };

    const handleViewSource = async (fileName) => {
        if (!fileName) return;
        setSelectedDocName(fileName);
        setViewModalOpen(true);
        setIsViewingDoc(true);
        try {
            const res = await getDocumentForViewing(fileName);
            setDocData(res);
        } catch (err) {
            console.warn("Failed to load document for viewing:", err);
            setDocData({
                type: "text",
                text: isAr
                    ? `المستند المرجعي: "${fileName}"\n\nتنبيه: لا تتوفر معاينة نصية فورية لهذا المستند حالياً. يمكنك استخدام زر "تحميل المستند" لتنزيله والاطلاع على نسخته الأصلية كاملة.`
                    : `Reference Document: "${fileName}"\n\nNotice: Direct preview is currently unavailable for this document. You can click "Download Document" to review the full original file.`,
            });
        } finally {
            setIsViewingDoc(false);
        }
    };

    const formatTimestamp = (dateStr) => {
        if (!dateStr) return "";
        try {
            return new Date(dateStr).toLocaleTimeString(isAr ? "ar-EG" : "en-US", {
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return "";
        }
    };

    if (isUser) {
        return (
            <div className="flex items-start justify-end gap-3 max-w-4xl ms-auto animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="flex flex-col items-end max-w-[85%] sm:max-w-[75%]">
                    <div className="rounded-3xl rounded-tr-xs bg-gradient-to-br from-blue-600 to-indigo-600 px-5 py-3.5 text-sm sm:text-base font-medium text-white shadow-lg shadow-blue-600/15 leading-relaxed">
                        <p className="whitespace-pre-line text-start">{content}</p>
                    </div>
                    {message.timestamp && (
                        <span className="text-[10px] text-slate-400 mt-1 px-2 font-normal">
                            {formatTimestamp(message.timestamp)}
                        </span>
                    )}
                </div>
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-600/25">
                    <User className="h-4 w-4" />
                </div>
            </div>
        );
    }

    // Assistant Message
    return (
        <>
            <div className="flex items-start gap-3 sm:gap-4 max-w-4xl me-auto animate-in fade-in slide-in-from-bottom-2 duration-200">
                {/* AI Avatar */}
                <div className="flex h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-blue-600/20">
                    <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>

                <div className="flex flex-col max-w-[90%] sm:max-w-[82%] space-y-3">
                    <div className="rounded-3xl rounded-tl-xs border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120]/90 p-5 sm:p-6 shadow-xl backdrop-blur-md space-y-4">
                        {/* Header bar of the assistant message */}
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-900 dark:text-white">
                                    {isAr ? "المساعد القانوني الذكي" : "Legal AI Assistant"}
                                </span>
                                <span className="rounded-full bg-blue-500/10 border border-blue-500/25 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                                    AI RAG
                                </span>
                            </div>

                            {/* Copy Button */}
                            <button
                                type="button"
                                onClick={handleCopy}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-all cursor-pointer"
                                title={isAr ? "نسخ الإجابة" : "Copy answer"}
                            >
                                {isCopied ? (
                                    <>
                                        <Check className="h-3 w-3 text-emerald-500" />
                                        <span className="text-[11px] text-emerald-500">{isAr ? "تم النسخ" : "Copied"}</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-3 w-3 text-slate-400" />
                                        <span className="text-[11px]">{isAr ? "نسخ" : "Copy"}</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Answer text */}
                        {!isFound ? (
                            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs sm:text-sm text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
                                <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold">
                                        {isAr ? "لا توجد سوابق مطابقة في السجلات" : "No precedents found"}
                                    </p>
                                    <p className="mt-1 text-slate-600 dark:text-slate-300">
                                        {content ||
                                            (isAr
                                                ? "لم يتم العثور على إجابة قاطعة في السجلات والوثائق القانونية المتاحة حالياً، يمكنك إعادة صياغة السؤال بمصطلحات قانونية مختلفة."
                                                : "No matching legal answer was found in indexed documents. Try rephrasing your legal query.")}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-loose whitespace-pre-line font-normal">
                                {content}
                            </div>
                        )}

                        {/* Citations & Evidence Section */}
                        {citations && citations.length > 0 && (
                            <div className="pt-3 border-t border-slate-100 dark:border-white/5 space-y-2.5">
                                <p className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    <Bookmark className="h-3.5 w-3.5 text-blue-500" />
                                    <span>{isAr ? "المراجع والاستشهادات القانونية المعتمدة:" : "Legal Citations & Sources:"}</span>
                                </p>

                                <div className="grid grid-cols-1 gap-2">
                                    {citations.map((cit, idx) => {
                                        const marker = cit.marker || `[${idx + 1}]`;
                                        const source = cit.source || cit.documentName || "";
                                        const section =
                                            cit.section && cit.section !== "null" && cit.section !== "undefined"
                                                ? String(cit.section).trim()
                                                : null;
                                        const page =
                                            cit.page !== null && cit.page !== undefined && String(cit.page) !== "null"
                                                ? cit.page
                                                : null;
                                        const action =
                                            cit.action && cit.action !== "null" && cit.action !== "undefined"
                                                ? String(cit.action).trim()
                                                : null;

                                        return (
                                            <div
                                                key={idx}
                                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.03] p-3 text-xs"
                                            >
                                                <div className="flex flex-wrap items-center gap-2 min-w-0 flex-1">
                                                    {/* Citation Marker */}
                                                    <span className="inline-flex items-center justify-center rounded-lg bg-blue-600/15 border border-blue-500/30 px-2 py-0.5 text-xs font-extrabold text-blue-600 dark:text-blue-400">
                                                        {marker}
                                                    </span>

                                                    {/* Source file name */}
                                                    {source && (
                                                        <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                                                            <FileText className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                                                            <span className="truncate max-w-[180px] sm:max-w-[280px]" title={source}>
                                                                {source}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Section (Only shown if NOT null) */}
                                                    {section && (
                                                        <span className="inline-flex items-center gap-1 rounded-md bg-purple-500/10 border border-purple-500/25 px-2 py-0.5 text-[11px] font-semibold text-purple-600 dark:text-purple-400">
                                                            <Layers className="h-3 w-3" />
                                                            <span>{section}</span>
                                                        </span>
                                                    )}

                                                    {/* Page (Only shown if NOT null) */}
                                                    {page && (
                                                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-200 dark:bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                                            <BookOpen className="h-3 w-3" />
                                                            <span>{isAr ? `ص ${page}` : `p. ${page}`}</span>
                                                        </span>
                                                    )}

                                                    {/* Action (Only shown if NOT null) */}
                                                    {action && (
                                                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                                            <span>{action}</span>
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Two Action Buttons: 1) View Document and 2) Download Document */}
                                                {source && (
                                                    <div className="flex items-center gap-2 flex-shrink-0">
                                                        {/* زر عرض المستند */}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleViewSource(source)}
                                                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0E1528] px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer shadow-xs"
                                                            title={isAr ? "عرض المستند" : "View Document"}
                                                        >
                                                            <Eye className="h-3.5 w-3.5 text-blue-500" />
                                                            <span>{isAr ? "عرض المستند" : "View Document"}</span>
                                                        </button>

                                                        {/* زر تحميل المستند */}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDownloadSource(source)}
                                                            disabled={isDownloading}
                                                            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
                                                            title={isAr ? "تحميل المستند" : "Download Document"}
                                                        >
                                                            {isDownloading ? (
                                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                            ) : (
                                                                <Download className="h-3.5 w-3.5" />
                                                            )}
                                                            <span>{isAr ? "تحميل المستند" : "Download"}</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {message.timestamp && (
                        <span className="text-[10px] text-slate-400 px-2 font-normal">
                            {formatTimestamp(message.timestamp)}
                        </span>
                    )}
                </div>
            </div>

            {/* Document Preview Modal */}
            {viewModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="relative w-full max-w-3xl max-h-[88vh] flex flex-col rounded-3xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#0B1120] shadow-2xl overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 p-4 sm:p-5 bg-slate-50/80 dark:bg-white/[0.02]">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-blue-600/15 text-blue-500">
                                    <FileText className="h-4 w-4" />
                                </div>
                                <div className="min-w-0">
                                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                                        {isAr ? "معاينة المستند المعتمد" : "Document Preview"}
                                    </span>
                                    <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-md" title={selectedDocName}>
                                        {selectedDocName}
                                    </h3>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setViewModalOpen(false)}
                                className="rounded-xl p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Content Body */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                            {isViewingDoc ? (
                                <div className="py-20 text-center space-y-3">
                                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-500" />
                                    <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400">
                                        {isAr ? "جارٍ قراءة المستند..." : "Loading document preview..."}
                                    </p>
                                </div>
                            ) : docData?.type === "pdf" && docData?.url ? (
                                <div className="w-full h-[60vh] rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-900 shadow-inner">
                                    <iframe src={docData.url} title={selectedDocName} className="w-full h-full border-none" />
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/60 text-slate-800 dark:text-slate-200 p-5 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                                    {docData?.text || (isAr ? "لا يتوفر محتوى نصي مباشر لهذا المستند." : "No direct text content available.")}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-2.5 border-t border-slate-200 dark:border-white/10 p-3 sm:p-4 bg-slate-50/80 dark:bg-white/[0.02]">
                            <button
                                type="button"
                                onClick={() => setViewModalOpen(false)}
                                className="rounded-xl border border-slate-200 dark:border-white/15 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                            >
                                {isAr ? "إغلاق" : "Close"}
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDownloadSource(selectedDocName)}
                                disabled={isDownloading}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
                            >
                                {isDownloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                                <span>{isAr ? "تحميل المستند" : "Download Document"}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
