import { useRef, useEffect } from "react";
import { ArrowUp, Sparkles, Loader2 } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

/**
 * ChatInputBar Component
 * Auto-expanding input area for sending legal queries in the active conversation.
 */
export default function ChatInputBar({
    inputValue,
    setInputValue,
    onSend,
    isSubmitting,
    placeholder,
    disabled = false,
}) {
    const { lang } = useLanguage();
    const isAr = lang === "ar";
    const textareaRef = useRef(null);

    // Auto resize textarea height
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
        }
    }, [inputValue]);

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (!isSubmitting && inputValue.trim()) {
                onSend();
            }
        }
    };

    return (
        <div className="border-t border-slate-200 dark:border-white/10 bg-white/90 dark:bg-[#070A14]/90 backdrop-blur-md p-4 sm:p-5">
            <div className="max-w-4xl mx-auto space-y-2">
                <div className="relative flex items-end rounded-3xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-[#0B1120] shadow-lg focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all p-2">
                    {/* Legal Icon decoration */}
                    <div className="p-2.5 text-slate-400 hidden sm:block">
                        <Sparkles className="h-5 w-5 text-blue-500" />
                    </div>

                    {/* Textarea */}
                    <textarea
                        ref={textareaRef}
                        rows={1}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={disabled || isSubmitting}
                        placeholder={
                            placeholder ||
                            (isAr
                                ? "اطرح استفسارك القانوني هنا... (Enter للإرسال)"
                                : "Ask your legal question here... (Enter to send)")
                        }
                        className="flex-1 bg-transparent py-2 px-3 text-sm sm:text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none resize-none max-h-[180px] min-h-[44px] leading-relaxed"
                    />

                    {/* Send Button */}
                    <button
                        type="button"
                        onClick={onSend}
                        disabled={disabled || isSubmitting || !inputValue.trim()}
                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white shadow-md shadow-blue-600/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                        title={isAr ? "إرسال السؤال" : "Send message"}
                    >
                        {isSubmitting ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <ArrowUp className="h-5 w-5" />
                        )}
                    </button>
                </div>

                {/* Footnote */}
                <p className="text-center text-[10px] sm:text-[11px] text-slate-400">
                    {isAr
                        ? "المساعد القانوني مدعوم بالذكاء الاصطناعي لفحص السوابق والمراجع. يرجى التحقق من القضايا المعقدة مع المستشار المختص."
                        : "Legal AI analyzes precedents and laws. Please verify critical matters with certified counsel."}
                </p>
            </div>
        </div>
    );
}
