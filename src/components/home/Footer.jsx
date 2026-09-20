import { Link } from "react-router-dom";
import { Shield } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";

export default function Footer() {
    const { t, lang, setLang } = useLanguage();
    const { isAdmin, isManager } = useAuth();

    const links = [
        { to: "/", label: t.footer.home },
        ...(isAdmin
            ? [
                { to: "/users", label: lang === "ar" ? "إدارة المستخدمين" : "Users" },
                { to: "/users/new", label: lang === "ar" ? "إضافة مستخدم جديد" : "Add User" }
              ]
            : isManager
            ? [
                { to: "/search", label: t.footer.search },
                { to: "/opinions", label: lang === "ar" ? "الفتاوى القانونية" : "Legal Opinions" }
              ]
            : [{ to: "/search", label: t.footer.search }]),
        { to: "/#features", label: t.nav.features || "Features", isAnchor: true },
        { to: "/#security", label: t.nav.security || "Security", isAnchor: true },
        { to: "/login", label: t.footer.login },
    ];

    return (
        <footer className="border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#050811] px-6 py-14 lg:px-8 text-slate-600 dark:text-slate-400 transition-colors duration-300">
            <div className="mx-auto flex max-w-7xl flex-col gap-8 sm:flex-row sm:justify-between items-start sm:items-center">
                <div className="max-w-sm">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-600 dark:text-blue-400">
                            <Shield className="h-4 w-4" aria-hidden="true" />
                        </div>
                        <span className="text-base font-extrabold text-slate-900 dark:text-white">Legal AI</span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{t.footer.description}</p>
                </div>

                <nav className="flex flex-wrap gap-x-8 gap-y-4" aria-label="Footer navigation">
                    {links.map((link) => (
                        link.isAnchor ? (
                            <a
                                key={link.label}
                                href={link.to}
                                className="text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors hover:text-blue-600 dark:hover:text-white"
                            >
                                {link.label}
                            </a>
                        ) : (
                            <Link
                                key={link.to}
                                to={link.to}
                                className="text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors hover:text-blue-600 dark:hover:text-white"
                            >
                                {link.label}
                            </Link>
                        )
                    ))}
                </nav>

                <div className="flex items-center gap-1 text-xs font-semibold rounded-full border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 p-1" role="group" aria-label="Language switcher">
                    <button
                        type="button"
                        onClick={() => setLang("en")}
                        className={`rounded-full px-2.5 py-1 transition-all ${
                            lang === "en" ? "bg-blue-600 text-white" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        }`}
                        aria-pressed={lang === "en"}
                    >
                        EN
                    </button>
                    <button
                        type="button"
                        onClick={() => setLang("ar")}
                        className={`rounded-full px-2.5 py-1 transition-all ${
                            lang === "ar" ? "bg-blue-600 text-white" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        }`}
                        aria-pressed={lang === "ar"}
                    >
                        عربي
                    </button>
                </div>
            </div>

            <div className="mx-auto mt-10 max-w-7xl border-t border-slate-200 dark:border-white/10 pt-6 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row justify-between items-center gap-4">
                <p>{t.footer.copyright}</p>
                <p>Enterprise AI Legal Assistant</p>
            </div>
        </footer>
    );
}