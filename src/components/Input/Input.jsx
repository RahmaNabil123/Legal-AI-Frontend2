/**
 * Reusable text Input with label, optional left icon, optional right
 * element (used here for the show/hide password button), and an error state.
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
    placeholder,
    autoComplete,
    required = false,
    disabled = false,
}) {
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
                    type={type}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    required={required}
                    disabled={disabled}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${id}-error` : undefined}
                    className={`w-full rounded-xl border bg-white dark:bg-[#0E1528] py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-slate-100 dark:disabled:bg-white/5 disabled:text-slate-400 ${
                        Icon ? "ps-10" : "ps-3.5"
                    } ${rightElement ? "pe-10" : "pe-3.5"} ${
                        error
                            ? "border-red-500 focus:border-red-500"
                            : "border-slate-200 dark:border-white/10 focus:border-blue-500 dark:focus:border-blue-400"
                    }`}
                />

                {rightElement && (
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 rtl:right-auto rtl:left-2.5">
                        {rightElement}
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