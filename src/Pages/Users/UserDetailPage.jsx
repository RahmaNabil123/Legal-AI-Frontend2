import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
    ArrowRight,
    ArrowLeft,
    Mail,
    Phone,
    MapPin,
    Building2,
    Calendar,
    CheckCircle2,
    XCircle,
    Shield,
    Briefcase,
    Scale,
    ShieldCheck,
    Search,
    BookOpen,
    Clock,
    Power,
    Loader2,
    KeyRound,
    Trash2,
    AlertTriangle,
    X,
    Send,
    Lock,
    User,
    FileText,
    ClipboardCheck,
} from "lucide-react";
import Navbar from "../../components/home/Navbar";
import Alert from "../../components/Alert/Alert";
import Input from "../../components/Input/Input";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import {
    getUserById,
    toggleUserStatus,
    deleteUser,
    requestChangeUserEmail,
    confirmChangeUserEmail,
} from "../../services/userApi";
import {
    requestPasswordReset,
    confirmPasswordReset,
    resetPassword,
} from "../../services/authApi";
import {
    isCodeSentWithinCooldown,
    recordCodeSent,
    isAlreadySentBackendMessage,
} from "../../utils/codeCooldown";

export default function UserDetailPage() {
    const { id } = useParams();
    const { lang, dir } = useLanguage();
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const isAr = lang === "ar";
    const BackArrow = dir === "rtl" ? ArrowRight : ArrowLeft;

    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionNotice, setActionNotice] = useState({ type: "", message: "" });
    const [activityTab, setActivityTab] = useState("ALL");

    // Modals state
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Email Change Workflow State
    const [emailStep, setEmailStep] = useState(1);
    const [newEmail, setNewEmail] = useState("");
    const [emailCode, setEmailCode] = useState("");
    const [emailSubmitting, setEmailSubmitting] = useState(false);
    const [emailError, setEmailError] = useState("");
    const [emailNotice, setEmailNotice] = useState("");

    // Password Reset Workflow State
    const [pwStep, setPwStep] = useState(1);
    const [pwCode, setPwCode] = useState("");
    const [resetToken, setResetToken] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPw, setConfirmPw] = useState("");
    const [pwSubmitting, setPwSubmitting] = useState(false);
    const [pwError, setPwError] = useState("");
    const [pwNotice, setPwNotice] = useState("");

    // Delete workflow state
    const [deleteSubmitting, setDeleteSubmitting] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    useEffect(() => {
        async function fetchUser() {
            setIsLoading(true);
            try {
                const data = await getUserById(id);
                setUser(data);
            } catch (err) {
                setError(err.message || (isAr ? "تعذر العثور على المستخدم." : "User not found."));
            } finally {
                setIsLoading(false);
            }
        }
        fetchUser();
    }, [id, isAr]);

    // Check if the viewed user profile is the currently logged-in Admin
    const isSelf = Boolean(
        currentUser &&
        (
            (id && String(currentUser.id) === String(id)) ||
            (user && String(currentUser.id) === String(user.id)) ||
            (currentUser.email && user?.email && currentUser.email.trim().toLowerCase() === user.email.trim().toLowerCase()) ||
            (currentUser.userName && user?.userName && currentUser.userName.trim().toLowerCase() === user.userName.trim().toLowerCase())
        )
    );

    // 1. Toggle Activate / Block (Section 4.4)
    const handleToggle = async () => {
        if (!user || isSelf) return;
        const targetIsActive = !user.isActive;
        try {
            await toggleUserStatus(user.id, user.isActive);
            setUser((prev) => ({
                ...prev,
                isActive: targetIsActive,
                profile: prev?.profile ? { ...prev.profile, isActive: targetIsActive } : undefined,
            }));
            setActionNotice({
                type: "success",
                message: targetIsActive
                    ? isAr
                        ? "تم تفعيل حساب المستخدم بنجاح."
                        : "User account activated successfully."
                    : isAr
                    ? "تم حظر / تعطيل حساب المستخدم بنجاح."
                    : "User account blocked successfully.",
            });
        } catch (err) {
            setActionNotice({
                type: "error",
                message: err.message || (isAr ? "فشل تعديل حالة الحساب." : "Failed to toggle status."),
            });
        }
    };

    // 2. Change Email Workflow (Admin Only)
    const handleStartEmailModal = () => {
        setEmailStep(1);
        setNewEmail("");
        setEmailCode("");
        setEmailError("");
        setEmailNotice("");
        setShowEmailModal(true);
    };

    const handleSendEmailCode = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        const trimmed = newEmail.trim();
        if (!trimmed || !trimmed.includes("@")) {
            setEmailError(isAr ? "يرجى إدخال بريد إلكتروني صحيح." : "Please enter a valid email.");
            return;
        }

        const cooldownKey = `email_change_${user.id}_${trimmed}`;

        // 5-minute rule: If requested again within 5 minutes, do not send new code, display "تم إرسال الكود بالفعل"
        if (isCodeSentWithinCooldown(cooldownKey)) {
            setEmailError("");
            setEmailNotice(isAr ? "تم إرسال الكود بالفعل" : "The code has already been sent.");
            setEmailStep(2);
            return;
        }

        setEmailSubmitting(true);
        setEmailError("");
        setEmailNotice("");
        try {
            await requestChangeUserEmail(user.id, trimmed);
            recordCodeSent(cooldownKey);
            setEmailStep(2);
            setEmailNotice(isAr ? `تم إرسال كود التأكيد إلى (${trimmed}).` : `Verification code sent to (${trimmed}).`);
        } catch (err) {
            if (isAlreadySentBackendMessage(err.message)) {
                recordCodeSent(cooldownKey);
                setEmailError("");
                setEmailNotice(isAr ? "تم إرسال الكود بالفعل" : "The code has already been sent.");
                setEmailStep(2);
            } else {
                setEmailError(err.message || (isAr ? "فشل إرسال كود التأكيد." : "Failed to send code."));
            }
        } finally {
            setEmailSubmitting(false);
        }
    };

    const handleConfirmEmailChange = async (e) => {
        e.preventDefault();
        if (!emailCode.trim()) {
            setEmailError(isAr ? "يرجى إدخال كود التأكيد." : "Please enter confirmation code.");
            return;
        }
        setEmailSubmitting(true);
        setEmailError("");
        try {
            const updatedProfile = await confirmChangeUserEmail(user.id, emailCode.trim());
            if (updatedProfile && typeof updatedProfile === "object") {
                setUser((prev) => ({
                    ...prev,
                    ...updatedProfile,
                    email: updatedProfile.email || newEmail.trim(),
                }));
            } else {
                setUser((prev) => ({ ...prev, email: newEmail.trim() }));
            }
            setShowEmailModal(false);
            setActionNotice({
                type: "success",
                message: isAr
                    ? `تم تغيير البريد الإلكتروني للمستخدم إلى (${newEmail.trim()}) بنجاح بواسطة مسؤول النظام.`
                    : "User email updated successfully by Administrator.",
            });
        } catch (err) {
            setEmailError(err.message || (isAr ? "كود التأكيد غير صحيح أو منتهي الصلاحية." : "Invalid code."));
        } finally {
            setEmailSubmitting(false);
        }
    };

    // 3. Reset Password Workflow (Admin Only)
    const handleStartPasswordModal = () => {
        setPwStep(1);
        setPwCode("");
        setResetToken("");
        setNewPassword("");
        setConfirmPw("");
        setPwError("");
        setPwNotice("");
        setShowPasswordModal(true);
    };

    const handleSendPwOtp = async () => {
        const cooldownKey = `pw_reset_${user.email}`;

        // 5-minute rule: If requested again within 5 minutes, do not send new code, display "تم إرسال الكود بالفعل"
        if (isCodeSentWithinCooldown(cooldownKey)) {
            setPwError("");
            setPwNotice(isAr ? "تم إرسال الكود بالفعل" : "The code has already been sent.");
            setPwStep(2);
            return;
        }

        setPwSubmitting(true);
        setPwError("");
        setPwNotice("");
        try {
            await requestPasswordReset(user.email);
            recordCodeSent(cooldownKey);
            setPwStep(2);
            setPwNotice(isAr ? "تم إرسال رمز التحقق OTP إلى بريد المستخدم." : "OTP code sent to user email.");
        } catch (err) {
            if (isAlreadySentBackendMessage(err.message)) {
                recordCodeSent(cooldownKey);
                setPwError("");
                setPwNotice(isAr ? "تم إرسال الكود بالفعل" : "The code has already been sent.");
                setPwStep(2);
            } else {
                setPwError(err.message || (isAr ? "فشل إرسال رمز OTP." : "Failed to send OTP."));
            }
        } finally {
            setPwSubmitting(false);
        }
    };

    const handleVerifyPwOtp = async (e) => {
        e.preventDefault();
        if (!pwCode.trim()) {
            setPwError(isAr ? "يرجى إدخال كود OTP." : "Please enter OTP code.");
            return;
        }
        setPwSubmitting(true);
        setPwError("");
        try {
            const token = await confirmPasswordReset(user.email, pwCode.trim());
            setResetToken(token);
            setPwStep(3);
        } catch (err) {
            setPwError(err.message || (isAr ? "كود OTP غير صحيح." : "Invalid OTP code."));
        } finally {
            setPwSubmitting(false);
        }
    };

    const handleApplyNewPassword = async (e) => {
        e.preventDefault();
        if (!newPassword || newPassword.length < 6) {
            setPwError(isAr ? "كلمة المرور يجب ألا تقل عن 6 أحرف." : "Password must be at least 6 characters.");
            return;
        }
        if (newPassword !== confirmPw) {
            setPwError(isAr ? "كلمتا المرور غير متطابقتين." : "Passwords do not match.");
            return;
        }
        setPwSubmitting(true);
        setPwError("");
        try {
            await resetPassword(user.email, resetToken, newPassword);
            setShowPasswordModal(false);
            setActionNotice({
                type: "success",
                message: isAr
                    ? "تم تعيين وتحديث كلمة المرور الجديدة للمستخدم بنجاح بواسطة مسؤول النظام."
                    : "Password reset successfully by Administrator.",
            });
        } catch (err) {
            setPwError(err.message || (isAr ? "فشل تحديث كلمة المرور." : "Failed to reset password."));
        } finally {
            setPwSubmitting(false);
        }
    };

    // 4. Delete User Workflow (Danger Zone - Lawyer with zero documents only)
    const handleConfirmDelete = async () => {
        if (!user) return;
        if (isSelf) {
            setDeleteError(
                isAr
                    ? "لا يمكنك حذف حسابك الحالي المسجل به في المنظومة."
                    : "You cannot delete your own active account."
            );
            return;
        }
        const isLawyer = user.role === "Lawyer" || user.role === "محامي";
        if (!isLawyer) {
            setDeleteError(
                isAr
                    ? "الحذف متاح فقط لحسابات المحامين العاديين، ولا يمكن حذف المستشارين أو المديرين أو مسؤولي النظام. يمكنك فقط حظر الحساب."
                    : "Deletion is only allowed for regular Lawyer accounts. Other roles can only be blocked."
            );
            return;
        }

        const hasUploadedDocuments =
            (user.uploadedDocuments && user.uploadedDocuments.length > 0) ||
            (user.createdOpinions && user.createdOpinions.length > 0) ||
            (user.opinionReviewsCount && user.opinionReviewsCount > 0) ||
            (user.reviewedOpinions && user.reviewedOpinions.length > 0);

        if (hasUploadedDocuments) {
            setDeleteError(
                isAr
                    ? "لا يمكن حذف هذا المستخدم لوجود مستندات مرفوعة مسجلة باسمه في المنظومة. يمكنك فقط حظر الحساب."
                    : "Cannot delete user with uploaded documents on the system. You can only block the account."
            );
            return;
        }

        setDeleteSubmitting(true);
        setDeleteError("");
        try {
            await deleteUser(user.id);
            navigate("/users", {
                replace: true,
                state: {
                    deletedNotice: isAr
                        ? `تم حذف حساب المستخدم (${user.firstName} ${user.lastName}) نهائياً من النظام.`
                        : `User ${user.firstName} deleted permanently.`,
                },
            });
        } catch (err) {
            setDeleteError(
                err.message || (isAr ? "فشل حذف المستخدم. تأكد من تعطيل الحساب أولاً." : "Failed to delete user.")
            );
            setDeleteSubmitting(false);
        }
    };

    const getRoleBadge = (role) => {
        if (role === "Legal Advisor") {
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 px-3.5 py-1 text-xs font-bold text-purple-600 dark:text-purple-400">
                    <Scale className="h-4 w-4" />
                    <span>{isAr ? "مستشار قانوني" : "Legal Advisor"}</span>
                </span>
            );
        }
        if (role === "Legal Manager") {
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="h-4 w-4" />
                    <span>{isAr ? "مدير الشؤون القانونية" : "Legal Manager"}</span>
                </span>
            );
        }
        if (role === "System Administrator") {
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-3.5 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                    <Shield className="h-4 w-4" />
                    <span>{isAr ? "مسؤول النظام" : "System Admin"}</span>
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/15 border border-blue-500/30 px-3.5 py-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                <Briefcase className="h-4 w-4" />
                <span>{isAr ? "محامي" : "Lawyer"}</span>
            </span>
        );
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[#070A14] text-slate-900 dark:text-white">
                <Navbar />
                <div className="flex items-center justify-center py-32 text-slate-500">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500 me-2" />
                    <span>{isAr ? "جارٍ تحميل بيانات المستخدم…" : "Loading user details..."}</span>
                </div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[#070A14] text-slate-900 dark:text-white">
                <Navbar />
                <main className="mx-auto max-w-2xl px-6 py-16 text-center">
                    <Alert>{error || (isAr ? "المستخدم غير موجود." : "User not found.")}</Alert>
                    <Link
                        to="/users"
                        className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-blue-500 hover:underline"
                    >
                        <BackArrow className="h-4 w-4" />
                        <span>{isAr ? "العودة لقائمة المستخدمين" : "Back to users"}</span>
                    </Link>
                </main>
            </div>
        );
    }

    const roleStr = String(user?.role || "").toLowerCase();
    const isLegalAdvisor =
        roleStr.includes("advisor") ||
        roleStr.includes("مستشار") ||
        user?.role === 2 ||
        user?.role === "Legal_Advisor";
    const isLegalManager =
        roleStr.includes("manager") ||
        roleStr.includes("مدير") ||
        user?.role === 3 ||
        user?.role === "Legal_Manager";
    const isSystemAdmin =
        roleStr.includes("admin") ||
        roleStr.includes("مسؤول") ||
        user?.role === 4 ||
        user?.role === "System_Administrator";
    const isLawyer =
        roleStr.includes("lawyer") ||
        roleStr.includes("محام") ||
        user?.role === 1;

    const renderStatusBadge = (status, entityType = "generic") => {
        if (status === null || status === undefined || status === "") return null;
        const s = String(status).toLowerCase();

        // 1. DocumentStatus: Processing = 1, Failed = 2, Indexed = 3
        if (entityType === "document") {
            if (s === "1" || s === "processing") {
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{isAr ? "قيد المعالجة" : "Processing"}</span>
                    </span>
                );
            }
            if (s === "2" || s === "failed") {
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30">
                        <XCircle className="h-3.5 w-3.5" />
                        <span>{isAr ? "فشل المعالجة" : "Failed"}</span>
                    </span>
                );
            }
            if (s === "3" || s === "indexed") {
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>{isAr ? "معتمد ومفهرس" : "Indexed"}</span>
                    </span>
                );
            }
        }

        // 2. OpinionStatus & ReviewDecision
        if (s === "indexed" || (entityType === "document" && s === "3")) {
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{isAr ? "معتمد ومفهرس" : "Indexed"}</span>
                </span>
            );
        }
        if (s === "approved" || (entityType === "opinion" && s === "2") || (entityType === "review" && s === "1")) {
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{isAr ? "معتمد" : "Approved"}</span>
                </span>
            );
        }
        if (s === "failed" || (entityType === "document" && s === "2")) {
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30">
                    <XCircle className="h-3.5 w-3.5" />
                    <span>{isAr ? "فشل المعالجة" : "Failed"}</span>
                </span>
            );
        }
        if (s === "rejected" || (entityType === "opinion" && s === "3") || (entityType === "review" && s === "2")) {
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30">
                    <XCircle className="h-3.5 w-3.5" />
                    <span>{isAr ? "مرفوض" : "Rejected"}</span>
                </span>
            );
        }
        if (s === "revisionrequired" || (entityType === "opinion" && s === "4") || (entityType === "review" && s === "3")) {
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>{isAr ? "مطلوب تعديل" : "Revision Required"}</span>
                </span>
            );
        }
        if (s === "submitted" || (entityType === "opinion" && s === "1")) {
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{isAr ? "قيد المراجعة" : "Submitted"}</span>
                </span>
            );
        }
        if (s === "processing" || s === "pending" || (entityType === "document" && s === "1")) {
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{isAr ? "قيد المعالجة" : "Processing"}</span>
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/30">
                <span>{status}</span>
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#070A14] text-slate-900 dark:text-white transition-colors duration-200">
            <Navbar />

            <main className="mx-auto max-w-5xl px-6 py-10 lg:px-8 space-y-8">
                {/* Back Button */}
                <div>
                    <Link
                        to="/users"
                        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-500 transition-colors"
                    >
                        <BackArrow className="h-4 w-4" />
                        <span>{isAr ? "العودة لقائمة المستخدمين" : "Back to User Management"}</span>
                    </Link>
                </div>

                {/* Alert Notification if any */}
                {actionNotice.message && (
                    <div
                        className={`rounded-2xl border p-4 text-sm font-bold flex items-center justify-between ${
                            actionNotice.type === "success"
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                                : "border-red-500/30 bg-red-500/10 text-red-500"
                        }`}
                    >
                        <span>{actionNotice.message}</span>
                        <button
                            type="button"
                            onClick={() => setActionNotice({ type: "", message: "" })}
                            className="text-slate-400 hover:text-slate-200"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {/* Profile Header & Admin Governance Actions */}
                <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120]/80 p-6 sm:p-8 shadow-xl backdrop-blur-md">
                    <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
                        {/* User identity info */}
                        <div className="flex items-center gap-4 sm:gap-5 min-w-0">
                            {user.profilePicture && user.profilePicture !== "No Profile Picture" ? (
                                <img
                                    src={user.profilePicture}
                                    alt={`${user.firstName} ${user.lastName}`}
                                    className="h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 rounded-3xl object-cover border border-slate-200 dark:border-white/10 shadow-lg shadow-blue-500/10"
                                />
                            ) : (
                                <div className="flex h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-600 to-purple-600 text-xl sm:text-2xl font-extrabold text-white shadow-lg shadow-blue-500/20">
                                    {user.firstName?.[0]}
                                    {user.lastName?.[0]}
                                </div>
                            )}
                            <div className="min-w-0 space-y-1">
                                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                    {user.firstName} {user.lastName}
                                </h1>
                                <div className="flex flex-wrap items-center gap-2">
                                    {getRoleBadge(user.role)}
                                    {isSelf && (
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/15 border border-blue-500/30 px-3 py-0.5 text-xs font-bold text-blue-600 dark:text-blue-400">
                                            <ShieldCheck className="h-3.5 w-3.5" />
                                            <span>{isAr ? "حسابك الحالي المسجل به" : "Your Logged-in Account"}</span>
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Admin Governance Actions: Exact 2-Row Stack as in user screenshot */}
                        <div className="flex flex-col items-start gap-2.5 flex-shrink-0">
                            {/* Row 1: Block/Activate Button + Change Email Button */}
                            <div className="flex items-center gap-2.5">
                                {/* 1. Block / Activate Button */}
                                <button
                                    type="button"
                                    onClick={handleToggle}
                                    disabled={isSelf}
                                    className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold transition-all shadow-sm whitespace-nowrap ${
                                        isSelf
                                            ? "bg-slate-500/10 text-slate-400 border border-slate-500/20 cursor-not-allowed opacity-60"
                                            : user.isActive
                                            ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 cursor-pointer hover:scale-105 active:scale-95"
                                            : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 cursor-pointer hover:scale-105 active:scale-95"
                                    }`}
                                    title={
                                        isSelf
                                            ? (isAr ? "لا يمكنك حظر أو تعطيل حسابك الحالي كمسؤول للنظام" : "You cannot block or deactivate your own active account")
                                            : user.isActive
                                            ? (isAr ? "حظر الحساب" : "Block Account")
                                            : (isAr ? "تفعيل الحساب" : "Activate Account")
                                    }
                                >
                                    {isSelf ? (
                                        <Lock className="h-4 w-4" />
                                    ) : (
                                        <Power className="h-4 w-4" />
                                    )}
                                    <span>
                                        {isSelf
                                            ? isAr
                                                ? "حسابك الحالي (مؤمّن)"
                                                : "Your Account (Protected)"
                                            : user.isActive
                                            ? isAr
                                                ? "حظر الحساب"
                                                : "Block Account"
                                            : isAr
                                            ? "تفعيل الحساب"
                                            : "Activate Account"}
                                    </span>
                                </button>

                                {/* 2. Change Email Button */}
                                <button
                                    type="button"
                                    onClick={handleStartEmailModal}
                                    className="inline-flex items-center gap-1.5 rounded-2xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 px-4 py-2 text-xs font-bold text-blue-600 dark:text-blue-400 transition-all shadow-sm hover:scale-105 active:scale-95 whitespace-nowrap"
                                >
                                    <Mail className="h-4 w-4" />
                                    <span>{isAr ? "تغيير البريد الإلكتروني" : "Change Email"}</span>
                                </button>
                            </div>

                            {/* Row 2: Reset Password Button (aligned under Block Button) */}
                            <div>
                                <button
                                    type="button"
                                    onClick={handleStartPasswordModal}
                                    className="inline-flex items-center gap-1.5 rounded-2xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 px-4 py-2 text-xs font-bold text-purple-600 dark:text-purple-400 transition-all shadow-sm hover:scale-105 active:scale-95 whitespace-nowrap"
                                >
                                    <KeyRound className="h-4 w-4" />
                                    <span>{isAr ? "تعيين كلمة المرور" : "Reset Password"}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* User Status & Activity Metrics (2 Cards: Uploaded Documents / Reviewed Opinions & Account Status) */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {/* 1. Uploaded Documents or Reviewed Opinions Card */}
                    <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120]/80 p-6 shadow-xl backdrop-blur-md hover:border-blue-500/30 transition-all">
                        <div className="flex items-center gap-4">
                            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${
                                isLegalManager
                                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-500"
                                    : "bg-blue-500/15 border-blue-500/30 text-blue-500"
                            }`}>
                                {isLegalManager ? (
                                    <ClipboardCheck className="h-7 w-7" />
                                ) : (
                                    <BookOpen className="h-7 w-7" />
                                )}
                            </div>
                            <div>
                                <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
                                    {isLegalManager
                                        ? (user.opinionReviewsCount ?? user.reviewedOpinions?.length ?? 0)
                                        : (user.uploadedDocuments?.length || 0)}
                                </p>
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                                    {isLegalManager
                                        ? (isAr ? "الآراء المراجعة" : "Reviewed Opinions")
                                        : (isAr ? "المستندات المرفوعة" : "Uploaded Documents")}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 2. Account Status Card */}
                    <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120]/80 p-6 shadow-xl backdrop-blur-md hover:border-emerald-500/30 transition-all">
                        <div className="flex items-center gap-4">
                            <div
                                className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${
                                    user.isActive
                                        ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-500"
                                        : "bg-slate-500/15 border-slate-500/30 text-slate-400"
                                }`}
                            >
                                {user.isActive ? <CheckCircle2 className="h-7 w-7" /> : <Power className="h-7 w-7" />}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className={`h-2.5 w-2.5 rounded-full ${user.isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                                    <p className={`text-2xl font-extrabold ${user.isActive ? "text-emerald-500" : "text-slate-400"}`}>
                                        {user.isActive ? (isAr ? "نشط" : "Active") : (isAr ? "معطل" : "Inactive")}
                                    </p>
                                </div>
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                                    {isAr ? "حالة الحساب" : "Account Status"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact & Organizational Info */}
                <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120]/80 p-8 shadow-xl backdrop-blur-md space-y-6">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-white/10 pb-4">
                        {isAr ? "البيانات الوظيفية والاتصال" : "Contact & Governance Information"}
                    </h2>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-blue-500" />
                            <div>
                                <p className="text-xs text-slate-400">{isAr ? "البريد الإلكتروني المعتمد" : "Email"}</p>
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{user.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Phone className="h-5 w-5 text-blue-500" />
                            <div>
                                <p className="text-xs text-slate-400">{isAr ? "رقم الهاتف" : "Phone"}</p>
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono">{user.phoneNumber || "—"}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <MapPin className="h-5 w-5 text-blue-500" />
                            <div>
                                <p className="text-xs text-slate-400">{isAr ? "المحافظة والعنوان" : "Governorate & Address"}</p>
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                    {user.governorate ? `${user.governorate} — ${user.address}` : (user.address || "—")}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <User className="h-5 w-5 text-blue-500" />
                            <div>
                                <p className="text-xs text-slate-400">{isAr ? "اسم المستخدم" : "Username"}</p>
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono">
                                    @{user.userName}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Role-Specific User Activities Section */}
                {isLegalAdvisor && (
                    <div className="space-y-6">
                        {/* 1. Uploaded Legal Documents */}
                        <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120]/80 p-6 sm:p-8 shadow-xl backdrop-blur-md space-y-5">
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-500">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                                            {isAr ? "المستندات القانونية المرفوعة" : "Uploaded Legal Documents"}
                                        </h2>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            {isAr ? "سجل الوثائق والمستندات المرفوعة للنظام بواسطة هذا المستشار" : "Legal documents uploaded by this advisor"}
                                        </p>
                                    </div>
                                </div>
                                <span className="rounded-full bg-blue-500/15 border border-blue-500/30 px-3.5 py-1 text-xs font-extrabold text-blue-500">
                                    {user.uploadedDocuments?.length || 0} {isAr ? "مستند" : "Documents"}
                                </span>
                            </div>

                            {user.uploadedDocuments && user.uploadedDocuments.length > 0 ? (
                                <div className="space-y-3">
                                    {user.uploadedDocuments.map((doc) => (
                                        <div
                                            key={doc.id}
                                            className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 hover:border-blue-500/30 transition-all text-xs"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-500">
                                                    <FileText className="h-4 w-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm block truncate">
                                                        {doc.title}
                                                    </span>
                                                    {doc.fileName && (
                                                        <span className="font-mono text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                                                            <span>📄</span>
                                                            <span>{doc.fileName}</span>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                {renderStatusBadge(doc.status, "document")}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 text-slate-400 text-xs">
                                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-40 text-blue-500" />
                                    <p className="font-bold">
                                        {isAr ? "لا توجد مستندات قانونية مرفوعة بواسطة هذا المستشار حتى الآن." : "No legal documents uploaded by this advisor yet."}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* 2. Created Legal Opinions */}
                        <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120]/80 p-6 sm:p-8 shadow-xl backdrop-blur-md space-y-5">
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-500">
                                        <Scale className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                                            {isAr ? "الآراء والفتاوى القانونية المصاغة" : "Drafted Legal Opinions & Fatawa"}
                                        </h2>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            {isAr ? "سجل الآراء القانونية والفتاوى الصادرة والمقيدة باسم هذا المستشار" : "Legal opinions drafted and issued by this advisor"}
                                        </p>
                                    </div>
                                </div>
                                <span className="rounded-full bg-purple-500/15 border border-purple-500/30 px-3.5 py-1 text-xs font-extrabold text-purple-500">
                                    {user.createdOpinions?.length || 0} {isAr ? "فتوى ورأي قانوني" : "Opinions"}
                                </span>
                            </div>

                            {user.createdOpinions && user.createdOpinions.length > 0 ? (
                                <div className="space-y-3">
                                    {user.createdOpinions.map((op) => (
                                        <div
                                            key={op.id}
                                            className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 hover:border-purple-500/30 transition-all text-xs"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-purple-500/15 text-purple-500">
                                                    <Scale className="h-4 w-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm block truncate">
                                                        {op.title}
                                                    </span>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold">
                                                            {isAr ? "صياغة فتوى قانونية مصرفية" : "Banking Legal Opinion"}
                                                        </span>
                                                        {op.fileName && (
                                                            <span className="font-mono text-[11px] text-slate-400 flex items-center gap-1">
                                                                <span>·</span>
                                                                <span>📄 {op.fileName}</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                {renderStatusBadge(op.status, "opinion")}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 text-slate-400 text-xs">
                                    <Scale className="h-8 w-8 mx-auto mb-2 opacity-40 text-purple-500" />
                                    <p className="font-bold">
                                        {isAr ? "لا توجد آراء أو فتاوى مسجلة باسم هذا المستشار حتى الآن." : "No legal opinions drafted by this advisor yet."}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {isLegalManager && (
                    <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120]/80 p-6 sm:p-8 shadow-xl backdrop-blur-md space-y-5">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500">
                                    <ClipboardCheck className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                                        {isAr ? "مراجعات وتدقيق الآراء القانونية" : "Legal Opinion Reviews & Audits"}
                                    </h2>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        {isAr ? "سجل الآراء القانونية والفتاوى التي خضعت لمراجعة وتدقيق واعتماد مدير الشؤون القانونية" : "Legal opinions reviewed and audited by this legal manager"}
                                    </p>
                                </div>
                            </div>
                            <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3.5 py-1 text-xs font-extrabold text-emerald-500">
                                {user.opinionReviewsCount ?? user.reviewedOpinions?.length ?? 0} {isAr ? "مراجعة معتمدة" : "Reviews"}
                            </span>
                        </div>

                        {user.reviewedOpinions && user.reviewedOpinions.length > 0 ? (
                            <div className="space-y-3">
                                {user.reviewedOpinions.map((rev) => (
                                    <div
                                        key={rev.id}
                                        className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 hover:border-emerald-500/30 transition-all text-xs"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-500">
                                                <ClipboardCheck className="h-4 w-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm block truncate">
                                                    {rev.title}
                                                </span>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                                                        {isAr ? "مراجعة قانونية معتمدة" : "Audited Legal Review"}
                                                    </span>
                                                    {rev.fileName && (
                                                        <span className="font-mono text-[11px] text-slate-400 flex items-center gap-1">
                                                            <span>·</span>
                                                            <span>📄 {rev.fileName}</span>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            {renderStatusBadge(rev.status, "review")}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 text-slate-400 text-xs">
                                <ClipboardCheck className="h-8 w-8 mx-auto mb-2 opacity-40 text-emerald-500" />
                                <p className="font-bold">
                                    {isAr ? "لا توجد مراجعات أو تدقيقات مسجلة لهذا المدير حتى الآن." : "No legal opinion reviews recorded for this manager yet."}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {isLawyer && (
                    <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120]/80 p-6 sm:p-8 shadow-xl backdrop-blur-md space-y-5">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-500">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                                        {isAr ? "المستندات القانونية المرفوعة" : "Uploaded Documents"}
                                    </h2>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        {isAr ? "سجل الوثائق والمستندات المرفوعة للنظام بواسطة هذا المحامي" : "Documents and files uploaded to the system by this lawyer"}
                                    </p>
                                </div>
                            </div>
                            <span className="rounded-full bg-blue-500/15 border border-blue-500/30 px-3.5 py-1 text-xs font-extrabold text-blue-500">
                                {user.uploadedDocuments?.length || 0} {isAr ? "مستند" : "Documents"}
                            </span>
                        </div>

                        {user.uploadedDocuments && user.uploadedDocuments.length > 0 ? (
                            <div className="space-y-3">
                                {user.uploadedDocuments.map((doc) => (
                                    <div
                                        key={doc.id}
                                        className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 hover:border-blue-500/30 transition-all text-xs"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-500">
                                                <FileText className="h-4 w-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm block truncate">
                                                    {doc.title}
                                                </span>
                                                {doc.fileName && (
                                                    <span className="font-mono text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                                                        <span>📄</span>
                                                        <span>{doc.fileName}</span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            {renderStatusBadge(doc.status, "document")}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 text-slate-400 text-xs">
                                <FileText className="h-8 w-8 mx-auto mb-2 opacity-40 text-blue-500" />
                                <p className="font-bold">
                                    {isAr ? "لا توجد مستندات قانونية مرفوعة بواسطة هذا المحامي حتى الآن." : "No documents uploaded by this lawyer yet."}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {isSystemAdmin && (
                    <div className="rounded-3xl border border-amber-500/20 bg-amber-500/[0.03] p-6 sm:p-7 shadow-xl backdrop-blur-md flex items-center gap-4 text-xs">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500">
                            <Shield className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                                {isAr ? "حساب إدارة النظام" : "System Administrator Account"}
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                {isAr
                                    ? "يتمتع هذا الحساب بصلاحيات إدارية عليا لإدارة المستخدمين وإعدادات النظام، ولا ترتبط أنشطته بمسارات صياغة المستندات أو مراجعة الآراء القانونية."
                                    : "This account possesses full administrative control over users and system governance. It does not engage directly in document authoring or opinion auditing workflows."}
                            </p>
                        </div>
                    </div>
                )}

                {/* 5. DANGER ZONE (Delete Governance: Regular Lawyer with zero documents only) */}
                <div className="rounded-3xl border border-red-500/30 bg-red-500/[0.04] p-8 shadow-xl backdrop-blur-md space-y-4">
                    <div className="flex items-center gap-3 text-red-500">
                        <AlertTriangle className="h-6 w-6 flex-shrink-0" />
                        <div>
                            <h3 className="text-base font-extrabold tracking-tight">
                                {isAr ? "منطقة الخطر — شروط حذف الحساب" : "Danger Zone — User Account Deletion"}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                {isAr
                                    ? "جميع الحسابات بالمنظومة متاح حظرها، أما الحذف النهائي فيشترط أن يكون المستخدم محامي عادي فقط وليس لديه أي مستندات مرفوعة على السيستم."
                                    : "All accounts can be blocked. Deletion is strictly restricted to regular Lawyers with zero uploaded documents."}
                            </p>
                        </div>
                    </div>

                    {/* Governance Banners for Deletion Eligibility */}
                    {(() => {
                        const isLawyer = user.role === "Lawyer" || user.role === "محامي";
                        const hasUploadedDocuments =
                            (user.uploadedDocuments && user.uploadedDocuments.length > 0) ||
                            (user.createdOpinions && user.createdOpinions.length > 0) ||
                            (user.opinionReviewsCount && user.opinionReviewsCount > 0) ||
                            (user.reviewedOpinions && user.reviewedOpinions.length > 0);

                        if (isSelf) {
                            return (
                                <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4 text-xs font-bold text-blue-500 flex items-center gap-3">
                                    <ShieldCheck className="h-5 w-5 flex-shrink-0" />
                                    <p>{isAr ? "هذا هو حسابك الحالي المسجل به كمسؤول للنظام — محمي بالكامل من التعطيل أو الحذف." : "This is your active administrator account — protected from deactivation or deletion."}</p>
                                </div>
                            );
                        }

                        if (!isLawyer) {
                            return (
                                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs font-bold text-amber-500 flex items-center gap-3">
                                    <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-500" />
                                    <div>
                                        <p className="font-extrabold text-sm">
                                            {isAr ? "الحذف غير متاح لهذا الدور الوظيفي" : "Deletion Not Allowed for this Role"}
                                        </p>
                                        <p className="mt-0.5 text-xs text-amber-400 font-medium leading-relaxed">
                                            {isAr
                                                ? "الحذف متاح فقط للمستخدم العادي (محامي). لا يمكن حذف حسابات المستشارين أو المديرين أو مسؤولي النظام، ويمكنك فقط حظر الحساب."
                                                : "Deletion is only allowed for regular Lawyers. Other roles can only be blocked."}
                                        </p>
                                    </div>
                                </div>
                            );
                        }

                        if (hasUploadedDocuments) {
                            return (
                                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs font-bold text-amber-500 flex items-center gap-3">
                                    <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-500" />
                                    <div>
                                        <p className="font-extrabold text-sm">
                                            {isAr ? "الحذف غير متاح لوجود مستندات مرفوعة" : "Deletion Blocked (Uploaded Documents Exist)"}
                                        </p>
                                        <p className="mt-0.5 text-xs text-amber-400 font-medium leading-relaxed">
                                            {isAr
                                                ? "لا يمكن حذف هذا المستخدم لوجود مستندات أو قوانين مرفوعة باسمه على السيستم. الإجراء المتاح هو حظر الحساب فقط."
                                                : "Cannot delete user with uploaded documents on the system. You can only block the account."}
                                        </p>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-bold text-emerald-500 flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 flex-shrink-0" />
                                <span>
                                    {isAr
                                        ? "هذا المستخدم مؤهل للحذف (محامي عادي بدون مستندات مرفوعة). يشترط حظر الحساب أولاً قبل الحذف."
                                        : "This user is eligible for deletion (Lawyer with no uploaded documents). Must be blocked first."}
                                </span>
                            </div>
                        );
                    })()}

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-red-500/20">
                        <div>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                {isAr ? "حالة الحساب الحالية: " : "Account Status: "}
                            </span>
                            <span className={`text-xs font-extrabold ${user.isActive ? "text-emerald-500" : "text-amber-500"}`}>
                                {user.isActive
                                    ? (isAr ? "نشط (متاح للحظر)" : "Active")
                                    : (isAr ? "محظور / معطل (جاهز للحذف إذا تحققت الشروط)" : "Blocked")}
                            </span>
                        </div>

                        {(() => {
                            const isLawyer = user.role === "Lawyer" || user.role === "محامي";
                            const hasUploadedDocuments =
                                (user.uploadedDocuments && user.uploadedDocuments.length > 0) ||
                                (user.createdOpinions && user.createdOpinions.length > 0) ||
                                (user.opinionReviewsCount && user.opinionReviewsCount > 0) ||
                                (user.reviewedOpinions && user.reviewedOpinions.length > 0);

                            const cannotDelete = isSelf || !isLawyer || hasUploadedDocuments;

                            return (
                                <button
                                    type="button"
                                    disabled={cannotDelete}
                                    onClick={() => {
                                        if (cannotDelete) {
                                            if (isSelf) {
                                                setActionNotice({
                                                    type: "error",
                                                    message: isAr ? "لا يمكنك حذف حسابك الشخصي من المنظومة!" : "Cannot delete your own account!",
                                                });
                                                return;
                                            }
                                            if (!isLawyer) {
                                                setActionNotice({
                                                    type: "error",
                                                    message: isAr
                                                        ? "الحذف متاح فقط لحسابات المحامين العاديين، ويمكنك فقط حظر هذا الحساب."
                                                        : "Deletion is only allowed for regular Lawyers. You can only block this account.",
                                                });
                                                return;
                                            }
                                            if (hasUploadedDocuments) {
                                                setActionNotice({
                                                    type: "error",
                                                    message: isAr
                                                        ? "ممنوع حذف مستخدم لديه مستندات مرفوعة على السيستم! يمكنك فقط حظر الحساب."
                                                        : "Cannot delete user with uploaded documents on the system! You can only block.",
                                                });
                                                return;
                                            }
                                            return;
                                        }

                                        if (user.isActive) {
                                            setActionNotice({
                                                type: "error",
                                                message: isAr
                                                    ? "لا يمكن حذف مستخدم نشط! يرجى حظر الحساب أولاً قبل تنفيذ عملية الحذف."
                                                    : "Cannot delete active user! Please block the account first.",
                                            });
                                            return;
                                        }

                                        setDeleteError("");
                                        setShowDeleteModal(true);
                                    }}
                                    className={`inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold transition-all shadow-lg ${
                                        cannotDelete
                                            ? "opacity-50 cursor-not-allowed bg-slate-200 dark:bg-white/5 text-slate-400 border border-slate-300 dark:border-white/10"
                                            : "bg-red-600 hover:bg-red-500 text-white shadow-red-600/30 hover:scale-105 active:scale-95"
                                    }`}
                                    title={
                                        isSelf
                                            ? (isAr ? "لا يمكنك حذف حسابك الشخصي" : "Cannot delete own account")
                                            : !isLawyer
                                            ? (isAr ? "الحذف متاح فقط للمحامي العادي. يمكنك الحظر فقط." : "Only Lawyers can be deleted. Only block allowed.")
                                            : hasUploadedDocuments
                                            ? (isAr ? "لا يمكن حذف مستخدم لديه مستندات مرفوعة. يمكنك الحظر فقط." : "Cannot delete user with uploaded documents.")
                                            : (isAr ? "حذف حساب المستخدم نهائياً" : "Delete User Permanently")
                                    }
                                >
                                    <Trash2 className="h-4 w-4" />
                                    <span>
                                        {!isLawyer
                                            ? (isAr ? "الحذف غير متاح (مقتصر على المحامي العادي)" : "Deletion Blocked (Lawyer only)")
                                            : hasUploadedDocuments
                                            ? (isAr ? "الحذف غير متاح (توجد مستندات مرفوعة)" : "Deletion Blocked (Documents exist)")
                                            : (isAr ? "حذف حساب المستخدم نهائياً" : "Delete User Permanently")}
                                    </span>
                                </button>
                            );
                        })()}
                    </div>
                </div>
            </main>

            {/* MODAL 1: Change Email Workflow (Admin Only) */}
            {showEmailModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="relative w-full max-w-md rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120] p-6 sm:p-8 shadow-2xl">
                        <button
                            type="button"
                            onClick={() => setShowEmailModal(false)}
                            className="absolute end-5 top-5 text-slate-400 hover:text-slate-200"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="flex items-center gap-2.5 mb-4 text-blue-500">
                            <Mail className="h-5 w-5" />
                            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                                {isAr ? "تغيير البريد الإلكتروني للمستخدم" : "Change User Email"}
                            </h3>
                        </div>

                        <p className="text-xs text-slate-400 mb-6">
                            {isAr
                                ? "إجراء إداري خاص بمسؤول النظام لتعديل البريد الرسمي للموظف داخل المنظومة."
                                : "Administrator workflow to update user institutional email."}
                        </p>

                        {emailNotice && (
                            <div className="mb-4">
                                <Alert variant="info">{emailNotice}</Alert>
                            </div>
                        )}

                        {emailError && (
                            <div className="mb-4">
                                <Alert>{emailError}</Alert>
                            </div>
                        )}

                        {emailStep === 1 ? (
                            <form onSubmit={handleSendEmailCode} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                        {isAr ? "البريد الإلكتروني الجديد *" : "New Email Address *"}
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        placeholder="new-email@bank.com"
                                        className="w-full rounded-2xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-white/5 p-3.5 text-xs text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={emailSubmitting}
                                    className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-500 p-3.5 text-xs font-bold text-white shadow-md transition-all disabled:opacity-50"
                                >
                                    {emailSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                    <span>{isAr ? "إرسال كود التأكيد (الخطوة 1)" : "Send Verification Code"}</span>
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleConfirmEmailChange} className="space-y-4">
                                <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400">
                                    {isAr
                                        ? `تم إرسال كود التأكيد إلى (${newEmail}). يرجى إدخاله لإتمام التحديث.`
                                        : `Verification code sent to (${newEmail}).`}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                        {isAr ? "كود التأكيد *" : "Confirmation Code *"}
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        maxLength={6}
                                        value={emailCode}
                                        onChange={(e) => setEmailCode(e.target.value)}
                                        placeholder="123456"
                                        className="w-full text-center tracking-widest text-lg font-bold rounded-2xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-white/5 p-3 text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={emailSubmitting}
                                    className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 p-3.5 text-xs font-bold text-white shadow-md transition-all disabled:opacity-50"
                                >
                                    {emailSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                    <span>{isAr ? "تأكيد واعتماد البريد الجديد (الخطوة 2)" : "Confirm & Update Email"}</span>
                                </button>

                                <div className="flex items-center justify-between text-xs pt-1">
                                    <button
                                        type="button"
                                        onClick={handleSendEmailCode}
                                        disabled={emailSubmitting}
                                        className="font-bold text-blue-500 hover:text-blue-400 transition-colors"
                                    >
                                        {isAr ? "إعادة إرسال الكود" : "Resend Code"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setEmailStep(1); setEmailNotice(""); setEmailError(""); }}
                                        className="font-bold text-slate-500 hover:text-slate-300 transition-colors"
                                    >
                                        {isAr ? "تعديل البريد" : "Edit Email"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* MODAL 2: Reset Password Workflow (Admin Only - 3 Steps) */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="relative w-full max-w-md rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120] p-6 sm:p-8 shadow-2xl">
                        <button
                            type="button"
                            onClick={() => setShowPasswordModal(false)}
                            className="absolute end-5 top-5 text-slate-400 hover:text-slate-200"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="flex items-center gap-2.5 mb-2 text-purple-500">
                            <KeyRound className="h-5 w-5" />
                            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                                {isAr ? "تعيين كلمة مرور للمستخدم" : "Reset User Password"}
                            </h3>
                        </div>

                        <p className="text-xs text-slate-400 mb-6">
                            {isAr
                                ? `إجراء أمني لإعادة ضبط كلمة المرور لحساب (${user.email}).`
                                : `Security workflow to reset password for (${user.email}).`}
                        </p>

                        {pwNotice && (
                            <div className="mb-4">
                                <Alert variant="info">{pwNotice}</Alert>
                            </div>
                        )}

                        {pwError && (
                            <div className="mb-4">
                                <Alert>{pwError}</Alert>
                            </div>
                        )}

                        {/* Step 1: Send OTP */}
                        {pwStep === 1 && (
                            <div className="space-y-4">
                                <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-400">
                                    {isAr
                                        ? "الخطوة 1: انقر أدناه لإرسال رمز التحقق إلى بريد المستخدم المسجل."
                                        : "Step 1: Click below to generate an OTP code."}
                                </div>

                                <button
                                    type="button"
                                    onClick={handleSendPwOtp}
                                    disabled={pwSubmitting}
                                    className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-purple-600 hover:bg-purple-500 p-3.5 text-xs font-bold text-white shadow-md transition-all disabled:opacity-50"
                                >
                                    {pwSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                    <span>{isAr ? "إرسال رمز التحقق (الخطوة 1)" : "Send OTP Code"}</span>
                                </button>
                            </div>
                        )}

                        {/* Step 2: Verify OTP */}
                        {pwStep === 2 && (
                            <form onSubmit={handleVerifyPwOtp} className="space-y-4">
                                <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-400">
                                    {isAr
                                        ? "الخطوة 2: أدخل رمز التحقق المرسل للتأكد من الصلاحية واستخراج توكن إعادة التعيين."
                                        : "Step 2: Enter the received OTP code."}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                        {isAr ? "رمز التحقق *" : "OTP Code *"}
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        maxLength={6}
                                        value={pwCode}
                                        onChange={(e) => setPwCode(e.target.value)}
                                        placeholder="123456"
                                        className="w-full text-center tracking-widest text-lg font-bold rounded-2xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-white/5 p-3 text-slate-900 dark:text-white focus:border-purple-500 focus:outline-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={pwSubmitting}
                                    className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-purple-600 hover:bg-purple-500 p-3.5 text-xs font-bold text-white shadow-md transition-all disabled:opacity-50"
                                >
                                    {pwSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                    <span>{isAr ? "التحقق من الكود والانتقال للباسورد (الخطوة 2)" : "Verify OTP Code"}</span>
                                </button>

                                <div className="flex items-center justify-between text-xs pt-1">
                                    <button
                                        type="button"
                                        onClick={handleSendPwOtp}
                                        disabled={pwSubmitting}
                                        className="font-bold text-purple-500 hover:text-purple-400 transition-colors"
                                    >
                                        {isAr ? "إعادة إرسال الكود" : "Resend Code"}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Step 3: Set New Password */}
                        {pwStep === 3 && (
                            <form onSubmit={handleApplyNewPassword} className="space-y-4">
                                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
                                    {isAr
                                        ? "الخطوة 3 والأخيرة: تم التحقق بنجاح! أدخل كلمة المرور الجديدة الآن لتثبيتها."
                                        : "Step 3: Verification passed. Set new password."}
                                </div>

                                <Input
                                    id="admin-new-password"
                                    label={isAr ? "كلمة المرور الجديدة *" : "New Password *"}
                                    type="password"
                                    required
                                    minLength={6}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="••••••••"
                                    icon={Lock}
                                />

                                <Input
                                    id="admin-confirm-password"
                                    label={isAr ? "تأكيد كلمة المرور *" : "Confirm Password *"}
                                    type="password"
                                    required
                                    minLength={6}
                                    value={confirmPw}
                                    onChange={(e) => setConfirmPw(e.target.value)}
                                    placeholder="••••••••"
                                    icon={Lock}
                                />

                                <button
                                    type="submit"
                                    disabled={pwSubmitting}
                                    className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 p-3.5 text-xs font-bold text-white shadow-md transition-all disabled:opacity-50"
                                >
                                    {pwSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                                    <span>{isAr ? "تأكيد وتعيين كلمة المرور الجديدة (الخطوة 3)" : "Apply New Password"}</span>
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* MODAL 3: Confirm Permanent Deletion (Danger Zone) */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="relative w-full max-w-md rounded-3xl border border-red-500/30 bg-white dark:bg-[#0B1120] p-6 sm:p-8 shadow-2xl space-y-4">
                        <button
                            type="button"
                            onClick={() => setShowDeleteModal(false)}
                            className="absolute end-5 top-5 text-slate-400 hover:text-slate-200"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="flex items-center gap-3 text-red-500">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20">
                                <Trash2 className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                                    {isAr ? "تأكيد الحذف النهائي" : "Confirm Permanent Deletion"}
                                </h3>
                                <p className="text-xs text-red-500 font-bold">
                                    {isAr ? "تحذير: هذا الإجراء لا يمكن الرجوع عنه!" : "Warning: Irreversible action!"}
                                </p>
                            </div>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            {isAr
                                ? `هل أنت متأكد تماماً من رغبتك في حذف حساب (${user.firstName} ${user.lastName} - @${user.userName}) نهائياً من قاعدة بيانات النظام؟`
                                : `Are you sure you want to permanently delete user (${user.firstName} ${user.lastName})?`}
                        </p>

                        {deleteError && (
                            <div>
                                <Alert>{deleteError}</Alert>
                            </div>
                        )}

                        <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
                            <button
                                type="button"
                                onClick={() => setShowDeleteModal(false)}
                                className="w-1/2 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 py-3 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
                            >
                                {isAr ? "إلغاء التراجع" : "Cancel"}
                            </button>

                            <button
                                type="button"
                                onClick={handleConfirmDelete}
                                disabled={deleteSubmitting}
                                className="w-1/2 inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 hover:bg-red-500 py-3 text-xs font-bold text-white shadow-lg shadow-red-600/30 transition-all disabled:opacity-50"
                            >
                                {deleteSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                <span>{isAr ? "نعم، حذف نهائي" : "Yes, Delete"}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
