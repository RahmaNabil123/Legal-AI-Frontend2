import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { translations } from "../i18n/translations";

/**
 * App-wide language context.
 * Default language is Arabic ("ar") as requested by the user.
 */
const LanguageContext = createContext(undefined);

export function LanguageProvider({ children }) {
    const [lang, setLangState] = useState(() => {
        const saved = localStorage.getItem("legal_ai_lang");
        return saved === "en" || saved === "ar" ? saved : "ar"; // default to Arabic
    });

    const setLang = (newLang) => {
        setLangState(newLang);
        localStorage.setItem("legal_ai_lang", newLang);
    };

    const dir = lang === "ar" ? "rtl" : "ltr";

    useEffect(() => {
        document.documentElement.lang = lang;
        document.documentElement.dir = dir;
    }, [lang, dir]);

    const t = useMemo(() => translations[lang] || translations.ar, [lang]);

    const value = useMemo(() => ({ lang, dir, t, setLang }), [lang, dir, t]);

    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used inside a <LanguageProvider>.");
    }
    return context;
}