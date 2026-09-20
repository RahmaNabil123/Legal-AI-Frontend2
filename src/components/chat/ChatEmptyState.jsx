import { Sparkles, Plus } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

/**
 * ChatEmptyState Component
 * Displays a clean, minimal welcome state when the conversation has no messages.
 */
export default function ChatEmptyState({ conversationTitle, onStartNewChat }) {
    const { lang } = useLanguage();
    const isAr = lang === "ar";

    return (
        <div className="flex flex-col items-center justify-center py-16 sm:py-24 px-4 text-center max-w-xl mx-auto space-y-6 animate-in fade-in duration-300">
            {/* Logo Badge */}
            <div className="relative">
                <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-600/30">
                    <Sparkles className="h-8 w-8 sm:h-10 sm:w-10" />
                </div>
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                    {conversationTitle ||
                        (isAr ? "المساعد القانوني الذكي" : "Legal AI Assistant")}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                    {isAr
                        ? "اطرح أي استفسار قانوني في المربع أدناه، وسيقوم المساعد بفحص السوابق القضائية والمراجع والتشريعات المعتمدة لتقديم إجابة موثقة بالاستشهادات."
                        : "Ask your legal inquiry below. The assistant will search precedents and certified documents to provide sourced answers."}
                </p>
            </div>

            {/* If no active chat, offer quick start button */}
            {!conversationTitle && onStartNewChat && (
                <button
                    type="button"
                    onClick={onStartNewChat}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                    <Plus className="h-4 w-4" />
                    <span>{isAr ? "بدء محادثة جديدة" : "Start New Chat"}</span>
                </button>
            )}
        </div>
    );
}
