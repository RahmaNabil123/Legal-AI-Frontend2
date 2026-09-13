import { AlertTriangle, CheckCircle2 } from "lucide-react";

/**
 * Inline banner shown above forms for success or error messages.
 * Adapts to Dark and Light modes.
 */
export default function Alert({ variant = "error", children }) {
    const isSuccess = variant === "success";
    const Icon = isSuccess ? CheckCircle2 : AlertTriangle;

    return (
        <div
            role={isSuccess ? "status" : "alert"}
            className={`flex items-start gap-2.5 rounded-xl border p-4 text-sm font-medium backdrop-blur-sm transition-all ${
                isSuccess
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300"
            }`}
        >
            <Icon className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span className="leading-snug">{children}</span>
        </div>
    );
}