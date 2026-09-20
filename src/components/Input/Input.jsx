import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

/**
 * Reusable text Input with label, optional left icon, optional right
 * element / endAction, automatic password show/hide toggle, and error state.
 * Adapts seamlessly to Dark & Light modes.
 */
export default function Input({
    id,
    label,
    type = "text",
    value,
    onChange,
    onBlur,
    error,
    icon: Icon,
    rightElement,
    endAction,
    placeholder,
    autoComplete,
    required = false,
    disabled = false,
    className = "",
    minLength,
    maxLength,
}) {
    const isPasswordType = type === "password";
    const [showPassword, setShowPassword] = useState(false);

    // Compute active input type
    const resolvedType = isPasswordType
        ? (showPassword ? "text" : "password")
        : type;

    // Resolve right element: custom rightElement / endAction or auto password eye button
    const resolvedRightElement = rightElement || endAction || (isPasswordType ? (
        <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="flex items-center justify-center p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none"
        >
            {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
            )}
        </button>
    ) : null);

    return (
        <div className="w-full">
            {label && (
                <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {label}
                    {required && <span className="text-red-500"> *</span>}
                </label>
            )}

            <div className="relative">
                {Icon && (
                    <Icon
                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 rtl:left-auto rtl:right-3"
                        aria-hidden="true"
                    />
                )}

                <input
                    id={id}
                    name={id}
                    type={resolvedType}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    required={required}
                    disabled={disabled}
                    minLength={minLength}
                    maxLength={maxLength}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${id}-error` : undefined}
                    className={`w-full rounded-xl border bg-white dark:bg-[#0E1528] py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-slate-100 dark:disabled:bg-white/5 disabled:text-slate-400 ${
                        Icon ? "ps-10" : "ps-3.5"
                    } ${resolvedRightElement ? "pe-10" : "pe-3.5"} ${
                        error
                            ? "border-red-500 focus:border-red-500"
                            : "border-slate-200 dark:border-white/10 focus:border-blue-500 dark:focus:border-blue-400"
                    } ${className}`}
                />

                {resolvedRightElement && (
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 rtl:right-auto rtl:left-2.5 flex items-center justify-center">
                        {resolvedRightElement}
                    </div>
                )}
            </div>

            {error && (
                <p id={`${id}-error`} className="mt-1.5 text-xs font-semibold text-red-500">
                    {error}
                </p>
            )}
        </div>
    );
}