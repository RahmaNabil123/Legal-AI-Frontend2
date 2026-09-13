import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
    FilePenLine,
    UploadCloud,
    X,
    FileText,
    CheckCircle2,
    ArrowLeft,
    ArrowRight,
    AlertTriangle,
    Shield,
    Sparkles,
} from "lucide-react";

import Navbar from "../../components/home/Navbar";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import Alert from "../../components/Alert/Alert";
import { submitLegalOpinion, deleteUnknownQuestion } from "../../services/opinionApi";
import { getErrorMessage } from "../../services/apiError";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";

export default function LegalOpinionPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { t, dir } = useLanguage();
    const { user, isAdvisor } = useAuth();

    const lo = t.legalOpinion || {};
    const BackArrow = dir === "rtl" ? ArrowRight : ArrowLeft;

    // Receive original search question or unknown question from state
    const initialQuestion = location.state?.question || "";
    const unknownQuestionId = location.state?.unknownQuestionId || null;

    const [title, setTitle] = useState("");
    const [question, setQuestion] = useState(initialQuestion);
    const [answer, setAnswer] = useState("");
    const [file, setFile] = useState(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [serverError, setServerError] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [validationError, setValidationError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});

    const handleFileChange = (e) => {
        const selected = e.target.files?.[0];
        if (selected) {
            if (selected.size > 15 * 1024 * 1024) {
                setValidationError(dir === "rtl" ? "حجم الملف يجب ألا يتجاوز 15 ميجابايت." : "File size must not exceed 15MB.");
                return;
            }
            setFile(selected);
            setValidationError("");
        }
        e.target.value = "";
    };

    const handleRemoveFile = () => {
        setFile(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        const errors = {};
        if (!title.trim()) {
            errors.title = dir === "rtl" ? "عنوان الرأي القانوني مطلوب" : "Title is required";
        }
        if (!question.trim()) {
            errors.question = dir === "rtl" ? "السؤال القانوني مطلوب" : "Question is required";
        }
        if (!answer.trim()) {
            errors.answer = dir === "rtl" ? "الرأي والتحليل القانوني مطلوب" : "Legal opinion is required";
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            setValidationError(
                dir === "rtl"
                    ? "يرجى ملء كافة الحقول الإلزامية: العنوان، السؤال، والرأي القانوني."
                    : "Please fill in all required fields: Title, Question, and Legal Opinion."
            );
            return;
        }

        setFieldErrors({});
        setIsSubmitting(true);
        setServerError("");
        setValidationError("");

        try {
            await submitLegalOpinion(
                {
                    title: title.trim(),
                    question: question.trim(),
                    answer: answer.trim(),
                },
                file // optional file
            );

            // Call DELETE /api/LegalOpinion/Unknown-Questions/{id} if answering an unknown question
            if (unknownQuestionId) {
                try {
                    await deleteUnknownQuestion(unknownQuestionId);
                } catch {
                    // Ignore background cleanup error
                }
            }

            setIsSuccess(true);
        } catch (err) {
            setServerError(getErrorMessage(err));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResetForm = () => {
        setTitle("");
        setQuestion("");
        setAnswer("");
        setFile(null);
        setFieldErrors({});
        setIsSuccess(false);
        setServerError("");
        setValidationError("");
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#070A14] text-slate-900 dark:text-white transition-colors duration-200">
            <Navbar />

            <main className="mx-auto max-w-4xl px-6 py-12 lg:px-8">
                {/* Back to search */}
                <div className="mb-6">
                    <Link
                        to="/search"
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120] px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                    >
                        <BackArrow className="h-4 w-4" />
                        <span>{lo.backToSearch || "Return to Search"}</span>
                    </Link>
                </div>

                {/* Header Card */}
                <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120]/90 p-8 shadow-xl dark:shadow-[0_15px_35px_rgba(0,0,0,0.4)] backdrop-blur-md mb-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-500 border border-purple-500/25">
                            <FilePenLine className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                                {lo.pageTitle || "New Legal Opinion"}
                            </h1>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                {lo.pageSubtitle}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Success View */}
                {isSuccess ? (
                    <div className="rounded-3xl border border-emerald-500/30 bg-white dark:bg-[#0B1120] p-10 text-center shadow-2xl backdrop-blur-md">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 mb-5">
                            <CheckCircle2 className="h-9 w-9" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                            {lo.successTitle || "Legal Opinion Submitted Successfully!"}
                        </h2>
                        <p className="mx-auto mt-3 max-w-lg text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                            {lo.successDesc}
                        </p>

                        <div className="mt-8 flex flex-wrap justify-center gap-4">
                            <button
                                type="button"
                                onClick={handleResetForm}
                                className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0E1528] px-6 py-3 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
                            >
                                {lo.newOpinionBtn || "Draft Another Opinion"}
                            </button>
                            <Link
                                to="/search"
                                className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500"
                            >
                                {lo.backToSearch || "Return to Search"}
                            </Link>
                        </div>
                    </div>
                ) : (
                    /* Opinion Form */
                    <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120]/90 p-8 sm:p-10 shadow-xl dark:shadow-[0_15px_35px_rgba(0,0,0,0.4)] backdrop-blur-md">
                        {serverError && (
                            <div className="mb-6">
                                <Alert>{serverError}</Alert>
                            </div>
                        )}
                        {validationError && (
                            <div className="mb-6">
                                <Alert>{validationError}</Alert>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} noValidate className="space-y-6">
                            {/* Title Field */}
                            <Input
                                id="opinion-title"
                                label={lo.titleLabel || "Opinion Title"}
                                placeholder={lo.titlePlaceholder || "e.g., Legal Position on Banking Contract Termination"}
                                required
                                value={title}
                                error={fieldErrors.title}
                                onChange={(e) => {
                                    setTitle(e.target.value);
                                    if (fieldErrors.title) setFieldErrors((prev) => ({ ...prev, title: null }));
                                }}
                                disabled={isSubmitting}
                            />

                            {/* Question Field (pre-filled from search) */}
                            <div>
                                <label
                                    htmlFor="opinion-question"
                                    className="mb-1.5 block text-sm font-semibold text-slate-800 dark:text-slate-200"
                                >
                                    {lo.questionLabel || "Legal Question"} <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="opinion-question"
                                    rows={3}
                                    value={question}
                                    onChange={(e) => {
                                        setQuestion(e.target.value);
                                        if (fieldErrors.question) setFieldErrors((prev) => ({ ...prev, question: null }));
                                    }}
                                    placeholder={lo.questionPlaceholder}
                                    disabled={isSubmitting}
                                    className={`w-full rounded-2xl border bg-white dark:bg-[#0E1528] p-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                                        fieldErrors.question
                                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                                            : "border-slate-200 dark:border-white/10 focus:border-blue-500 focus:ring-blue-500/30"
                                    }`}
                                />
                                {fieldErrors.question ? (
                                    <p className="mt-1 text-xs text-red-500 font-semibold">{fieldErrors.question}</p>
                                ) : (
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                        {lo.questionHint}
                                    </p>
                                )}
                            </div>

                            {/* Answer / Opinion Textarea */}
                            <div>
                                <label
                                    htmlFor="opinion-answer"
                                    className="mb-1.5 block text-sm font-semibold text-slate-800 dark:text-slate-200"
                                >
                                    {lo.answerLabel || "Comprehensive Legal Opinion"} <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="opinion-answer"
                                    rows={8}
                                    value={answer}
                                    onChange={(e) => {
                                        setAnswer(e.target.value);
                                        if (fieldErrors.answer) setFieldErrors((prev) => ({ ...prev, answer: null }));
                                    }}
                                    placeholder={lo.answerPlaceholder}
                                    disabled={isSubmitting}
                                    className={`w-full rounded-2xl border bg-white dark:bg-[#0E1528] p-4 text-sm leading-relaxed text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                                        fieldErrors.answer
                                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                                            : "border-slate-200 dark:border-white/10 focus:border-blue-500 focus:ring-blue-500/30"
                                    }`}
                                />
                                {fieldErrors.answer && (
                                    <p className="mt-1 text-xs text-red-500 font-semibold">{fieldErrors.answer}</p>
                                )}
                            </div>

                            {/* Supporting File Attachment (Optional) */}
                            <div className="rounded-2xl border border-dashed border-slate-300 dark:border-white/20 bg-slate-50/50 dark:bg-white/5 p-6">
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                                        {lo.fileLabel || (dir === "rtl" ? "إرفاق مستند داعم" : "Attach Supporting Document")}
                                    </label>
                                    <span className="rounded-full bg-slate-200/80 dark:bg-white/10 px-2.5 py-0.5 text-xs font-bold text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-white/10">
                                        {dir === "rtl" ? "اختياري" : "Optional"}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                                    {lo.fileHint}
                                </p>

                                {file ? (
                                    <div className="flex items-center justify-between rounded-xl bg-white dark:bg-[#0E1528] border border-slate-200 dark:border-white/10 p-3.5">
                                        <div className="flex items-center gap-3">
                                            <FileText className="h-5 w-5 text-blue-500" />
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">{file.name}</p>
                                                <p className="text-xs text-slate-400">
                                                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleRemoveFile}
                                            className="rounded-lg p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0E1528] px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-all">
                                        <UploadCloud className="h-4 w-4 text-blue-500" />
                                        <span>{lo.fileSelectBtn || "Choose File"}</span>
                                        <input
                                            type="file"
                                            accept=".pdf,.doc,.docx,.txt"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            disabled={isSubmitting}
                                        />
                                    </label>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div className="pt-4 flex justify-end">
                                <Button
                                    type="submit"
                                    isLoading={isSubmitting}
                                    className="sm:w-auto px-8 py-3.5 text-base"
                                >
                                    {isSubmitting
                                        ? (lo.submittingBtn || "Submitting...")
                                        : (lo.submitBtn || "Submit for Manager Review")}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}
            </main>
        </div>
    );
}
