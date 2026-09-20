import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
    Menu,
    Sparkles,
    Loader2,
    AlertCircle,
} from "lucide-react";

import Navbar from "../../components/home/Navbar";
import ChatSidebar from "../../components/chat/ChatSidebar";
import ChatMessageItem from "../../components/chat/ChatMessageItem";
import ChatEmptyState from "../../components/chat/ChatEmptyState";
import ChatInputBar from "../../components/chat/ChatInputBar";
import NewChatModal from "../../components/chat/NewChatModal";

import {
    getUserConversations,
    createConversation,
    getConversationHistory,
    askConversationQuestion,
    deleteConversation,
} from "../../services/conversationApi";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";

/**
 * SearchPage -> Legal AI ChatGPT-Style Conversation Interface
 * Replaces old keyword search with a state-of-the-art interactive legal chat.
 */
export default function SearchPage() {
    const { lang } = useLanguage();
    const { user } = useAuth();
    const [searchParams] = useSearchParams();

    const isAr = lang === "ar";

    // Sidebar visibility state (toggleable with 3-bars hamburger)
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Conversations state
    const [conversations, setConversations] = useState([]);
    const [activeConversationId, setActiveConversationId] = useState(null);
    const [activeConversationTitle, setActiveConversationTitle] = useState("");
    const [messages, setMessages] = useState([]);

    // Loading states
    const [isLoadingList, setIsLoadingList] = useState(true);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCreatingChat, setIsCreatingChat] = useState(false);
    const [isDeletingId, setIsDeletingId] = useState(null);

    // Error & UI states
    const [pageError, setPageError] = useState("");
    const [inputValue, setInputValue] = useState(() => searchParams.get("q")?.trim() || "");
    const [pendingQuery, setPendingQuery] = useState("");
    const [modalInitialTitle, setModalInitialTitle] = useState("");
    const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);

    // Messages container ref for smooth auto-scroll
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isSubmitting]);

    // 1. Fetch user conversations on mount (DO NOT select any chat on load, keep empty)
    useEffect(() => {
        let isMounted = true;
        async function loadList() {
            setIsLoadingList(true);
            try {
                const list = await getUserConversations();
                if (isMounted) {
                    setConversations(list || []);
                }
            } catch (err) {
                console.warn("Could not fetch conversations on load:", err);
            } finally {
                if (isMounted) setIsLoadingList(false);
            }
        }
        loadList();
        return () => {
            isMounted = false;
        };
    }, [user?.id, user?.email]);

    // 2. Load conversation history when activeConversationId changes
    useEffect(() => {
        if (!activeConversationId) return;

        let isMounted = true;
        async function loadHistory() {
            setIsLoadingHistory(true);
            try {
                const details = await getConversationHistory(activeConversationId);
                if (!isMounted) return;

                if (details) {
                    setActiveConversationTitle((prev) => details.title || prev);
                    setMessages(details.messages || []);
                }
            } catch (err) {
                if (!isMounted) return;
                console.warn("Could not load history for conversation:", err);
            } finally {
                if (isMounted) setIsLoadingHistory(false);
            }
        }

        loadHistory();
        return () => {
            isMounted = false;
        };
    }, [activeConversationId]);

    // Action: Select conversation from sidebar
    const handleSelectConversation = (id) => {
        if (id === activeConversationId) return;
        const target = conversations.find((c) => c.id === id);
        setMessages([]);
        setActiveConversationId(id);
        setActiveConversationTitle(target?.title || "");
    };

    // Action: Open New Chat modal explicitly
    const handleOpenNewChatModal = () => {
        setPendingQuery("");
        setModalInitialTitle("");
        setIsNewChatModalOpen(true);
    };

    // Action: Create new conversation (POST /api/Conversation)
    const handleCreateNewChat = async (title) => {
        setIsCreatingChat(true);
        setPageError("");
        try {
            const newChat = await createConversation(title);
            if (newChat && newChat.id) {
                // Prepend to conversations list
                setConversations((prev) => [newChat, ...prev]);
                setActiveConversationId(newChat.id);
                setActiveConversationTitle(newChat.title || title);
                setMessages([]);
                setIsNewChatModalOpen(false);

                // If user was submitting a search query, execute it in the newly created chat:
                const queryToRun = pendingQuery || inputValue.trim();
                if (queryToRun) {
                    setPendingQuery("");
                    await executeAskQuestion(queryToRun, newChat.id);
                }
            }
        } catch (err) {
            setPageError(
                err?.message || (isAr ? "فشل إنشاء محادثة جديدة." : "Failed to create conversation.")
            );
        } finally {
            setIsCreatingChat(false);
        }
    };

    // Action: Delete conversation (DELETE /api/Conversation/{id})
    const handleDeleteConversation = async (id) => {
        setIsDeletingId(id);
        try {
            await deleteConversation(id);
            setConversations((prev) => prev.filter((c) => c.id !== id));
            if (activeConversationId === id) {
                setActiveConversationId(null);
                setActiveConversationTitle("");
                setMessages([]);
            }
        } catch (err) {
            setPageError(
                err?.message || (isAr ? "فشل حذف المحادثة." : "Failed to delete conversation.")
            );
        } finally {
            setIsDeletingId(null);
        }
    };

    // Action: Send question in active conversation (POST /api/Conversation/Ask)
    const handleSendMessage = async () => {
        const query = inputValue.trim();
        if (!query || isSubmitting) return;

        // If no active conversation, show the modal to specify title first:
        if (!activeConversationId) {
            setPendingQuery(query);
            const cleanQuery = query.replace(/^[؟?\s]+|[؟?\s]+$/g, "");
            const suggestedTitle = cleanQuery.length > 40 ? `${cleanQuery.slice(0, 38)}...` : cleanQuery;
            setModalInitialTitle(suggestedTitle);
            setIsNewChatModalOpen(true);
            return;
        }

        await executeAskQuestion(query, activeConversationId);
    };

    const executeAskQuestion = async (query, conversationId) => {
        // Optimistically append user message
        const userMsg = {
            role: "user",
            content: query,
            timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInputValue("");
        setIsSubmitting(true);
        setPageError("");

        try {
            const result = await askConversationQuestion({
                query,
                conversationId,
            });

            if (result) {
                const assistantMsg = {
                    role: "assistant",
                    content: result.answer || (isAr ? "لا توجد إجابة متاحة." : "No answer available."),
                    citations: result.citations || [],
                    found: result.found !== false,
                    timestamp: new Date().toISOString(),
                };
                setMessages((prev) => [...prev, assistantMsg]);
            }
        } catch (err) {
            const errMsg =
                err?.rawResponse?.ErrorMessage ||
                err?.message ||
                (isAr
                    ? "حدث خطأ أثناء الاتصال بالمساعد الذكي، يرجى المحاولة مرة أخرى."
                    : "An error occurred while connecting to AI. Please try again.");

            // Add error notification assistant message
            const errorMsg = {
                role: "assistant",
                content: errMsg,
                found: false,
                timestamp: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-slate-50 dark:bg-[#070A14] text-slate-900 dark:text-white overflow-hidden">
            {/* Top Global Navbar */}
            <Navbar />

            {/* Chat Body: Sidebar + Main Chat Area */}
            <div className="flex-1 flex overflow-hidden relative">
                {/* 1. History Sidebar */}
                <ChatSidebar
                    isOpen={isSidebarOpen}
                    onToggle={() => setIsSidebarOpen((prev) => !prev)}
                    conversations={conversations}
                    activeConversationId={activeConversationId}
                    onSelectConversation={handleSelectConversation}
                    onOpenNewChatModal={handleOpenNewChatModal}
                    onDeleteConversation={handleDeleteConversation}
                    isLoadingList={isLoadingList}
                    isDeletingId={isDeletingId}
                />

                {/* 2. Main Chat Area */}
                <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#070A14] relative">
                    {/* Chat Header */}
                    <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#070A14]/80 backdrop-blur-md z-10">
                        <div className="flex items-center gap-3 min-w-0">
                            {/* Toggle Sidebar Button (3 bars icon) */}
                            <button
                                type="button"
                                onClick={() => setIsSidebarOpen((prev) => !prev)}
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100/80 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors cursor-pointer"
                                title={isAr ? "إظهار/إخفاء السجل" : "Toggle Sidebar"}
                            >
                                <Menu className="h-5 w-5" />
                            </button>

                            {/* Active Chat Title & Status */}
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <h1 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white truncate max-w-[280px] sm:max-w-xl">
                                        {activeConversationTitle ||
                                            (isAr ? "المساعد القانوني الذكي" : "Legal AI Assistant")}
                                    </h1>
                                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
                                </div>
                                <p className="text-[11px] text-slate-400 truncate">
                                    {activeConversationTitle
                                        ? (isAr ? "مساعد الذكاء الاصطناعي القانوني متصل ومستعد" : "Legal AI connected and ready")
                                        : (isAr ? "ابدأ استفسارك القانوني وسيتم إنشاء محادثة جديدة" : "Ready to start a new legal inquiry")}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Page Error Banner if any */}
                    {pageError && (
                        <div className="m-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-semibold text-red-600 dark:text-red-400 flex items-center justify-between animate-in fade-in">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                <span>{pageError}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setPageError("")}
                                className="text-red-500 hover:opacity-80 cursor-pointer"
                            >
                                &times;
                            </button>
                        </div>
                    )}

                    {/* Messages Scrollable Feed */}
                    <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 scrollbar-thin">
                        {isLoadingHistory ? (
                            <div className="py-24 text-center space-y-3">
                                <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-500" />
                                <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
                                    {isAr
                                        ? "جارٍ استرجاع سجل الرسائل والاستشهادات..."
                                        : "Loading message history and citations..."}
                                </p>
                            </div>
                        ) : messages.length === 0 ? (
                            /* Empty State / Welcome Screen */
                            <ChatEmptyState
                                conversationTitle={activeConversationTitle}
                                onStartNewChat={handleOpenNewChatModal}
                            />
                        ) : (
                            /* Messages List */
                            messages.map((msg, idx) => (
                                <ChatMessageItem key={idx} message={msg} />
                            ))
                        )}

                        {/* AI Thinking / Generating indicator */}
                        {isSubmitting && (
                            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 animate-pulse ps-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-500">
                                    <Sparkles className="h-4 w-4 animate-spin" />
                                </div>
                                <span>
                                    {isAr
                                        ? "المساعد يفحص السجلات والوثائق القانونية المعتمدة لاستخلاص الإجابة..."
                                        : "Analyzing legal precedents and certified records..."}
                                </span>
                            </div>
                        )}

                        {/* Dummy element to auto-scroll to bottom */}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Chat Input Bar */}
                    <ChatInputBar
                        inputValue={inputValue}
                        setInputValue={setInputValue}
                        onSend={handleSendMessage}
                        isSubmitting={isSubmitting || isCreatingChat}
                        disabled={isLoadingHistory}
                        placeholder={
                            !activeConversationId
                                ? isAr
                                    ? "اطرح استفسارك القانوني هنا للبحث... (Enter للإرسال)"
                                    : "Ask your legal question here to search... (Enter)"
                                : isAr
                                ? "اطرح استفسارك القانوني هنا... (Enter للإرسال)"
                                : "Ask your legal question here... (Enter to send)"
                        }
                    />
                </main>
            </div>

            {/* Modal: Create New Chat with Title */}
            <NewChatModal
                key={`${isNewChatModalOpen}-${modalInitialTitle}`}
                isOpen={isNewChatModalOpen}
                onClose={() => {
                    setIsNewChatModalOpen(false);
                    setPendingQuery("");
                    setModalInitialTitle("");
                }}
                onSubmit={handleCreateNewChat}
                isCreating={isCreatingChat}
                initialTitle={modalInitialTitle}
            />
        </div>
    );
}