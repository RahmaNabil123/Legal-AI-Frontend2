import { Navigate, useLocation, Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

/**
 * Enterprise ProtectedRoute with Role-Based Access Control.
 *
 * Props:
 * - allowedRoles: Array of allowed role names, e.g. ["Legal Advisor"]
 */
export default function ProtectedRoute({ children, allowedRoles }) {
    const { isAuthenticated, role, hasRole, isAdmin, isManager } = useAuth();
    const { dir } = useLanguage();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    if (allowedRoles && allowedRoles.length > 0 && !hasRole(allowedRoles)) {
        const BackArrow = dir === "rtl" ? ArrowRight : ArrowLeft;
        return (
            <div className="flex min-h-[70vh] items-center justify-center px-6 py-16">
                <div className="w-full max-w-md rounded-3xl border border-red-500/20 bg-white dark:bg-[#0B1120] p-8 text-center shadow-2xl backdrop-blur-md">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20">
                        <ShieldAlert className="h-7 w-7" aria-hidden="true" />
                    </div>
                    <h1 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
                        {dir === "rtl" ? "غير مصرح بالدخول" : "Access Restricted"}
                    </h1>
                    <p className="mt-2.5 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        {dir === "rtl"
                            ? `هذه الصفحة تتطلب صلاحية (${allowedRoles.join(" أو ")}). دورك الحالي هو: (${role || "غير محدد"}).`
                            : `This page requires ${allowedRoles.join(" or ")} role. Your current role is: ${role || "Unspecified"}.`}
                    </p>
                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                        <Link
                            to={isAdmin ? "/users" : isManager ? "/dashboard" : "/"}
                            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all"
                        >
                            <BackArrow className="h-4 w-4" />
                            <span>
                                {isAdmin
                                    ? (dir === "rtl" ? "الانتقال لإدارة المستخدمين" : "Go to Users")
                                    : isManager
                                    ? (dir === "rtl" ? "العودة للوحة العمل" : "Back to Dashboard")
                                    : (dir === "rtl" ? "العودة للرئيسية" : "Back to Home")}
                            </span>
                        </Link>
                        {isAdmin && (
                            <Link
                                to="/"
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-5 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
                            >
                                <span>{dir === "rtl" ? "الصفحة الرئيسية" : "Home"}</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return children;
}