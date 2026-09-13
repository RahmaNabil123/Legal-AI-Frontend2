import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    ArrowLeft,
    ArrowRight,
    Building,
    Calendar,
    Download,
    Printer,
    Scale,
    Shield,
    Sparkles,
    FileText,
    Share2,
    CheckCircle2,
    AlertTriangle,
    Loader2,
} from "lucide-react";

import Navbar from "../../components/home/Navbar";
import { getDocumentById } from "../../services/searchApi";
import { useLanguage } from "../../context/LanguageContext";
import { getErrorMessage } from "../../services/apiError";

export default function DocumentDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t, dir } = useLanguage();

    const [document, setDocument] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const d = t.documentDetail || {};
    const BackArrow = dir === "rtl" ? ArrowRight : ArrowLeft;

    useEffect(() => {
        let isMounted = true;
        async function fetchDoc() {
            setIsLoading(true);
            setError(null);
            try {
                const data = await getDocumentById(id);
                if (isMounted) setDocument(data);
            } catch (err) {
                if (isMounted) setError(err);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        }
        fetchDoc();
        return () => {
            isMounted = false;
        };
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        if (!document) return;
        const element = window.document.createElement("a");
        const file = new Blob([document.fullContent || document.summary || ""], { type: "text/plain;charset=utf-8" });
        element.href = URL.createObjectURL(file);
        element.download = `${document.referenceNumber || "Legal_Document"}.txt`;
        window.document.body.appendChild(element);
        element.click();
        window.document.body.removeChild(element);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#070A14] text-slate-900 dark:text-white transition-colors duration-200">
            <Navbar />

            <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
                {/* Back navigation & Actions bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120] px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-all active:scale-95"
                    >
                        <BackArrow className="h-4 w-4" />
                        <span>{d.backToSearch || "Back"}</span>
                    </button>

                    {document && (
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={handlePrint}
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120] px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                            >
                                <Printer className="h-4 w-4 text-slate-500" />
                                <span>{d.print || "Print"}</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleDownload}
                                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all active:scale-95"
                            >
                                <Download className="h-4 w-4" />
                                <span>{d.downloadPdf || "Download"}</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="mt-12 flex flex-col items-center justify-center py-20 text-center">
                        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                        <p className="mt-4 text-base font-semibold text-slate-600 dark:text-slate-300">
                            {d.loading || "Loading document..."}
                        </p>
                    </div>
                )}

                {/* Error / Not Found State */}
                {!isLoading && error && (
                    <div className="mt-12 mx-auto max-w-xl rounded-3xl border border-red-500/20 bg-white dark:bg-[#0B1120] p-10 text-center shadow-xl">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20">
                            <AlertTriangle className="h-7 w-7" />
                        </div>
                        <h2 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
                            {d.notFoundTitle || "Document Not Found"}
                        </h2>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                            {getErrorMessage(error)}
                        </p>
                        <button
                            type="button"
                            onClick={() => navigate("/search")}
                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500"
                        >
                            <span>{d.backToSearch || "Back to Search"}</span>
                        </button>
                    </div>
                )}

                {/* Document Viewer Content */}
                {!isLoading && !error && document && (
                    <div className="mt-8 grid gap-8 lg:grid-cols-12">
                        {/* Main Document Content Column */}
                        <div className="lg:col-span-8 space-y-8">
                            {/* Document Header Card */}
                            <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120]/90 p-8 shadow-xl dark:shadow-[0_15px_35px_rgba(0,0,0,0.4)] backdrop-blur-md">
                                <div className="flex flex-wrap items-center gap-3 mb-4">
                                    <span className="rounded-full bg-blue-500/10 border border-blue-500/20 px-3.5 py-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                                        {document.caseNumber}
                                    </span>
                                    <span className="rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        {document.documentType || "Judicial Ruling"}
                                    </span>
                                    {document.status && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                            {document.status}
                                        </span>
                                    )}
                                </div>

                                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                                    {document.title}
                                </h1>

                                <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                                    {document.referenceNumber && (
                                        <span className="me-3 font-mono">
                                            {d.referenceNumber}: <strong>{document.referenceNumber}</strong>
                                        </span>
                                    )}
                                </p>
                            </div>

                            {/* Core Issue & Legal Holding */}
                            <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120]/90 p-8 shadow-sm backdrop-blur-md space-y-6">
                                <div>
                                    <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
                                        <Scale className="h-5 w-5 text-blue-500" />
                                        <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                                            {d.keyLegalIssue || "Core Legal Question"}
                                        </h2>
                                    </div>
                                    <p className="mt-3 text-base leading-relaxed text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-white/10 font-medium">
                                        {document.issue}
                                    </p>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
                                        <Shield className="h-5 w-5 text-emerald-500" />
                                        <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                                            {d.holding || "Legal Principle & Holding"}
                                        </h2>
                                    </div>
                                    <p className="mt-3 text-base leading-relaxed text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-white/10">
                                        {document.holding}
                                    </p>
                                </div>
                            </div>

                            {/* Full Ruling Text Viewer */}
                            <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120]/90 p-8 shadow-xl dark:shadow-[0_15px_35px_rgba(0,0,0,0.4)] backdrop-blur-md">
                                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4 mb-6">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-blue-500" />
                                        <h2 className="text-base font-bold text-slate-900 dark:text-white">
                                            {d.fullContent || "Complete Ruling Content"}
                                        </h2>
                                    </div>
                                    <span className="text-xs text-slate-400 font-mono">Authenticated Copy</span>
                                </div>

                                <div className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-loose whitespace-pre-line font-normal">
                                    {document.fullContent || document.summary}
                                </div>
                            </div>
                        </div>

                        {/* Metadata Sidebar Column */}
                        <div className="lg:col-span-4 space-y-6">
                            {/* Case Information Card */}
                            <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120]/90 p-6 shadow-sm backdrop-blur-md sticky top-24">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-white/5 pb-3">
                                    Document Metadata
                                </h3>

                                <dl className="mt-4 space-y-4 text-sm">
                                    <div>
                                        <dt className="text-xs font-medium text-slate-400 dark:text-slate-500">{d.court}</dt>
                                        <dd className="mt-1 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <Building className="h-4 w-4 text-blue-500" />
                                            <span>{document.court}</span>
                                        </dd>
                                    </div>

                                    <div>
                                        <dt className="text-xs font-medium text-slate-400 dark:text-slate-500">{d.date}</dt>
                                        <dd className="mt-1 font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-slate-400" />
                                            <span>{document.date || document.year}</span>
                                        </dd>
                                    </div>

                                    {document.parties && (
                                        <div>
                                            <dt className="text-xs font-medium text-slate-400 dark:text-slate-500">{d.parties}</dt>
                                            <dd className="mt-1 font-semibold text-slate-800 dark:text-slate-200">
                                                {document.parties}
                                            </dd>
                                        </div>
                                    )}

                                    {document.relevance && (
                                        <div>
                                            <dt className="text-xs font-medium text-slate-400 dark:text-slate-500">{d.relevanceScore}</dt>
                                            <dd className="mt-1 flex items-center gap-2">
                                                <div className="h-2 flex-1 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                                                    <div
                                                        className="h-full bg-emerald-500 rounded-full"
                                                        style={{ width: `${document.relevance}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-bold text-emerald-500">{document.relevance}%</span>
                                            </dd>
                                        </div>
                                    )}
                                </dl>

                                <div className="mt-6 border-t border-slate-100 dark:border-white/5 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleDownload}
                                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all active:scale-95"
                                    >
                                        <Download className="h-4 w-4" />
                                        <span>{d.downloadPdf || "Download"}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
