import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    Shield,
    Menu,
    X,
    User,
    LogOut,
    Sun,
    Moon,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import ConfirmDialog from "../../Pages/profile/ConfirmDialog";

export default function Navbar() {
    const { t, lang, setLang } = useLanguage();
    const { isDark, toggleTheme } = useTheme();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, session, logout, isManager, isAdvisor, isAdmin, role } = useAuth();

    const isAr = lang === "ar";

    const displayName =
        session?.user?.firstName || session?.user?.userName || session?.user?.email || "";

    // Strictly real navigation links mapped to Backend Controllers & Dashboard:
    const navLinks = [];

    if (isAuthenticated) {
        if (isAdmin) {
            navLinks.push({
                to: "/",
                label: isAr ? "الرئيسية" : "Home",
            });
            navLinks.push({
                to: "/dashboard",
                label: isAr ? "لوحة العمل" : "Dashboard",
            });
            navLinks.push({
                to: "/users",
                label: isAr ? "إدارة المستخدمين" : "Users",
                badge: "Admin",
            });
            navLinks.push({
                to: "/users/new",
                label: isAr ? "إضافة مستخدم جديد" : "Add User",
            });
        } else if (isManager) {
            navLinks.push({
                to: "/",
                label: isAr ? "الرئيسية" : "Home",
            });
            navLinks.push({
                to: "/dashboard",
                label: isAr ? "لوحة العمل" : "Dashboard",
            });
            navLinks.push({
                to: "/search",
                label: t.nav.search,
            });
            navLinks.push({
                to: "/opinions",
                label: isAr ? "الفتاوى القانونية" : "Legal Opinions",
                badge: "Manager",
            });
        } else {
            navLinks.push({
                to: "/",
                label: isAr ? "الرئيسية" : "Home",
            });
            navLinks.push({ to: "/search", label: t.nav.search });

            if (isAdvisor) {
                navLinks.push({
                    to: "/opinions",
                    label: isAr ? "فتاواي القانونية" : "My Opinions",
                });
                navLinks.push({
                    to: "/unknown-questions",
                    label: isAr ? "أسئلة بانتظار فتوى" : "Unanswered Questions",
                });
                navLinks.push({
                    to: "/legal-opinion",
                    label: isAr ? "صياغة فتوى جديدة" : "Draft Opinion",
                });
            }
        }
    }

    const handleLogoutRequest = () => {
        setIsLogoutDialogOpen(true);
    };

    const handleLogout = () => {
        logout();
        setIsLogoutDialogOpen(false);
        setIsMenuOpen(false);
        navigate("/");
    };

    return (
        <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-white/10 bg-white/85 dark:bg-[#070A14]/85 backdrop-blur-md text-slate-800 dark:text-white transition-colors duration-200">
            <nav
                className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
                aria-label="Main navigation"
            >
                {/* Brand Logo */}
                <Link to={isAuthenticated ? (isManager ? "/dashboard" : "/") : "/login"} className="flex items-center gap-2.5 group flex-shrink-0">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/10 dark:bg-blue-600/20 border border-blue-500/30 dark:border-blue-500/40 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-all shadow-[0_0_15px_rgba(37,99,235,0.2)]">
                        <Shield className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                        Legal AI
                    </span>
                </Link>

                {/* Center Links (Desktop) */}
                <div className="hidden items-center gap-2 lg:flex">
                    {navLinks.map((link) => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={`flex items-center gap-1.5 text-xs font-bold transition-all px-3 py-1.5 rounded-xl ${
                                pathname === link.to
                                    ? "bg-blue-500/15 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 shadow-sm"
                                    : "text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                            }`}
                            aria-current={pathname === link.to ? "page" : undefined}
                        >
                            <span>{link.label}</span>
                            {link.badge && (
                                <span className="rounded-md bg-purple-500/15 text-purple-600 dark:text-purple-400 text-[10px] font-extrabold px-1.5 py-0.5">
                                    {link.badge}
                                </span>
                            )}
                        </Link>
                    ))}
                </div>

                {/* Right Controls: Theme, Language, Profile/Auth */}
                <div className="hidden items-center gap-2.5 md:flex">
                    {/* Theme Toggle */}
                    <button
                        type="button"
                        onClick={toggleTheme}
                        aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 transition-all hover:bg-slate-200 dark:hover:bg-white/10 hover:scale-105"
                        title={isDark ? "وضع النهار" : "الوضع الليلي"}
                    >
                        {isDark ? (
                            <Sun className="h-4 w-4 text-amber-400" aria-hidden="true" />
                        ) : (
                            <Moon className="h-4 w-4 text-slate-700" aria-hidden="true" />
                        )}
                    </button>

                    {/* Language Switcher */}
                    <div className="flex items-center rounded-full border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 p-1 text-xs font-semibold">
                        <button
                            type="button"
                            onClick={() => setLang("ar")}
                            className={`rounded-full px-2.5 py-1 transition-all ${
                                lang === "ar"
                                    ? "bg-blue-600 text-white shadow-sm font-bold"
                                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                            }`}
                        >
                            عربي
                        </button>
                        <button
                            type="button"
                            onClick={() => setLang("en")}
                            className={`rounded-full px-2.5 py-1 transition-all ${
                                lang === "en"
                                    ? "bg-blue-600 text-white shadow-sm font-bold"
                                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                            }`}
                        >
                            EN
                        </button>
                    </div>

                    {/* User Auth or Sign in */}
                    {isAuthenticated ? (
                        <div className="flex items-center gap-2 border-s border-slate-200 dark:border-white/10 ps-2.5">
                            <Link
                                to="/profile"
                                className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-white hover:border-blue-500/40 transition-all group"
                            >
                                <span className="rounded-md bg-blue-500/15 text-blue-500 px-1.5 py-0.5 text-[10px]">
                                    {role}
                                </span>
                                <span className="truncate max-w-[110px]">{displayName}</span>
                                <User className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-400" />
                            </Link>

                            <button
                                type="button"
                                onClick={handleLogoutRequest}
                                aria-label={t.nav.logout}
                                title={t.nav.logout}
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-400 transition-all"
                            >
                                <LogOut className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            className="rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:scale-105 active:scale-95"
                        >
                            {t.nav.login}
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <div className="flex items-center gap-2 md:hidden">
                    <button
                        type="button"
                        onClick={toggleTheme}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300"
                    >
                        {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5"
                    >
                        {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </nav>

            {/* Mobile Dropdown */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#070A14]/95 p-5 space-y-3">
                    <div className="flex flex-col space-y-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                onClick={() => setIsMenuOpen(false)}
                                className={`flex items-center justify-between rounded-xl p-3 text-sm font-bold ${
                                    pathname === link.to
                                        ? "bg-blue-600 text-white"
                                        : "hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200"
                                }`}
                            >
                                <span>{link.label}</span>
                                {link.badge && (
                                    <span className="rounded-md bg-white/20 px-2 py-0.5 text-xs font-bold">
                                        {link.badge}
                                    </span>
                                )}
                            </Link>
                        ))}
                    </div>

                    <div className="border-t border-slate-200 dark:border-white/10 pt-4">
                        {isAuthenticated ? (
                            <div className="space-y-3">
                                <Link
                                    to="/profile"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center justify-between p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-xs font-bold"
                                >
                                    <span>{displayName}</span>
                                    <span className="text-blue-500">{role}</span>
                                </Link>
                                <button
                                    type="button"
                                    onClick={handleLogoutRequest}
                                    className="w-full rounded-xl bg-red-500/15 border border-red-500/30 p-2.5 text-xs font-bold text-red-500 text-center"
                                >
                                    {t.nav.logout}
                                </button>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                onClick={() => setIsMenuOpen(false)}
                                className="block w-full text-center rounded-xl bg-blue-600 p-3 text-sm font-bold text-white"
                            >
                                {t.nav.login}
                            </Link>
                        )}
                    </div>
                </div>
            )}

            {isLogoutDialogOpen && (
                <ConfirmDialog
                    title={isAr ? "تأكيد تسجيل الخروج" : "Confirm Logout"}
                    message={isAr ? "هل أنت متأكد من رغبتك في تسجيل الخروج؟" : "Are you sure you want to log out?"}
                    confirmLabel={isAr ? "تسجيل الخروج" : "Log out"}
                    cancelLabel={isAr ? "إلغاء" : "Cancel"}
                    onConfirm={handleLogout}
                    onCancel={() => setIsLogoutDialogOpen(false)}
                />
            )}
        </header>
    );
}