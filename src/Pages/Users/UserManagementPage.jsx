import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Users,
    UserPlus,
    Search,
    Shield,
    CheckCircle2,
    XCircle,
    MoreHorizontal,
    Trash2,
    Eye,
    Power,
    Loader2,
    SlidersHorizontal,
    Briefcase,
    Scale,
    ShieldCheck,
    Mail,
    Phone,
} from "lucide-react";
import Navbar from "../../components/home/Navbar";
import Alert from "../../components/Alert/Alert";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { getUsers, toggleUserStatus, deleteUser } from "../../services/userApi";

export default function UserManagementPage() {
    const { lang } = useLanguage();
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const isAr = lang === "ar";

    const [users, setUsers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [roleFilter, setRoleFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [error, setError] = useState("");
    const searchContainerRef = useRef(null);

    // Initial load for all users to support instant 3-char autocomplete
    useEffect(() => {
        async function fetchAll() {
            try {
                const data = await getUsers();
                setAllUsers(data || []);
            } catch {
                // Ignore silent prefetch error
            }
        }
        fetchAll();
    }, []);

    // Close suggestions on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const loadUsers = useCallback(async () => {
        setIsLoading(true);
        setError("");
        try {
            const data = await getUsers({
                search: searchQuery.trim() || undefined,
                role: roleFilter,
                status: statusFilter,
            });
            setUsers(data || []);
        } catch {
            setError(isAr ? "تعذر تحميل قائمة المستخدمين." : "Failed to load users list.");
        } finally {
            setIsLoading(false);
        }
    }, [searchQuery, roleFilter, statusFilter, isAr]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const handleToggleStatus = async (id, currentStatus) => {
        const isSelf = Boolean(
            currentUser &&
            (
                String(currentUser.id) === String(id) ||
                users.some(u => String(u.id) === String(id) && (
                    (currentUser.email && u.email && currentUser.email.trim().toLowerCase() === u.email.trim().toLowerCase()) ||
                    (currentUser.userName && u.userName && currentUser.userName.trim().toLowerCase() === u.userName.trim().toLowerCase())
                ))
            )
        );
        if (isSelf) {
            setError(isAr ? "لا يمكنك حظر أو تعطيل حسابك الحالي المسجل به كمسؤول للنظام." : "Cannot block or deactivate your own active account.");
            return;
        }

        try {
            await toggleUserStatus(id, currentStatus);
            setUsers((prev) =>
                prev.map((u) => (u.id === id ? { ...u, isActive: !currentStatus } : u))
            );
            setAllUsers((prev) =>
                prev.map((u) => (u.id === id ? { ...u, isActive: !currentStatus } : u))
            );
        } catch {
            setError(isAr ? "فشل تعديل حالة المستخدم." : "Failed to change user status.");
        }
    };

    const handleDelete = async (id) => {
        const isSelf = Boolean(
            currentUser &&
            (
                String(currentUser.id) === String(id) ||
                users.some(u => String(u.id) === String(id) && (
                    (currentUser.email && u.email && currentUser.email.trim().toLowerCase() === u.email.trim().toLowerCase()) ||
                    (currentUser.userName && u.userName && currentUser.userName.trim().toLowerCase() === u.userName.trim().toLowerCase())
                ))
            )
        );
        if (isSelf) {
            setError(isAr ? "لا يمكنك حذف حسابك الحالي المسجل به في المنظومة." : "Cannot delete your own active account.");
            return;
        }

        if (!window.confirm(isAr ? "هل أنت متأكد من حذف هذا المستخدم نهائياً؟" : "Are you sure to delete this user?")) {
            return;
        }

        try {
            await deleteUser(id);
            setUsers((prev) => prev.filter((u) => u.id !== id));
        } catch {
            setError(isAr ? "فشل حذف المستخدم." : "Failed to delete user.");
        }
    };

    const getRoleBadge = (role) => {
        if (role === "Legal Advisor") {
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/15 border border-purple-500/30 px-3 py-1 text-xs font-bold text-purple-600 dark:text-purple-400">
                    <Scale className="h-3.5 w-3.5" />
                    <span>{isAr ? "مستشار قانوني" : "Legal Advisor"}</span>
                </span>
            );
        }
        if (role === "Legal Manager") {
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>{isAr ? "مدير قانوني" : "Legal Manager"}</span>
                </span>
            );
        }
        if (role === "System Administrator") {
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                    <Shield className="h-3.5 w-3.5" />
                    <span>{isAr ? "مسؤول النظام" : "System Admin"}</span>
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/15 border border-blue-500/30 px-3 py-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                <Briefcase className="h-3.5 w-3.5" />
                <span>{isAr ? "محامي" : "Lawyer"}</span>
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#070A14] text-slate-900 dark:text-white transition-colors duration-200">
            <Navbar />

            <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="rounded-full bg-blue-500/15 border border-blue-500/30 px-3 py-0.5 text-xs font-bold text-blue-500">
                                {isAr ? "إدارة الصلاحيات والوصول" : "Access & User Governance"}
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                            {isAr ? "إدارة مستخدمي المنظومة" : "User Management"}
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {isAr
                                ? "إدارة حسابات المستشارين والمحامين والمديرين، وتعيين الصلاحيات وتفعيل الحسابات."
                                : "Manage roles, permissions, and institutional banking access."}
                        </p>
                    </div>

                    <Link
                        to="/users/new"
                        className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition-all hover:scale-105 active:scale-95"
                    >
                        <UserPlus className="h-4 w-4" />
                        <span>{isAr ? "إضافة مستخدم جديد" : "Add New User"}</span>
                    </Link>
                </div>

                {error && (
                    <div className="mb-6">
                        <Alert>{error}</Alert>
                    </div>
                )}

                {/* Filter and Search Bar */}
                <div className="relative z-30 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120]/80 p-5 shadow-xl backdrop-blur-md mb-8">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                        {/* Search Bar with Auto-Suggestions on 3+ characters */}
                        <div ref={searchContainerRef} className="relative z-40 w-full lg:w-96">
                            <Search className="absolute top-1/2 -translate-y-1/2 start-3.5 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder={isAr ? "بحث بالاسم أو رقم الهاتف…" : "Search by name or phone..."}
                                value={searchQuery}
                                onFocus={() => {
                                    if (searchQuery.trim().length >= 3) setShowSuggestions(true);
                                }}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    if (e.target.value.trim().length >= 3) {
                                        setShowSuggestions(true);
                                    } else {
                                        setShowSuggestions(false);
                                    }
                                }}
                                className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0E1528] py-2.5 pe-4 ps-10 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
                            />

                            {/* Dropdown Suggestions */}
                            {showSuggestions && searchQuery.trim().length >= 3 && (
                                <div className="absolute top-full start-0 end-0 mt-2 z-50 rounded-2xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#0E1528] shadow-2xl shadow-black/60 p-2 max-h-72 overflow-y-auto backdrop-blur-xl">
                                    {(() => {
                                        const q = searchQuery.trim().toLowerCase();
                                        const filtered = allUsers.filter((u) => {
                                            const fullName = `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase();
                                            const revName = `${u.lastName || ""} ${u.firstName || ""}`.toLowerCase();
                                            const phone = (u.phoneNumber || "").toLowerCase();
                                            const username = (u.userName || "").toLowerCase();
                                            const email = (u.email || "").toLowerCase();
                                            return (
                                                fullName.includes(q) ||
                                                revName.includes(q) ||
                                                phone.includes(q) ||
                                                username.includes(q) ||
                                                email.includes(q)
                                            );
                                        }).slice(0, 6);

                                        if (filtered.length === 0) {
                                            return (
                                                <div className="p-3 text-center text-xs text-slate-400">
                                                    {isAr ? "لا توجد اقتراحات مطابقة" : "No matching suggestions"}
                                                </div>
                                            );
                                        }

                                        return (
                                            <div className="space-y-1">
                                                <p className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                    {isAr ? "اقتراحات المستخدمين (اضغط لفتح الملف، أو تصفية للجدول)" : "Suggestions (Click to open, or filter table)"}
                                                </p>
                                                {filtered.map((s) => (
                                                    <div
                                                        key={s.id}
                                                        onClick={() => {
                                                            navigate(`/users/${s.id}`);
                                                            setShowSuggestions(false);
                                                        }}
                                                        className="w-full flex items-center justify-between p-2 rounded-xl text-start hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group cursor-pointer"
                                                    >
                                                        <div className="flex items-center gap-2.5">
                                                            {s.profilePicture && s.profilePicture !== "No Profile Picture" ? (
                                                                <img
                                                                    src={s.profilePicture}
                                                                    alt={s.firstName}
                                                                    className="h-8 w-8 rounded-lg object-cover"
                                                                />
                                                            ) : (
                                                                <div className="h-8 w-8 rounded-lg bg-blue-500/15 border border-blue-500/20 text-blue-500 flex items-center justify-center font-bold text-xs">
                                                                    {s.firstName?.[0]}
                                                                </div>
                                                            )}
                                                            <div>
                                                                <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors">
                                                                    {s.firstName} {s.lastName}
                                                                </p>
                                                                <p className="text-[10px] text-slate-400 font-mono">
                                                                    {s.phoneNumber ? `${s.phoneNumber} · ` : ""}@{s.userName}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-400">
                                                                {s.role}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSearchQuery(`${s.firstName} ${s.lastName}`);
                                                                    setShowSuggestions(false);
                                                                }}
                                                                className="text-[10px] font-bold text-blue-500 hover:text-blue-600 px-2 py-1 rounded-lg hover:bg-blue-500/10 transition-colors border border-blue-500/20"
                                                                title={isAr ? "تصفية الجدول بهذا الاسم" : "Filter table"}
                                                            >
                                                                {isAr ? "تصفية" : "Filter"}
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}
                        </div>

                        {/* Select Filters */}
                        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                            {/* Role Select */}
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-[#0E1528] px-3.5 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:border-blue-500 focus:outline-none"
                            >
                                <option value="ALL">{isAr ? "كافة الأدوار" : "All Roles"}</option>
                                <option value="Legal Advisor">{isAr ? "مستشار قانوني" : "Legal Advisor"}</option>
                                <option value="Lawyer">{isAr ? "محامي" : "Lawyer"}</option>
                                <option value="Legal Manager">{isAr ? "مدير الشؤون القانونية" : "Legal Manager"}</option>
                                <option value="System Administrator">{isAr ? "مسؤول النظام" : "System Admin"}</option>
                            </select>

                            {/* Status Select */}
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-[#0E1528] px-3.5 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:border-blue-500 focus:outline-none"
                            >
                                <option value="ALL">{isAr ? "كافة الحالات" : "All Statuses"}</option>
                                <option value="ACTIVE">{isAr ? "نشط فقط" : "Active Only"}</option>
                                <option value="INACTIVE">{isAr ? "معطل" : "Inactive"}</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="relative z-10 overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120]/80 shadow-xl backdrop-blur-md">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20 text-slate-500">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-500 me-2" />
                            <span>{isAr ? "جارٍ تحميل المستخدمين…" : "Loading users..."}</span>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">
                            <Users className="mx-auto h-12 w-12 text-slate-400 mb-3 opacity-60" />
                            <p className="font-bold text-sm">{isAr ? "لم يتم العثور على مستخدمين مطابقين" : "No users found"}</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-start text-xs">
                                <thead className="border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] text-slate-500 uppercase tracking-wider font-extrabold">
                                    <tr>
                                        <th className="py-4 px-6">{isAr ? "المستخدم" : "User"}</th>
                                        <th className="py-4 px-6">{isAr ? "اسم المستخدم" : "Username"}</th>
                                        <th className="py-4 px-6">{isAr ? "الدور الوظيفي" : "Role"}</th>
                                        <th className="py-4 px-6">{isAr ? "رقم الهاتف" : "Phone"}</th>
                                        <th className="py-4 px-6">{isAr ? "المحافظة" : "Governorate"}</th>
                                        <th className="py-4 px-6">{isAr ? "الحالة" : "Status"}</th>
                                        <th className="py-4 px-6 text-center">{isAr ? "الإجراءات" : "Actions"}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-medium">
                                    {users.map((u) => {
                                        const hasPicture = u.profilePicture && u.profilePicture !== "No Profile Picture";
                                        return (
                                            <tr
                                                key={u.id}
                                                className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors"
                                            >
                                                {/* User Info */}
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        {hasPicture ? (
                                                            <img
                                                                src={u.profilePicture}
                                                                alt={`${u.firstName} ${u.lastName}`}
                                                                className="h-10 w-10 flex-shrink-0 rounded-xl object-cover border border-slate-200 dark:border-white/10 shadow-sm"
                                                            />
                                                        ) : (
                                                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600/30 to-purple-600/30 border border-blue-500/20 text-sm font-extrabold text-blue-400">
                                                                {u.firstName?.[0]}
                                                                {u.lastName?.[0]}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <Link
                                                                    to={`/users/${u.id}`}
                                                                    className="font-bold text-slate-900 dark:text-white hover:text-blue-500 transition-colors"
                                                                >
                                                                    {u.firstName} {u.lastName}
                                                                </Link>
                                                                {Boolean(
                                                                    currentUser &&
                                                                    (
                                                                        String(currentUser.id) === String(u.id) ||
                                                                        (currentUser.email && u.email && currentUser.email.trim().toLowerCase() === u.email.trim().toLowerCase()) ||
                                                                        (currentUser.userName && u.userName && currentUser.userName.trim().toLowerCase() === u.userName.trim().toLowerCase())
                                                                    )
                                                                ) && (
                                                                    <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/15 border border-blue-500/30 px-1.5 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                                                                        {isAr ? "أنت (الحساب الحالي)" : "You (Current)"}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                                                <Mail className="h-3 w-3" />
                                                                <span>{u.email}</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Username (e.g. M89276) */}
                                                <td className="py-4 px-6">
                                                    <span className="font-mono font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/10">
                                                        {u.userName}
                                                    </span>
                                                </td>

                                                {/* Role */}
                                                <td className="py-4 px-6">{getRoleBadge(u.role)}</td>

                                                {/* Phone Number */}
                                                <td className="py-4 px-6 text-slate-600 dark:text-slate-300 font-mono">
                                                    {u.phoneNumber || "—"}
                                                </td>

                                                {/* Governorate */}
                                                <td className="py-4 px-6 text-slate-600 dark:text-slate-300">
                                                    {u.governorate || "—"}
                                                </td>

                                                {/* Status Badge (View Only) */}
                                                <td className="py-4 px-6">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${
                                                            u.isActive
                                                                ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                                                                : "bg-slate-500/15 text-slate-400 border border-slate-500/30"
                                                        }`}
                                                    >
                                                        <span className={`h-2 w-2 rounded-full ${u.isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
                                                        <span>{u.isActive ? (isAr ? "نشط" : "Active") : (isAr ? "معطل" : "Inactive")}</span>
                                                    </span>
                                                </td>

                                                {/* Action: View Profile Only */}
                                                <td className="py-4 px-6 text-center">
                                                    <Link
                                                        to={`/users/${u.id}`}
                                                        className="inline-flex items-center gap-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 px-3.5 py-1.5 text-xs font-bold text-blue-500 transition-all hover:scale-105"
                                                        title={isAr ? "عرض الملف والتفاصيل" : "View Profile & Actions"}
                                                    >
                                                        <Eye className="h-3.5 w-3.5" />
                                                        <span>{isAr ? "عرض الملف" : "View Profile"}</span>
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
