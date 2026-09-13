import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, WifiOff, Sparkles, FilePenLine, Info, RotateCcw } from "lucide-react";

import Navbar from "../../components/home/Navbar";
import SearchInput from "../../components/search/SearchInput";
import SuggestedQuestions from "../../components/search/SuggestedQuestions";
import SearchEmptyState from "../../components/search/SearchEmptyState";
import SearchLoading from "../../components/search/SearchLoading";
import AnswerCard from "../../components/search/AnswerCard";
import KeyFindings from "../../components/search/KeyFindings";
import PrecedentCard from "../../components/search/PrecedentCard";
import CaseDetailsDrawer from "../../components/search/CaseDetailsDrawer";
import SearchHistory from "../../components/search/SearchHistory";
import SearchFilters from "../../components/search/SearchFilters";

import { searchLegalPrecedent } from "../../services/searchApi";
import { getErrorMessage } from "../../services/apiError";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { getRecentSearches, saveRecentSearch, clearRecentSearches } from "../../utils/recentSearches";

import "./SearchPage.css";

export default function SearchPage() {
    const { t } = useLanguage();
    const { isAdvisor, isLawyer, role, user } = useAuth();
    const navigate = useNavigate();

    const userId = user?.id || user?.userName || user?.email || "default";

    const [inputValue, setInputValue] = useState("");
    const [submittedQuery, setSubmittedQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [selectedPrecedent, setSelectedPrecedent] = useState(null);
    const [history, setHistory] = useState(() => getRecentSearches(userId));

    useEffect(() => {
        setHistory(getRecentSearches(userId));
        const timer = setInterval(() => {
            setHistory(getRecentSearches(userId));
        }, 60000);
        return () => clearInterval(timer);
    }, [userId]);

    const runSearch = async (query) => {
        if (!query || !query.trim()) return;
        const cleanQuery = query.trim();

        setInputValue(cleanQuery);
        setSubmittedQuery(cleanQuery);
        setResults(null);
        setError(null);
        setIsLoading(true);

        const updatedHistory = saveRecentSearch(cleanQuery, userId);
        if (updatedHistory) {
            setHistory(updatedHistory);
        }

        try {
            const data = await searchLegalPrecedent(cleanQuery);
            setResults(data);
        } catch (err) {
            setError(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRetry = () => {
        if (submittedQuery) runSearch(submittedQuery);
    };

    const handleReset = () => {
        setResults(null);
        setError(null);
        setSubmittedQuery("");
        setInputValue("");
    };

    const handleClearHistory = () => {
        clearRecentSearches(userId);
        setHistory([]);
    };

    const handleAddOpinion = () => {
        navigate("/legal-opinion", {
            state: { question: submittedQuery || inputValue },
        });
    };

    const isNetworkError = error && error.status === null;
    const showResults = !isLoading && !error && results;
    const hasContent =
        results &&
        results.hasAnswer !== false &&
        (Boolean(results.answer?.trim()) ||
            (Array.isArray(results.selected_legal_evidence) && results.selected_legal_evidence.length > 0));
    const showNoResults = showResults && !hasContent;
    const showAnswer = showResults && hasContent;
    const showPreSearch = !isLoading && !error && !results;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#070A14] text-slate-900 dark:text-white transition-colors duration-200">
            <Navbar />

            {/* Ambient background glows */}
            <div className="relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

                <main className="relative mx-auto max-w-7xl px-6 py-12 lg:px-8">
                    {/* Search Header */}
                    <div className="mx-auto max-w-3xl text-center">
                        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 mb-4">
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>{t.hero?.badge || "AI Legal Search & Analysis"}</span>
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
                            {t.search.hero.title}
                        </h1>
                        <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-400">
                            {t.search.hero.subtitle}
                        </p>
                    </div>

                    {/* Search Bar & Suggestions */}
                    <div className="mx-auto mt-10 max-w-3xl">
                        <SearchInput
                            value={inputValue}
                            onChange={setInputValue}
                            onSubmit={runSearch}
                            onClear={handleReset}
                            isLoading={isLoading}
                        />

                        {showPreSearch && (
                            <>
                                <SuggestedQuestions onSelect={runSearch} />
                                <SearchHistory
                                    items={history}
                                    onSelect={runSearch}
                                    onClear={handleClearHistory}
                                />
                            </>
                        )}
                    </div>

                    {/* State Renderings */}
                    <div className="mx-auto mt-10 max-w-3xl">
                        {showPreSearch && <SearchEmptyState />}

                        {isLoading && <SearchLoading />}

                        {/* Distinct API / Network Error State */}
                        {error && (
                            <div className="rounded-3xl border border-red-500/30 bg-red-500/5 p-8 text-center backdrop-blur-md shadow-xl">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20">
                                    {isNetworkError ? (
                                        <WifiOff className="h-6 w-6" aria-hidden="true" />
                                    ) : (
                                        <AlertTriangle className="h-6 w-6" aria-hidden="true" />
                                    )}
                                </div>
                                <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
                                    {isNetworkError ? t.search.error.networkTitle : t.search.error.serverTitle}
                                </h2>
                                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                                    {isNetworkError ? t.search.error.networkBody : t.search.error.serverBody}
                                    <span className="sr-only">({getErrorMessage(error)})</span>
                                </p>
                                <button
                                    type="button"
                                    onClick={handleRetry}
                                    className="mt-6 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-500"
                                >
                                    {t.search.error.tryAgain}
                                </button>
                            </div>
                        )}

                        {/* Distinct "No Answer Found" State */}
                        {showNoResults && (
                            <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120]/90 p-8 sm:p-10 text-center backdrop-blur-md shadow-xl">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20 mb-4">
                                    <Info className="h-7 w-7" />
                                </div>
                                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                                    {t.search.noResults.title}
                                </h2>
                                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                                    {t.search.noResults.body}
                                </p>

                                {/* ROLE SPECIFIC BEHAVIOR: Legal Advisor gets [Add Opinion] button */}
                                {isAdvisor ? (
                                    <div className="mt-8 rounded-2xl border border-purple-500/30 bg-purple-500/5 p-6 text-start">
                                        <div className="flex items-start gap-4">
                                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 mt-0.5">
                                                <FilePenLine className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                                    {t.search.noResults.addOpinionTitle}
                                                </h3>
                                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                                    {t.search.noResults.addOpinionDesc}
                                                </p>
                                                <div className="mt-4 flex flex-wrap items-center gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={handleAddOpinion}
                                                        className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-purple-600/25 hover:bg-purple-500 transition-all active:scale-95"
                                                    >
                                                        <FilePenLine className="h-4 w-4" />
                                                        <span>{t.search.noResults.addOpinionBtn}</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={handleReset}
                                                        className="rounded-xl border border-slate-200 dark:border-white/10 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                                                    >
                                                        {t.search.noResults.searchAgain}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* Lawyer / Other Roles notice: No Add Opinion button */
                                    <div className="mt-6 flex flex-col items-center">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4">
                                            {t.search.noResults.lawyerNotice}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={handleReset}
                                            className="rounded-xl border border-slate-200 dark:border-white/10 px-6 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-200 transition-colors hover:bg-slate-100 dark:hover:bg-white/5"
                                        >
                                            {t.search.noResults.searchAgain}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Results Display - Focused on Real AI & Evidence Output */}
                    {showAnswer && (
                        <div className="mx-auto mt-12 max-w-4xl space-y-6">
                            <div className="result-fade-in rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120]/80 p-6 shadow-sm backdrop-blur-md">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                                        {t.search.yourQuestion}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={handleReset}
                                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                                    >
                                        <RotateCcw className="h-3 w-3 text-blue-500" />
                                        <span>{t.search.noResults.searchAgain || "بحث جديد"}</span>
                                    </button>
                                </div>
                                <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                                    "{results.question || results.query}"
                                </p>
                            </div>

                            <div className="result-fade-in" style={{ animationDelay: "80ms" }}>
                                <AnswerCard
                                    answer={results.answer}
                                    source={results.source}
                                    selected_legal_evidence={results.selected_legal_evidence}
                                    citations={results.citations}
                                />
                            </div>
                        </div>
                    )}
                </main>
            </div>

            <CaseDetailsDrawer precedent={selectedPrecedent} onClose={() => setSelectedPrecedent(null)} />
        </div>
    );
}