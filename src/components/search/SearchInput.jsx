import { useRef, useEffect } from "react";
import { Search, ArrowRight, ArrowLeft, Loader2, X } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export default function SearchInput({ value, onChange, onSubmit, onClear, isLoading }) {
    const { t, dir, lang } = useLanguage();
    const textareaRef = useRef(null);

    // Auto-adjust height to fit multi-line questions up to 160px
    useEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        textarea.style.height = "auto";
        textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
    }, [value]);

    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        if (isLoading) return;
        if (!value.trim()) return;
        onSubmit(value);
    };

    const handleKeyDown = (e) => {
        // Enter without Shift triggers search; Shift+Enter creates a new line
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleClear = () => {
        if (onChange) onChange("");
        if (onClear) onClear();
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }
    };

    const SubmitIcon = dir === "rtl" ? ArrowLeft : ArrowRight;

    return (
        <form onSubmit={handleSubmit} className="w-full">
            <label htmlFor="legal-search-input" className="sr-only">
                {t.search.input.ariaLabel}
            </label>
            <div className="relative flex items-center gap-2 sm:gap-3 rounded-2xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#0B1120]/90 px-4 sm:px-5 py-3 sm:py-3.5 shadow-xl dark:shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-md transition-all focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/20">
                <Search className="h-5 w-5 flex-shrink-0 text-slate-400 dark:text-slate-400 self-center" aria-hidden="true" />
                <textarea
                    ref={textareaRef}
                    id="legal-search-input"
                    rows={1}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t.search.input.placeholder}
                    disabled={isLoading}
                    className="w-full min-w-0 resize-none border-none bg-transparent py-1 text-sm sm:text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none disabled:text-slate-400 leading-relaxed max-h-40 overflow-y-auto"
                />

                {/* Clear Input Button (X) */}
                {value && !isLoading && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="rounded-full p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors self-center"
                        title={lang === "ar" ? "مسح النص" : "Clear input"}
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}

                {/* Submit Search Button */}
                <button
                    type="submit"
                    disabled={isLoading || !value.trim()}
                    aria-label={t.search.input.button}
                    className="flex h-10 w-10 sm:h-11 sm:w-11 flex-shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/30 transition-all hover:bg-blue-500 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 self-center"
                >
                    {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                    ) : (
                        <SubmitIcon className="h-5 w-5" aria-hidden="true" />
                    )}
                </button>
            </div>
        </form>
    );
}