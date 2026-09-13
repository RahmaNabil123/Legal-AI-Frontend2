import { Loader2 } from "lucide-react";

/**
 * Reusable Button.
 * variant: "primary" | "secondary" | "danger" | "ghost"
 * isLoading: shows a spinner and disables the button
 * Adapts to Dark and Light modes.
 */
export default function Button({
    children,
    variant = "primary",
    isLoading = false,
    disabled = false,
    type = "button",
    className = "",
    ...rest
}) {
    const base =
        "inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-50";

    const variants = {
        primary: "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 active:scale-[0.99]",
        secondary: "bg-white dark:bg-white/5 text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10",
        danger: "bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/25",
        ghost: "bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5",
    };

    return (
        <button
            type={type}
            disabled={disabled || isLoading}
            className={`${base} ${variants[variant]} ${className}`}
            {...rest}
        >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {children}
        </button>
    );
}