import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    UserPlus,
    ArrowRight,
    ArrowLeft,
    Mail,
    Lock,
    User,
    Phone,
    MapPin,
    Briefcase,
    Scale,
    ShieldCheck,
    Shield,
    CheckCircle2,
    RotateCcw,
    Clock,
    Upload,
    AlertTriangle,
    Loader2,
    Send,
} from "lucide-react";
import Navbar from "../../components/home/Navbar";
import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";
import Alert from "../../components/Alert/Alert";
import { useLanguage } from "../../context/LanguageContext";
import { requestAddNewUser, createUser } from "../../services/userApi";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_EXPIRY_SECONDS = 300; // 5 minutes (Section 4.3 OTP-gated policy)

export default function AddUserPage() {
    const { lang, dir } = useLanguage();
    const navigate = useNavigate();
    const isAr = lang === "ar";
    const BackArrow = dir === "rtl" ? ArrowRight : ArrowLeft;

    // Multi-step state: Step 1 (Request OTP by Email), Step 2 (Fill Profile & Enter OTP)
    const [step, setStep] = useState(1);

    // Step 1 State
    const [emailInput, setEmailInput] = useState("");
    const [isSendingOtp, setIsSendingOtp] = useState(false);

    // Step 2 Profile Fields (Email is strictly locked to emailInput)
    const [fields, setFields] = useState({
        firstName: "",
        lastName: "",
        userName: "",
        email: "",
        phoneNumber: "",
        role: "Lawyer",
        governorate: "القاهرة",
        address: "",
        password: "TempPassword123!",
        profilePicture: null,
    });

    const [picturePreview, setPicturePreview] = useState(null);
    const [otpCode, setOtpCode] = useState("");
    const [timeLeft, setTimeLeft] = useState(OTP_EXPIRY_SECONDS);
    const [isResending, setIsResending] = useState(false);
    const [resendNotice, setResendNotice] = useState("");

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [serverError, setServerError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const governorates = [
        "القاهرة",
        "الجيزة",
        "الإسكندرية",
        "الدقهلية",
        "القليوبية",
        "الشرقية",
        "الغربية",
        "البحيرة",
        "المنوفية",
        "كفر الشيخ",
        "دمياط",
        "بورسعيد",
        "الإسماعيلية",
        "السويس",
        "شمال سيناء",
        "جنوب سيناء",
        "البحر الأحمر",
        "الفيوم",
        "بني سويف",
        "المنيا",
        "أسيوط",
        "سوهاج",
        "قنا",
        "الأقصر",
        "أسوان",
    ];

    // 5-minute countdown timer
    useEffect(() => {
        if (step !== 2) return;
        if (timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, [step, timeLeft]);

    const formatTimer = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    };

    const handleChange = (field) => (e) => {
        setFields((prev) => ({ ...prev, [field]: e.target.value }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    };

    const handlePictureChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setFields((prev) => ({ ...prev, profilePicture: file }));
            setPicturePreview(URL.createObjectURL(file));
        }
    };

    // Step 1: Request Activation Code (POST /api/Admin/Users/request)
    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setServerError("");
        setResendNotice("");

        const trimmed = emailInput.trim();
        if (!trimmed) {
            setServerError(isAr ? "البريد الإلكتروني مطلوب." : "Email is required.");
            return;
        }
        if (!EMAIL_REGEX.test(trimmed)) {
            setServerError(isAr ? "صيغة البريد الإلكتروني غير صحيحة." : "Invalid email format.");
            return;
        }

        setIsSendingOtp(true);
        try {
            await requestAddNewUser(trimmed);
            setFields((prev) => ({
                ...prev,
                email: trimmed,
                userName: trimmed.split("@")[0].replace(/[^a-zA-Z0-9]/g, "").toUpperCase(),
            }));
            setStep(2);
            setTimeLeft(OTP_EXPIRY_SECONDS);
            setResendNotice(
                isAr
                    ? `تم إرسال رمز التحقق OTP بنجاح إلى (${trimmed}). صالح لمدة 5 دقائق.`
                    : `Verification code sent to (${trimmed}). Valid for 5 minutes.`
            );
        } catch (err) {
            setServerError(
                err.message ||
                    (isAr
                        ? "فشل إرسال كود التفعيل. تأكد من صحة البريد أو أن الكود لم يُرسل مؤخراً."
                        : "Failed to send activation code.")
            );
        } finally {
            setIsSendingOtp(false);
        }
    };

    // Resend OTP Code (Step 2 button next to OTP field)
    const handleResendOtp = async () => {
        setIsResending(true);
        setServerError("");
        setResendNotice("");
        try {
            await requestAddNewUser(fields.email);
            setTimeLeft(OTP_EXPIRY_SECONDS);
            setResendNotice(
                isAr
                    ? `تم إعادة إرسال رمز OTP جديد بنجاح إلى (${fields.email})، صالح لمدة 5 دقائق.`
                    : `New OTP code sent successfully to (${fields.email}).`
            );
        } catch (err) {
            setServerError(err.message || (isAr ? "فشل إعادة إرسال الكود." : "Failed to resend code."));
        } finally {
            setIsResending(false);
        }
    };

    // Step 2 Validation
    const validateStep2 = () => {
        const errs = {};
        if (!fields.firstName.trim()) errs.firstName = isAr ? "الاسم الأول مطلوب." : "First name required.";
        if (!fields.lastName.trim()) errs.lastName = isAr ? "اسم العائلة مطلوب." : "Last name required.";
        if (!fields.userName.trim()) errs.userName = isAr ? "اسم المستخدم مطلوب." : "Username required.";
        if (!fields.phoneNumber.trim()) errs.phoneNumber = isAr ? "رقم الهاتف مطلوب." : "Phone number required.";
        if (!fields.address.trim()) errs.address = isAr ? "العنوان بالتفصيل مطلوب." : "Address required.";
        if (!fields.password || fields.password.length < 6) {
            errs.password = isAr ? "كلمة المرور 6 أحرف على الأقل." : "Password min 6 chars.";
        }
        if (!otpCode.trim()) {
            errs.otpCode = isAr ? "يرجى إدخال كود التحقق OTP المرسل." : "Please enter OTP code.";
        }
        return errs;
    };

    // Step 2 Submit: Onboard User (POST /api/Admin/Users)
    const handleFinalSubmit = async (e) => {
        e.preventDefault();
        setServerError("");
        setSuccessMessage("");

        const errs = validateStep2();
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }

        if (timeLeft <= 0) {
            setServerError(
                isAr
                    ? "انتهت صلاحية رمز التحقق (5 دقائق). يرجى النقر على 'إعادة إرسال الكود' لتوليد رمز جديد."
                    : "OTP code expired. Please click 'Resend Code'."
            );
            return;
        }

        setIsSubmitting(true);
        try {
            await createUser(fields, otpCode.trim());
            setSuccessMessage(
                isAr
                    ? "تم إنشاء وتفعيل حساب المستخدم بنجاح! جاري تحويلك لإدارة المستخدمين..."
                    : "User account created and activated successfully!"
            );
            setTimeout(() => {
                navigate("/users");
            }, 1400);
        } catch (err) {
            setServerError(
                err.message ||
                    (isAr
                        ? "فشل إنشاء وتفعيل الحساب. تأكد من صحة كود OTP وصلاحيته."
                        : "Failed to create user.")
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#070A14] text-slate-900 dark:text-white transition-colors duration-200">
            <Navbar />

            <main className="mx-auto max-w-3xl px-6 py-10 lg:px-8">
                {/* Back Link */}
                <div className="mb-6">
                    <Link
                        to="/users"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-blue-500 transition-colors"
                    >
                        <BackArrow className="h-3.5 w-3.5" />
                        <span>{isAr ? "العودة لقائمة المستخدمين" : "Back to Users"}</span>
                    </Link>
                </div>

                {/* Header & Stepper Badge */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-bold text-blue-500 mb-3">
                        <UserPlus className="h-4 w-4" />
                        <span>{isAr ? "إضافة وتفعيل عضو جديد بالمنظومة" : "New User Onboarding"}</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        {isAr ? "تسجيل مستخدم جديد (مفعل برمز OTP)" : "Add New User (OTP-Gated)"}
                    </h1>
                    <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                        {isAr
                            ? "إجراء من خطوتين معتمد من البنك: التحقق من البريد عبر OTP، ثم استكمال البيانات وتثبيت الصلاحيات."
                            : "2-Step verification workflow: Validate email via OTP, then allocate profile & role."}
                    </p>

                    {/* Step Indicator Badges */}
                    <div className="flex items-center justify-center gap-3 mt-6">
                        <div
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                                step === 1
                                    ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20"
                                    : "bg-emerald-500/15 text-emerald-500 border-emerald-500/30"
                            }`}
                        >
                            <span>1</span>
                            <span>{isAr ? "التحقق من البريد (OTP)" : "Email OTP"}</span>
                            {step > 1 && <CheckCircle2 className="h-3.5 w-3.5" />}
                        </div>

                        <div className="h-0.5 w-6 bg-slate-300 dark:bg-white/10" />

                        <div
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                                step === 2
                                    ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20"
                                    : "bg-slate-100 dark:bg-white/5 text-slate-400 border-slate-200 dark:border-white/10"
                            }`}
                        >
                            <span>2</span>
                            <span>{isAr ? "بيانات الحساب والتفعيل" : "Account Data & Role"}</span>
                        </div>
                    </div>
                </div>

                {/* Feedback Alerts */}
                {serverError && (
                    <div className="mb-6">
                        <Alert>{serverError}</Alert>
                    </div>
                )}

                {resendNotice && (
                    <div className="mb-6 rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4 text-xs font-bold text-blue-500 flex items-center gap-2.5">
                        <Mail className="h-4 w-4 flex-shrink-0" />
                        <span>{resendNotice}</span>
                    </div>
                )}

                {successMessage && (
                    <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center text-sm font-bold text-emerald-500 flex items-center justify-center gap-2">
                        <CheckCircle2 className="h-5 w-5" />
                        <span>{successMessage}</span>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* STEP 1: Request OTP by entering Institutional Email */}
                {/* ========================================================================= */}
                {step === 1 && (
                    <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120]/80 p-6 sm:p-8 shadow-xl backdrop-blur-md space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-500">
                                <Mail className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                                    {isAr ? "الخطوة الأولى: التحقق من البريد وإرسال كود التفعيل" : "Step 1: Verify Institutional Email"}
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    {isAr
                                        ? "أدخل البريد الإلكتروني للموظف لإرسال كود تفعيل صالح لمدة 5 دقائق."
                                        : "Enter the user's institutional email to dispatch a 5-minute OTP code."}
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleRequestOtp} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    {isAr ? "البريد الإلكتروني للموظف *" : "Institutional Email Address *"}
                                </label>
                                <div className="relative">
                                    <Mail className="absolute top-1/2 -translate-y-1/2 start-3.5 h-4 w-4 text-slate-400" />
                                    <input
                                        type="email"
                                        required
                                        value={emailInput}
                                        onChange={(e) => setEmailInput(e.target.value)}
                                        placeholder="e.g. ahmed.ibrahim@bank.com"
                                        className="w-full rounded-2xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-[#0E1528] py-3.5 pe-4 ps-10 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
                                    />
                                </div>
                                <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5 text-blue-400" />
                                    <span>{isAr ? "تنويه: كود التفعيل صالح لمدة 5 دقائق من تاريخ الإرسال." : "Notice: Activation OTP remains valid for 5 minutes."}</span>
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={isSendingOtp}
                                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-500 p-3.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
                            >
                                {isSendingOtp ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                                <span>{isAr ? "إرسال رمز التفعيل (OTP) والانتقال للخطوة 2" : "Send Activation Code & Proceed"}</span>
                            </button>
                        </form>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* STEP 2: Profile Form + Locked Email + OTP Input & 5-min Resend Timer */}
                {/* ========================================================================= */}
                {step === 2 && (
                    <form
                        onSubmit={handleFinalSubmit}
                        className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120]/80 p-6 sm:p-8 shadow-xl backdrop-blur-md space-y-6"
                    >
                        {/* Role Picker (RolesDTO: 1..4) */}
                        <div>
                            <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                {isAr ? "الدور الوظيفي والصلاحية *" : "Assigned Role *"}
                            </label>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                {[
                                    { key: "Lawyer", label: isAr ? "محامي" : "Lawyer", icon: Briefcase, color: "blue" },
                                    { key: "Legal Advisor", label: isAr ? "مستشار قانوني" : "Legal Advisor", icon: Scale, color: "purple" },
                                    { key: "Legal Manager", label: isAr ? "مدير قانوني" : "Legal Manager", icon: ShieldCheck, color: "emerald" },
                                    { key: "System Administrator", label: isAr ? "مسؤول نظام" : "System Admin", icon: Shield, color: "amber" },
                                ].map((item) => (
                                    <button
                                        key={item.key}
                                        type="button"
                                        onClick={() => setFields((prev) => ({ ...prev, role: item.key }))}
                                        className={`flex flex-col items-center justify-center rounded-2xl p-3 text-xs font-bold border transition-all ${
                                            fields.role === item.key
                                                ? "border-blue-500 bg-blue-500/15 text-blue-600 dark:text-blue-300 shadow-md"
                                                : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0E1528] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
                                        }`}
                                    >
                                        <item.icon className="h-5 w-5 mb-1.5" />
                                        <span>{item.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* LOCKED EMAIL FIELD (Read-Only as requested by user) */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                                <span>{isAr ? "البريد الإلكتروني المعتمد *" : "Institutional Email Address *"}</span>
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                                    <Lock className="h-3 w-3" />
                                    <span>{isAr ? "مغلق ومحمي (تم إرسال OTP إليه)" : "Locked (OTP Dispatched)"}</span>
                                </span>
                            </label>
                            <div className="relative">
                                <Mail className="absolute top-1/2 -translate-y-1/2 start-3.5 h-4 w-4 text-slate-400" />
                                <input
                                    type="email"
                                    disabled
                                    readOnly
                                    value={fields.email}
                                    className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 py-3.5 pe-10 ps-10 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-not-allowed select-none opacity-90"
                                />
                                <Lock className="absolute top-1/2 -translate-y-1/2 end-3.5 h-4 w-4 text-slate-400" />
                            </div>
                        </div>

                        {/* Name (First and Last) */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Input
                                id="firstName"
                                label={isAr ? "الاسم الأول *" : "First Name *"}
                                placeholder={isAr ? "أحمد" : "Ahmed"}
                                required
                                value={fields.firstName}
                                onChange={handleChange("firstName")}
                                error={errors.firstName}
                            />
                            <Input
                                id="lastName"
                                label={isAr ? "اسم العائلة *" : "Last Name *"}
                                placeholder={isAr ? "إبراهيم" : "Ibrahim"}
                                required
                                value={fields.lastName}
                                onChange={handleChange("lastName")}
                                error={errors.lastName}
                            />
                        </div>

                        {/* Username & Phone */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Input
                                id="userName"
                                label={isAr ? "اسم المستخدم في المنظومة *" : "Username *"}
                                placeholder={isAr ? "A304060" : "A304060"}
                                required
                                value={fields.userName}
                                onChange={handleChange("userName")}
                                error={errors.userName}
                            />
                            <Input
                                id="phoneNumber"
                                label={isAr ? "رقم الهاتف المعتمد *" : "Phone Number *"}
                                type="tel"
                                icon={Phone}
                                placeholder="01012345678"
                                required
                                value={fields.phoneNumber}
                                onChange={handleChange("phoneNumber")}
                                error={errors.phoneNumber}
                            />
                        </div>

                        {/* Governorate & Address */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                    {isAr ? "المحافظة *" : "Governorate *"}
                                </label>
                                <select
                                    value={fields.governorate}
                                    onChange={handleChange("governorate")}
                                    className="w-full rounded-2xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-[#0E1528] px-4 py-3 text-xs font-bold text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                                >
                                    {governorates.map((g) => (
                                        <option key={g} value={g} className="bg-slate-900 text-white">
                                            {g}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <Input
                                id="address"
                                label={isAr ? "العنوان بالتفصيل *" : "Address *"}
                                placeholder={isAr ? "123 شارع البنوك، التجمع" : "123 Banking St"}
                                icon={MapPin}
                                required
                                value={fields.address}
                                onChange={handleChange("address")}
                                error={errors.address}
                            />
                        </div>

                        {/* Password */}
                        <Input
                            id="password"
                            label={isAr ? "كلمة المرور الأولية للحساب *" : "Initial Password *"}
                            type="password"
                            icon={Lock}
                            placeholder="••••••••"
                            required
                            value={fields.password}
                            onChange={handleChange("password")}
                            error={errors.password}
                        />

                        {/* Optional Profile Picture Upload */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                {isAr ? "صورة الملف الشخصي (اختياري)" : "Profile Picture (Optional)"}
                            </label>
                            <div className="flex items-center gap-4">
                                {picturePreview ? (
                                    <img
                                        src={picturePreview}
                                        alt="Preview"
                                        className="h-14 w-14 rounded-2xl object-cover border border-slate-200 dark:border-white/15 shadow-md"
                                    />
                                ) : (
                                    <div className="h-14 w-14 rounded-2xl border border-dashed border-slate-300 dark:border-white/20 bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400">
                                        <User className="h-6 w-6" />
                                    </div>
                                )}
                                <label className="cursor-pointer inline-flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-all">
                                    <Upload className="h-4 w-4 text-blue-500" />
                                    <span>{isAr ? "رفع صورة شخصية" : "Upload Picture"}</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePictureChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        </div>

                        {/* ================================================================= */}
                        {/* BOTTOM SECTION: OTP Input + Resend Code Button & 5-min Countdown */}
                        {/* ================================================================= */}
                        <div className="rounded-2xl border border-blue-500/30 bg-blue-500/[0.04] p-5 space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-500/20 pb-3">
                                <div>
                                    <h4 className="text-xs font-extrabold text-blue-500 flex items-center gap-1.5">
                                        <KeyRoundIcon className="h-4 w-4" />
                                        <span>{isAr ? "تأكيد رمز التحقق (OTP Code) *" : "Confirm OTP Code *"}</span>
                                    </h4>
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                        {isAr
                                            ? `أدخل الكود المكون من 6 أرقام المرسل إلى (${fields.email}) لتفعيل الحساب.`
                                            : `Enter the 6-digit code sent to (${fields.email}).`}
                                    </p>
                                </div>

                                {/* Live 5-minute Countdown Timer */}
                                <div
                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                                        timeLeft > 60
                                            ? "bg-blue-500/10 text-blue-500 border-blue-500/30"
                                            : timeLeft > 0
                                            ? "bg-amber-500/10 text-amber-500 border-amber-500/30 animate-pulse"
                                            : "bg-red-500/10 text-red-500 border-red-500/30"
                                    }`}
                                >
                                    <Clock className="h-3.5 w-3.5" />
                                    <span>
                                        {timeLeft > 0
                                            ? `${isAr ? "صلاحية الكود: " : "Expires: "} ${formatTimer(timeLeft)}`
                                            : isAr
                                            ? "انتهت الصلاحية (00:00)"
                                            : "Expired (00:00)"}
                                    </span>
                                </div>
                            </div>

                            {/* Input + Resend Button Row */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        maxLength={6}
                                        required
                                        placeholder="123456"
                                        value={otpCode}
                                        onChange={(e) => {
                                            setOtpCode(e.target.value.replace(/[^0-9a-zA-Z]/g, ""));
                                            if (errors.otpCode) setErrors((prev) => ({ ...prev, otpCode: "" }));
                                        }}
                                        className="w-full text-center tracking-[0.3em] font-mono text-base font-extrabold rounded-2xl border border-blue-500/30 bg-white dark:bg-[#0E1528] py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    />
                                    {errors.otpCode && (
                                        <p className="text-[11px] text-red-500 font-bold mt-1 text-center">
                                            {errors.otpCode}
                                        </p>
                                    )}
                                </div>

                                {/* Resend OTP Button */}
                                <button
                                    type="button"
                                    onClick={handleResendOtp}
                                    disabled={isResending}
                                    className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-xs font-bold transition-all border shadow-sm ${
                                        timeLeft === 0
                                            ? "bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-400 shadow-amber-500/30"
                                            : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/15 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10"
                                    }`}
                                    title={isAr ? "إعادة إرسال رمز OTP جديد في حال انتهاء الـ 5 دقائق" : "Resend OTP code"}
                                >
                                    {isResending ? (
                                        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                                    ) : (
                                        <RotateCcw className="h-4 w-4" />
                                    )}
                                    <span>{isAr ? "إعادة إرسال الكود" : "Resend Code"}</span>
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                            <Button type="submit" isLoading={isSubmitting}>
                                {isSubmitting
                                    ? isAr
                                        ? "جارٍ تفعيل الحساب وتثبيت الصلاحيات…"
                                        : "Creating user…"
                                    : isAr
                                    ? "إنشاء وتفعيل الحساب"
                                    : "Create & Activate User"}
                            </Button>
                        </div>
                    </form>
                )}
            </main>
        </div>
    );
}

function KeyRoundIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z" />
            <circle cx="16.5" cy="7.5" r=".5" fill="currentColor" />
        </svg>
    );
}
