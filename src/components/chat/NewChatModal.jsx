import { useState } from "react";
import { X, Sparkles, Loader2, MessageSquarePlus } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

/**
 * NewChatModal Component
 * Prompts the user to enter a title for the new legal conversation.
 * Sends POST /api/Conversation with { title }
 */
export default function NewChatModal({ isOpen, onClose, onSubmit, isCreating, initialTitle = "" }) {
    const { lang } = useLanguage();
    const isAr = lang === "ar";

    const [title, setTitle] = useState(initialTitle || "");
    const [validationError, setValidationError] = useState("");

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const clean = title.trim();
        if (!clean) {
            setValidationError(isAr ? "يرجى إدخال عنوان للمحادثة." : "Please enter a conversation title.");
            return;
        }
        setValidationError("");
        onSubmit(clean);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="relative w-full max-w-md rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120] p-6 sm:p-8 shadow-2xl space-y-6"
                role="dialog"
                aria-modal="true"
            >
                {/* Close Button */}
                <button
                    type="button"
                    onClick={onClose}
                    disabled={isCreating}
                    className="absolute top-5 end-5 rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Modal Header */}
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                        <MessageSquarePlus className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            {isAr ? "بدء محادثة قانونية جديدة" : "New Legal Conversation"}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            {isAr
                                ? "أدخل عنواناً للمحادثة لسهولة الرجوع إليها في السجل لاحقاً."
                                : "Give this conversation a title for your history."}
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                            {isAr ? "عنوان المحادثة" : "Conversation Title"} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value);
                                if (validationError) setValidationError("");
                            }}
                            autoFocus
                            disabled={isCreating}
                            placeholder="..."
                            className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                        />
                        {validationError && (
                            <p className="text-xs text-red-500 mt-1.5 font-semibold">
                                {validationError}
                            </p>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/10">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isCreating}
                            className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer"
                        >
                            {isAr ? "إلغاء" : "Cancel"}
                        </button>
                        <button
                            type="submit"
                            disabled={isCreating || !title.trim()}
                            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/25 transition-all cursor-pointer"
                        >
                            {isCreating ? (
                                <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    <span>{isAr ? "جارٍ الإنشاء..." : "Creating..."}</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-3.5 w-3.5" />
                                    <span>{isAr ? "بدء المحادثة" : "Start Conversation"}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
