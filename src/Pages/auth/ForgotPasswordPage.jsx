import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Shield,
    Mail,
    Lock,
    KeyRound,
    Eye,
    EyeOff,
    CheckCircle2,
    ArrowLeft,
    ArrowRight,
    Sun,
    Moon,
    ShieldCheck,
} from "lucide-react";
import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";
import Alert from "../../components/Alert/Alert";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";
import { ApiError } from "../../services/apiError";
import { requestPasswordReset, confirmPasswordReset, resetPassword } from "../../services/authApi";
import {
    isCodeSentWithinCooldown,
    recordCodeSent,
    isAlreadySentBackendMessage,
} from "../../utils/codeCooldown";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
    const navigate = useNavigate();
    const { lang, setLang, dir } = useLanguage();
    const { isDark, toggleTheme } = useTheme();

    const [step, setStep] = useState(1); // 1: email, 2: otp & new password, 3: success
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const isAr = lang === "ar";
    const BackArrow = dir === "rtl" ? ArrowRight : ArrowLeft;

    const [resetToken, setResetToken] = useState("");

    const handleSendCode = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        setError("");
        setNotice("");
        const trimmedEmail = email.trim();
        if (!trimmedEmail) {
            setError(isAr ? "يرجى إدخال البريد الإلكتروني." : "Please enter your email.");
            return;
        }
        if (!EMAIL_REGEX.test(trimmedEmail)) {
            setError(isAr ? "يرجى إدخال بريد إلكتروني صالح." : "Please enter a valid email address.");
            return;
        }

        const cooldownKey = `forgot_pw_${trimmedEmail}`;

        // 5-minute rule: If requested again within 5 minutes, do not send new code, display "تم إرسال الكود بالفعل"
        if (isCodeSentWithinCooldown(cooldownKey)) {
            setError("");
            setNotice(isAr ? "تم إرسال الكود بالفعل" : "The code has already been sent.");
            setStep(2);
            return;
        }

        setIsLoading(true);
        try {
            await requestPasswordReset(trimmedEmail);
            recordCodeSent(cooldownKey);
            setStep(2);
            setNotice(isAr ? `تم إرسال رمز التحقق إلى ${trimmedEmail}.` : `Verification code sent to ${trimmedEmail}.`);
        } catch (err) {
            if (isAlreadySentBackendMessage(err.message)) {
                recordCodeSent(cooldownKey);
                setError("");
                setNotice(isAr ? "تم إرسال الكود بالفعل" : "The code has already been sent.");
                setStep(2);
            } else {
                setError(err.message || (isAr ? "تعذر إرسال رمز التحقق. حاول مجدداً." : "Failed to send reset code."));
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError("");

        if (!otp.trim() || otp.trim().length < 4) {
            setError(isAr ? "يرجى إدخال رمز التحقق المكون من 4 إلى 6 أرقام." : "Please enter the verification code.");
            return;
        }
        if (!newPassword || newPassword.length < 6) {
            setError(isAr ? "يجب ألا تقل كلمة المرور عن 6 أحرف." : "Password must be at least 6 characters.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError(isAr ? "كلمتا المرور غير متطابقتين." : "Passwords do not match.");
            return;
        }

        setIsLoading(true);
        try {
            // Step 2: Confirm reset with code and exchange for identity token
            const token = await confirmPasswordReset(email.trim(), otp.trim());
            // Step 3: Apply new password with identity token
            await resetPassword(email.trim(), token, newPassword);
            setStep(3);
        } catch (err) {
            setError(err.message || (isAr ? "حدث خطأ أثناء تعيين كلمة المرور." : "Error resetting password."));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full bg-slate-50 dark:bg-[#070A14] text-slate-900 dark:text-white transition-colors duration-200">
            {/* Left Branding Panel */}
            <div className="precedent-panel relative hidden w-[46%] flex-col justify-between p-12 lg:flex lg:w-[50%] lg:p-16 text-white">
                <div className="login-stars" aria-hidden="true" />

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
                        to="/login"
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-all backdrop-blur-md"
                    >
                        <BackArrow className="h-3.5 w-3.5" />
                        <span>{isAr ? "العودة لتسجيل الدخول" : "Back to Login"}</span>
                    </Link>
                </div>

                <div className="relative z-10 my-auto py-12 max-w-lg">
                    <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-bold text-blue-400 mb-6">
                        <ShieldCheck className="h-4 w-4" />
                        <span>{isAr ? "حماية واستعادة الحساب" : "Account Recovery"}</span>
                    </div>

                    <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white leading-tight">
                        {isAr ? "استعادة الوصول الآمن إلى حسابك المصرفي" : "Secure recovery for your banking account."}
                    </h1>

                    <p className="mt-4 text-sm text-slate-300 leading-relaxed font-normal">
                        {isAr
                            ? "نظام الحماية المصرفي يتيح لك إعادة تعيين كلمة المرور الخاصة بك عبر رمز تحقق يتم إرساله إلى بريدك الإلكتروني المعتمد لدى البنك."
                            : "Enterprise-grade recovery protocols ensure only authorized legal professionals access institutional precedents."}
                    </p>
                </div>

                <div className="relative z-10 border-t border-white/10 pt-6 text-xs text-slate-400">
                    {isAr ? "منظومة الاستشارات والتدقيق المصرفي — القطاع القانوني" : "Banking Legal Intelligence System — Enterprise Recovery"}
                </div>
            </div>

            {/* Right Form Panel */}
            <div className="flex w-full flex-col justify-between p-6 sm:p-12 lg:w-[50%] lg:p-16">
                {/* Top Controls */}
                <div className="flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 lg:hidden">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-500">
                            <Shield className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <span className="text-base font-bold text-slate-900 dark:text-white">Legal AI</span>
                    </Link>

                    <div className="ms-auto flex items-center gap-3">
                        <button
                            type="button"
                            onClick={toggleTheme}
                            aria-label={isDark ? "Light Mode" : "Dark Mode"}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 transition-all hover:bg-slate-100 dark:hover:bg-white/10"
                        >
                            {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
                        </button>

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

                {/* Form Card */}
                <div className="mx-auto my-auto w-full max-w-md py-8">
                    <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120]/80 p-8 shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-md transition-all">
                        {step === 1 && (
                            <>
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/15 text-blue-500 border border-blue-500/30 mb-4">
                                    <KeyRound className="h-6 w-6" />
                                </div>
                                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                    {isAr ? "نسيت كلمة المرور؟" : "Forgot Password?"}
                                </h2>
                                <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                                    {isAr
                                        ? "أدخل بريدك الإلكتروني المسجل وسنرسل لك رمزاً لإعادة تعيين كلمة المرور."
                                        : "Enter your registered email and we will send you a reset code."}
                                </p>

                                {error && (
                                    <div className="mt-4">
                                        <Alert>{error}</Alert>
                                    </div>
                                )}

                                <form onSubmit={handleSendCode} className="mt-6 space-y-4">
                                    <Input
                                        id="reset-email"
                                        label={isAr ? "البريد الإلكتروني" : "Email Address"}
                                        type="email"
                                        icon={Mail}
                                        placeholder="name@bank.com"
                                        required
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            if (error) setError("");
                                        }}
                                        disabled={isLoading}
                                    />

                                    <div className="pt-2">
                                        <Button type="submit" isLoading={isLoading}>
                                            {isLoading
                                                ? isAr
                                                    ? "جارٍ إرسال الرمز…"
                                                    : "Sending code…"
                                                : isAr
                                                ? "إرسال رمز التحقق"
                                                : "Send Reset Code"}
                                        </Button>
                                    </div>
                                </form>
                            </>
                        )}

                        {step === 2 && (
                            <>
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-600/15 text-purple-500 border border-purple-500/30 mb-4">
                                    <Lock className="h-6 w-6" />
                                </div>
                                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                    {isAr ? "تعيين كلمة المرور الجديدة" : "Set New Password"}
                                </h2>
                                <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                                    {isAr
                                        ? `تم إرسال رمز التحقق إلى ${email}. أدخل الرمز وكلمة المرور الجديدة.`
                                        : `Verification code sent to ${email}.`}
                                </p>

                                {notice && (
                                    <div className="mt-4">
                                        <Alert variant="info">{notice}</Alert>
                                    </div>
                                )}

                                {error && (
                                    <div className="mt-4">
                                        <Alert>{error}</Alert>
                                    </div>
                                )}

                                <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
                                    <Input
                                        id="reset-otp"
                                        label={isAr ? "رمز التحقق" : "Verification Code"}
                                        type="text"
                                        icon={KeyRound}
                                        placeholder="123456"
                                        required
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        disabled={isLoading}
                                    />

                                    <Input
                                        id="new-password"
                                        label={isAr ? "كلمة المرور الجديدة" : "New Password"}
                                        type="password"
                                        icon={Lock}
                                        placeholder="••••••••"
                                        required
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        disabled={isLoading}
                                    />

                                    <Input
                                        id="confirm-password"
                                        label={isAr ? "تأكيد كلمة المرور" : "Confirm Password"}
                                        type="password"
                                        icon={Lock}
                                        placeholder="••••••••"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        disabled={isLoading}
                                    />

                                    <div className="pt-2 space-y-2">
                                        <Button type="submit" isLoading={isLoading}>
                                            {isLoading
                                                ? isAr
                                                    ? "جارٍ الحفظ…"
                                                    : "Updating password…"
                                                : isAr
                                                ? "تأكيد كلمة المرور الجديدة"
                                                : "Confirm New Password"}
                                        </Button>

                                        <div className="flex items-center justify-between text-xs pt-1">
                                            <button
                                                type="button"
                                                onClick={handleSendCode}
                                                disabled={isLoading}
                                                className="font-bold text-purple-600 dark:text-purple-400 hover:underline transition-colors py-1"
                                            >
                                                {isAr ? "إعادة إرسال الكود" : "Resend Code"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => { setStep(1); setNotice(""); setError(""); }}
                                                className="font-semibold text-slate-500 hover:text-blue-500 transition-colors py-1"
                                            >
                                                {isAr ? "تغيير البريد الإلكتروني" : "Change Email"}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </>
                        )}

                        {step === 3 && (
                            <div className="text-center py-4">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 mb-4 animate-bounce">
                                    <CheckCircle2 className="h-8 w-8" />
                                </div>
                                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                    {isAr ? "تم تعيين كلمة المرور بنجاح!" : "Password Reset Successfully!"}
                                </h2>
                                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                    {isAr
                                        ? "يمكنك الآن تسجيل الدخول إلى حسابك باستخدام كلمة المرور الجديدة."
                                        : "You can now sign in using your new credentials."}
                                </p>
                                <div className="mt-6">
                                    <Button onClick={() => navigate("/login")}>
                                        {isAr ? "الذهاب لتسجيل الدخول" : "Proceed to Login"}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 text-center">
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-500"
                        >
                            <BackArrow className="h-3.5 w-3.5" />
                            <span>{isAr ? "الرجوع لصفحة تسجيل الدخول" : "Back to Sign In"}</span>
                        </Link>
                    </div>
                </div>

                <div className="text-center text-xs text-slate-400">
                    {isAr ? "القطاع المصرفي والقانوني - منظومة Legal AI" : "Banking Legal Intelligence — Legal AI"}
                </div>
            </div>
        </div>
    );
}
