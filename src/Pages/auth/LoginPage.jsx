import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Shield,
    Mail,
    Lock,
    Eye,
    EyeOff,
    ShieldCheck,
    FileSearch,
    Landmark,
    Sun,
    Moon,
    ArrowLeft,
    ArrowRight,
    UserCheck,
    Briefcase,
} from "lucide-react";

import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";
import Alert from "../../components/Alert/Alert";
import { login } from "../../services/authApi";
import { getErrorMessage } from "../../services/apiError";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";

import "./LoginPage.css";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
    const navigate = useNavigate();
    const { setSession } = useAuth();
    const { t, lang, setLang, dir } = useLanguage();
    const { isDark, toggleTheme } = useTheme();

    const [fields, setFields] = useState({
        email: "",
        password: "",
    });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [serverError, setServerError] = useState("");

    const lp = t.loginPage || {};

    function validate(currentFields) {
        const errs = {};
        if (!currentFields.email.trim()) {
            errs.email = lp.emailRequired || "البريد الإلكتروني مطلوب.";
        } else if (!EMAIL_REGEX.test(currentFields.email.trim())) {
            errs.email = lp.emailInvalid || "أدخل بريداً إلكترونياً صحيحاً.";
        }

        if (!currentFields.password) {
            errs.password = lp.passwordRequired || "كلمة المرور مطلوبة.";
        } else if (currentFields.password.length < 6) {
            errs.password = lp.passwordMinLength || "يجب ألا تقل كلمة المرور عن 6 أحرف.";
        }
        return errs;
    }

    const handleChange = (field) => (e) => {
        setFields((prev) => ({ ...prev, [field]: e.target.value }));
        if (serverError) setServerError("");
    };

    const handleBlur = (field) => () => {
        setTouched((prev) => ({ ...prev, [field]: true }));
        setErrors(validate(fields));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setTouched({ email: true, password: true });

        const validationErrors = validate(fields);
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) return;

        setIsSubmitting(true);
        setServerError("");

        try {
            const result = await login(fields.email, fields.password);
            setSession(result);
            navigate("/dashboard");
        } catch (err) {
            setServerError(getErrorMessage(err));
        } finally {
            setIsSubmitting(false);
        }
    };

    const features = [
        { icon: FileSearch, text: lp.feature1 || "AI-assisted precedent search across case law and internal opinions" },
        { icon: ShieldCheck, text: lp.feature2 || "Bank-grade security, access control, and full audit trails" },
        { icon: Landmark, text: lp.feature3 || "Built for legal, compliance, and risk teams in banking" },
    ];

    const BackArrow = dir === "rtl" ? ArrowRight : ArrowLeft;

    return (
        <div className="flex min-h-screen w-full bg-slate-50 dark:bg-[#070A14] text-slate-900 dark:text-white transition-colors duration-200">
            {/* Left Side: Branding Panel (Hidden on mobile) */}
            <div className="precedent-panel relative hidden w-[46%] flex-col justify-between p-12 lg:flex lg:w-[50%] lg:p-16 text-white">
                <div className="login-stars" aria-hidden="true" />

                {/* Brand Logo & Back to Home */}
                <div className="relative z-10 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                            <Shield className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <span className="text-lg font-bold tracking-tight text-white group-hover:text-blue-300 transition-colors">
                            Legal AI
                        </span>
                    </Link>

                    <Link
                        to="/"
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-all backdrop-blur-md"
                    >
                        <BackArrow className="h-3.5 w-3.5" />
                        <span>{lp.backToHome || "Back to Home"}</span>
                    </Link>
                </div>

                {/* Center Content */}
                <div className="relative z-10 my-auto py-12 max-w-lg">
                    <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-bold text-blue-400 mb-6">
                        <span>{lp.brandSubtitle || "Banking Precedent Intelligence"}</span>
                    </div>

                    <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white leading-tight">
                        {lp.heroTitle || "Precedent intelligence for banking legal teams."}
                    </h1>

                    <p className="mt-4 text-sm text-slate-300 leading-relaxed font-normal">
                        {lp.heroDesc || "Search, cross-examine, and cite judicial precedents across your institution's history."}
                    </p>

                    {/* Features List */}
                    <div className="mt-8 space-y-3.5">
                        {features.map((feat, i) => (
                            <div key={i} className="flex items-center gap-3 text-xs sm:text-sm text-slate-200">
                                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                    <feat.icon className="h-4 w-4" aria-hidden="true" />
                                </div>
                                <span>{feat.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Footer */}
                <p className="relative z-10 text-xs text-slate-400">
                    &copy; {new Date().getFullYear()} Legal AI Systems. {dir === "rtl" ? "سري — للاستخدام المصرح به فقط." : "Confidential — authorized use only."}
                </p>
            </div>

            {/* Right Side: Login Form */}
            <div className="flex w-full flex-col justify-between p-6 sm:p-12 lg:w-[50%]">
                {/* Top Controls: Mobile Logo, Theme Switcher, Language Switcher */}
                <div className="flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 lg:hidden">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-500">
                            <Shield className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <span className="text-base font-bold text-slate-900 dark:text-white">Legal AI</span>
                    </Link>

                    <div className="ms-auto flex items-center gap-3">
                        {/* Theme Toggle */}
                        <button
                            type="button"
                            onClick={toggleTheme}
                            aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 transition-all hover:bg-slate-100 dark:hover:bg-white/10"
                        >
                            {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
                        </button>

                        {/* Language Switcher */}
                        <div className="flex items-center rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-1 text-xs font-semibold">
                            <button
                                type="button"
                                onClick={() => setLang("ar")}
                                className={`rounded-full px-2.5 py-1 transition-all ${
                                    lang === "ar" ? "bg-blue-600 text-white shadow-sm font-bold" : "text-slate-500 dark:text-slate-400"
                                }`}
                            >
                                عربي
                            </button>
                            <button
                                type="button"
                                onClick={() => setLang("en")}
                                className={`rounded-full px-2.5 py-1 transition-all ${
                                    lang === "en" ? "bg-blue-600 text-white shadow-sm font-bold" : "text-slate-500 dark:text-slate-400"
                                }`}
                            >
                                EN
                            </button>
                        </div>
                    </div>
                </div>

                {/* Center Form Card */}
                <div className="mx-auto my-auto w-full max-w-md py-8">
                    <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120]/80 p-8 shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-md transition-all">
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                            {lp.title || "تسجيل الدخول إلى حسابك"}
                        </h2>
                        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                            {lp.subtitle || "أدخل بياناتك لاختيار دورك والوصول إلى نظام السوابق القانونية."}
                        </p>

                        {serverError && (
                            <div className="mt-4">
                                <Alert>{serverError}</Alert>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
                            {/* Email */}
                            <Input
                                id="email"
                                label={lp.emailLabel || "البريد الإلكتروني"}
                                type="email"
                                icon={Mail}
                                placeholder={lp.emailPlaceholder || "your-email@bank.com"}
                                autoComplete="email"
                                required
                                value={fields.email}
                                onChange={handleChange("email")}
                                onBlur={handleBlur("email")}
                                error={touched.email && errors.email}
                                disabled={isSubmitting}
                            />

                            {/* Password */}
                            <div>
                                <Input
                                    id="password"
                                    label={lp.passwordLabel || "كلمة المرور"}
                                    type={showPassword ? "text" : "password"}
                                    icon={Lock}
                                    placeholder={lp.passwordPlaceholder || "أدخل كلمة المرور"}
                                    autoComplete="current-password"
                                    required
                                    value={fields.password}
                                    onChange={handleChange("password")}
                                    onBlur={handleBlur("password")}
                                    error={touched.password && errors.password}
                                    disabled={isSubmitting}
                                    endAction={
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((prev) => !prev)}
                                            tabIndex={-1}
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" aria-hidden="true" />
                                            ) : (
                                                <Eye className="h-4 w-4" aria-hidden="true" />
                                            )}
                                        </button>
                                    }
                                />
                            </div>

                            {/* Submit Button */}
                            <div className="pt-2">
                                <Button type="submit" isLoading={isSubmitting}>
                                    {isSubmitting
                                        ? (lp.submittingButton || "جارٍ تسجيل الدخول…")
                                        : (lp.submitButton || "تسجيل الدخول")}
                                </Button>
                            </div>
                        </form>
                    </div>

                    {/* Institutional Security Notice */}
                    <div className="mt-6 text-center">
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            {lang === "ar"
                                ? "🔒 في حال نسيان كلمة المرور أو فقدان الوصول، يرجى مراجعة مسؤول النظام (Administrator) لإعادة تعيين الحساب."
                                : "🔒 For password resets or account assistance, please contact your System Administrator."}
                        </p>
                    </div>
                </div>

                {/* Mobile Back Link */}
                <div className="text-center lg:hidden">
                    <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-blue-500">
                        <BackArrow className="h-3 w-3" />
                        <span>{lp.backToHome || "العودة للرئيسية"}</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}