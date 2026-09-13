import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(undefined);

export function ThemeProvider({ children }) {
    // Migration flag: switch user immediately to the newly requested luxury light palette
    const [theme, setTheme] = useState(() => {
        const hasMigrated = localStorage.getItem("legal_ai_palette_v1");
        if (!hasMigrated) {
            localStorage.setItem("legal_ai_palette_v1", "true");
            localStorage.setItem("legal_ai_theme", "light");
            return "light";
        }
        const saved = localStorage.getItem("legal_ai_theme");
        if (saved === "light" || saved === "dark") return saved;
        return "light";
    });

    useEffect(() => {
        const root = document.documentElement;
        if (theme === "dark") {
            root.classList.add("dark");
            root.classList.remove("light");
        } else {
            root.classList.add("light");
            root.classList.remove("dark");
        }
        root.setAttribute("data-theme", theme);
        localStorage.setItem("legal_ai_theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark: theme === "dark" }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used inside a <ThemeProvider>.");
    }
    return context;
}
