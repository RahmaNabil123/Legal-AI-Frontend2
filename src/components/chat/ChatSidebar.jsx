import { useState } from "react";
import {
    Plus,
    MessageSquare,
    Trash2,
    Search,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    Calendar,
    Loader2,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

/**
 * ChatSidebar Component
 * Displays user conversations history with options to:
 * - Start a new chat (+ محادثة جديدة)
 * - Select an existing chat
 * - Delete a chat
 * - Search within chats
 * - Toggle visibility (collapse / expand)
 */
export default function ChatSidebar({
    isOpen,
    onToggle,
    conversations = [],
    activeConversationId,
    onSelectConversation,
    onOpenNewChatModal,
    onDeleteConversation,
    isLoadingList,
    isDeletingId,
}) {
    const { lang, dir } = useLanguage();
    const isAr = lang === "ar";
    const isRtl = dir === "rtl";

    const [filterQuery, setFilterQuery] = useState("");
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    const filteredConversations = conversations.filter((c) => {
        if (!filterQuery.trim()) return true;
        return (c.title || "").toLowerCase().includes(filterQuery.toLowerCase().trim());
    });

    const formatTimestamp = (dateStr) => {
        if (!dateStr || dateStr.startsWith("0001")) return isAr ? "سابقاً" : "Earlier";
        try {
            const date = new Date(dateStr);
            const now = new Date();
            const diffMs = now - date;
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

            if (diffDays === 0) {
                return date.toLocaleTimeString(isAr ? "ar-EG" : "en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                });
            }
            if (diffDays === 1) return isAr ? "أمس" : "Yesterday";
            if (diffDays < 7) return isAr ? `منذ ${diffDays} أيام` : `${diffDays} days ago`;

            return date.toLocaleDateString(isAr ? "ar-EG" : "en-US", {
                month: "short",
                day: "numeric",
            });
        } catch {
            return dateStr;
        }
    };

    const CollapseIcon = isRtl
        ? isOpen
            ? ChevronRight
            : ChevronLeft
        : isOpen
        ? ChevronLeft
        : ChevronRight;

    return (
        <>
            {/* Mobile Overlay backdrop */}
            {isOpen && (
                <div
                    onClick={onToggle}
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
                    aria-hidden="true"
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={`fixed lg:static top-0 bottom-0 z-40 flex flex-col w-72 sm:w-80 bg-white dark:bg-[#090E1A] border-e border-slate-200 dark:border-white/10 shadow-2xl lg:shadow-none transition-all duration-300 ease-in-out ${
                    isOpen ? "translate-x-0" : isRtl ? "translate-x-full lg:-ms-80" : "-translate-x-full lg:-ms-80"
                }`}
                style={{ height: "100%" }}
            >
                {/* Sidebar Header & New Chat Button */}
                <div className="p-4 border-b border-slate-100 dark:border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400">
                                <Sparkles className="h-4 w-4" />
                            </div>
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                                {isAr ? "سجل المحادثات" : "Chat History"}
                            </h2>
                        </div>

                        {/* Toggle Collapse Button on mobile or desktop */}
                        <button
                            type="button"
                            onClick={onToggle}
                            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                            title={isAr ? "إغلاق السجل" : "Close Sidebar"}
                        >
                            <CollapseIcon className="h-4 w-4" />
                        </button>
                    </div>

                    {/* New Chat Button */}
                    <button
                        type="button"
                        onClick={onOpenNewChatModal}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    >
                        <Plus className="h-4 w-4" />
                        <span>{isAr ? "بدء محادثة جديدة" : "Start New Chat"}</span>
                    </button>

                    {/* Search in conversations */}
                    {conversations.length > 3 && (
                        <div className="relative">
                            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                            <input
                                type="text"
                                value={filterQuery}
                                onChange={(e) => setFilterQuery(e.target.value)}
                                placeholder={isAr ? "بحث في المحادثات..." : "Search chats..."}
                                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 py-1.5 ps-8 pe-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                    )}
                </div>

                {/* Conversations List */}
                <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin">
                    {isLoadingList ? (
                        <div className="py-12 text-center space-y-2">
                            <Loader2 className="mx-auto h-6 w-6 animate-spin text-blue-500" />
                            <p className="text-xs text-slate-400">
                                {isAr ? "جارٍ تحميل السجل..." : "Loading chats..."}
                            </p>
                        </div>
                    ) : filteredConversations.length === 0 ? (
                        <div className="py-12 text-center px-4 space-y-2">
                            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-400">
                                <MessageSquare className="h-5 w-5" />
                            </div>
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                {filterQuery
                                    ? isAr
                                        ? "لا توجد نتائج مطابقة"
                                        : "No matching chats"
                                    : isAr
                                    ? "لا توجد محادثات سابقة حتى الآن"
                                    : "No chat history yet"}
                            </p>
                            <p className="text-[11px] text-slate-400">
                                {isAr
                                    ? "ابدأ محادثة جديدة مع المساعد القانوني لطرح استفساراتك."
                                    : "Start a new chat to consult the Legal AI."}
                            </p>
                        </div>
                    ) : (
                        filteredConversations.map((conv) => {
                            const isActive = String(conv.id) === String(activeConversationId);
                            const isDeleting = isDeletingId === conv.id;

                            return (
                                <div
                                    key={conv.id}
                                    className={`group relative flex items-center justify-between rounded-2xl px-3 py-2.5 text-xs font-medium transition-all cursor-pointer ${
                                        isActive
                                            ? "bg-blue-600/15 border border-blue-500/30 text-blue-600 dark:text-blue-400 font-bold shadow-xs"
                                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                                    }`}
                                    onClick={() => onSelectConversation(conv.id)}
                                >
                                    <div className="flex items-center gap-2.5 min-w-0 flex-1 pe-2">
                                        <MessageSquare
                                            className={`h-4 w-4 flex-shrink-0 ${
                                                isActive
                                                    ? "text-blue-600 dark:text-blue-400"
                                                    : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200"
                                            }`}
                                        />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-start" title={conv.title}>
                                                {conv.title || (isAr ? "محادثة بدون عنوان" : "Untitled Chat")}
                                            </p>
                                            <span className="flex items-center gap-1 text-[10px] text-slate-400 font-normal">
                                                <Calendar className="h-2.5 w-2.5" />
                                                <span>{formatTimestamp(conv.createdAt || conv.updatedAt)}</span>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Button: Delete */}
                                    <div className="flex items-center gap-1">
                                        {confirmDeleteId === conv.id ? (
                                            <div
                                                className="flex items-center gap-1 bg-red-500/10 border border-red-500/25 rounded-lg px-1.5 py-0.5"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        onDeleteConversation(conv.id);
                                                        setConfirmDeleteId(null);
                                                    }}
                                                    disabled={isDeleting}
                                                    className="text-[10px] font-bold text-red-600 dark:text-red-400 hover:underline"
                                                >
                                                    {isDeleting ? "..." : isAr ? "تأكيد" : "Yes"}
                                                </button>
                                                <span className="text-slate-300">|</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setConfirmDeleteId(null)}
                                                    className="text-[10px] text-slate-400 hover:text-slate-200"
                                                >
                                                    {isAr ? "إلغاء" : "No"}
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setConfirmDeleteId(conv.id);
                                                }}
                                                className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
                                                title={isAr ? "حذف المحادثة" : "Delete Chat"}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Sidebar Footer */}
                <div className="p-3 border-t border-slate-100 dark:border-white/10 text-center">
                    <p className="text-[11px] text-slate-400">
                        {isAr
                            ? "محادثاتك محفوظة ومشفرة لحسابك الخاص فقط."
                            : "Your chats are private and saved to your account."}
                    </p>
                </div>
            </aside>
        </>
    );
}
