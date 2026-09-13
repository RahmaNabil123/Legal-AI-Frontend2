import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    HelpCircle,
    FilePenLine,
    Trash2,
    Search,
    User,
    Calendar,
    ArrowRight,
    ArrowLeft,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Sparkles,
    Inbox,
} from "lucide-react";
import Navbar from "../../components/home/Navbar";
import Alert from "../../components/Alert/Alert";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { getUnknownQuestions, deleteUnknownQuestion } from "../../services/opinionApi";

export default function UnknownQuestionsPage() {
    const { lang, dir } = useLanguage();
    const { isAdvisor } = useAuth();
    const navigate = useNavigate();

    const isAr = lang === "ar";
    const isRtl = dir === "rtl";
    const BackArrow = isRtl ? ArrowRight : ArrowLeft;

    const [questions, setQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Modal delete confirmation
    const [deleteModalQuestion, setDeleteModalQuestion] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const loadQuestions = useCallback(async () => {
        setIsLoading(true);
        setError("");
        try {
            const data = await getUnknownQuestions();
            setQuestions(Array.isArray(data) ? data : []);
        } catch {
            setError(isAr ? "تعذر جلب قائمة الأسئلة المعلقة من الخادم." : "Failed to load unanswered questions.");
        } finally {
            setIsLoading(false);
        }
    }, [isAr]);

    useEffect(() => {
        loadQuestions();
    }, [loadQuestions]);

    const handleDeleteQuestion = async () => {
        if (!deleteModalQuestion) return;
        setIsDeleting(true);
        setError("");
        setSuccessMessage("");

        try {
            await deleteUnknownQuestion(deleteModalQuestion.id);
            setQuestions((prev) => prev.filter((q) => q.id !== deleteModalQuestion.id));
            setSuccessMessage(isAr ? "تم حذف السؤال بنجاح من القائمة." : "Question removed from list successfully.");
            setDeleteModalQuestion(null);
        } catch {
            setError(isAr ? "فشل حذف السؤال، يرجى المحاولة مرة أخرى." : "Failed to delete question.");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleAnswerQuestion = (q) => {
        navigate("/legal-opinion", {
            state: {
                question: q.question,
                unknownQuestionId: q.id,
            },
        });
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        try {
            return new Date(dateStr).toLocaleDateString(isAr ? "ar-EG" : "en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return dateStr;
        }
    };

    // Filter questions by search
    const filteredQuestions = questions.filter((q) => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
            q.question?.toLowerCase().includes(query) ||
            q.askedByName?.toLowerCase().includes(query)
        );
    });

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#070A14] text-slate-900 dark:text-white transition-colors duration-200">
            <Navbar />

            <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">
                {/* Navigation Back */}
                <div className="flex items-center justify-between">
                    <Link
                        to="/opinions"
                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120] px-4 py-2 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-all shadow-sm"
                    >
                        <BackArrow className="h-4 w-4" />
                        <span>{isAr ? "العودة للفتاوى القانونية" : "Back to Opinions"}</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        <span className="rounded-full bg-purple-500/15 border border-purple-500/30 px-3.5 py-1 text-xs font-bold text-purple-600 dark:text-purple-400">
                            {filteredQuestions.length} {isAr ? "سؤال بانتظار الصياغة" : "Questions Pending"}
                        </span>
                    </div>
                </div>

                {/* Header Banner */}
                <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120]/90 p-6 sm:p-8 shadow-xl dark:shadow-[0_15px_35px_rgba(0,0,0,0.4)] backdrop-blur-md">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-600/15 text-purple-500 border border-purple-500/30">
                                <HelpCircle className="h-7 w-7" />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                                    {isAr ? "الأسئلة القانونية غير المجاب عليها" : "Unanswered Legal Questions"}
                                </h1>
                                <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                                    {isAr
                                        ? "استفسارات طرحها المستفيدون ولم يجد الذكاء الاصطناعي سابقة مباشرة لها، بانتظار صياغة فتوى رسمية منك."
                                        : "Questions asked by users that have no AI precedents yet, waiting for formal legal opinions."}
                                </p>
                            </div>
                        </div>

                        {/* Quick Draft Button */}
                        <button
                            type="button"
                            onClick={() => navigate("/legal-opinion")}
                            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                        >
                            <FilePenLine className="h-4 w-4" />
                            <span>{isAr ? "صياغة فتوى حرة" : "Draft Free Opinion"}</span>
                        </button>
                    </div>
                </div>

                {/* Notifications */}
                {successMessage && (
                    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                            <span>{successMessage}</span>
                        </div>
                        <button type="button" onClick={() => setSuccessMessage("")} className="text-emerald-500 hover:opacity-80">
                            &times;
                        </button>
                    </div>
                )}
                {error && (
                    <div className="mb-6">
                        <Alert>{error}</Alert>
                    </div>
                )}

                {/* Search Filter */}
                <div className="relative max-w-md">
                    <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={isAr ? "بحث في نص السؤال أو اسم السائل..." : "Search questions or submitter..."}
                        className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120] py-2.5 ps-10 pe-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                    />
                </div>

                {/* Content List */}
                {isLoading ? (
                    <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120]/90 p-16 text-center space-y-4">
                        <Loader2 className="mx-auto h-10 w-10 animate-spin text-purple-500" />
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                            {isAr ? "جارٍ جلب الأسئلة المعلقة..." : "Loading unanswered questions..."}
                        </p>
                    </div>
                ) : filteredQuestions.length === 0 ? (
                    <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120]/90 p-16 text-center space-y-4">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            <Inbox className="h-8 w-8" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            {isAr ? "لا توجد أسئلة معلقة حالياً" : "No unanswered questions"}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                            {isAr
                                ? "تم الرد على جميع الأسئلة وصياغة الفتاوى اللازمة لها، أو لا توجد أسئلة مطابقة للبحث."
                                : "All questions have been answered or no questions match your search."}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredQuestions.map((q) => (
                            <div
                                key={q.id}
                                className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120]/90 p-6 sm:p-7 shadow-lg hover:border-purple-500/30 transition-all space-y-4 group"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                    <div className="space-y-2 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="inline-flex items-center gap-1 rounded-lg bg-purple-500/15 border border-purple-500/30 px-2.5 py-0.5 text-xs font-bold text-purple-600 dark:text-purple-400">
                                                <HelpCircle className="h-3.5 w-3.5" />
                                                <span>{isAr ? "سؤال يحتاج فتوى" : "Needs Opinion"}</span>
                                            </span>
                                        </div>

                                        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                            {q.question}
                                        </h3>

                                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                                            {q.askedByName && (
                                                <div className="flex items-center gap-1.5">
                                                    <User className="h-3.5 w-3.5 text-blue-500" />
                                                    <span>{isAr ? "طرحه:" : "Asked by:"}</span>
                                                    <strong className="text-slate-700 dark:text-slate-300">
                                                        {q.askedByName}
                                                    </strong>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                                <span>{formatDate(q.createdAt)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2.5 self-end sm:self-center flex-shrink-0">
                                        {/* 1. Answer Question Button */}
                                        <button
                                            type="button"
                                            onClick={() => handleAnswerQuestion(q)}
                                            className="inline-flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-purple-600/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                                        >
                                            <FilePenLine className="h-4 w-4" />
                                            <span>{isAr ? "صياغة فتوى للإجابة" : "Draft Opinion"}</span>
                                        </button>

                                        {/* 2. Dismiss / Delete Question Button */}
                                        <button
                                            type="button"
                                            onClick={() => setDeleteModalQuestion(q)}
                                            className="rounded-xl border border-red-500/20 bg-red-500/10 p-2.5 text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                                            title={isAr ? "حذف السؤال من القائمة" : "Dismiss Question"}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Delete Modal Confirmation */}
            {deleteModalQuestion && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="relative w-full max-w-md rounded-3xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#0B1120] p-6 shadow-2xl space-y-4">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/15 text-red-500 border border-red-500/30">
                            <Trash2 className="h-7 w-7" />
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                                {isAr ? "تأكيد حذف السؤال" : "Confirm Dismiss Question"}
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                                {isAr
                                    ? `هل أنت متأكد من رغبتك في إزالة هذا السؤال من قائمة الأسئلة المعلقة؟`
                                    : `Are you sure you want to dismiss this question from the unanswered list?`}
                            </p>
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/5 p-3 rounded-xl line-clamp-2">
                                "{deleteModalQuestion.question}"
                            </p>
                        </div>
                        <div className="flex items-center gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setDeleteModalQuestion(null)}
                                disabled={isDeleting}
                                className="flex-1 rounded-xl border border-slate-200 dark:border-white/10 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                            >
                                {isAr ? "إلغاء" : "Cancel"}
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteQuestion}
                                disabled={isDeleting}
                                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-500 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-red-600/25 transition-all disabled:opacity-50"
                            >
                                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                <span>{isAr ? "حذف من القائمة" : "Dismiss"}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
