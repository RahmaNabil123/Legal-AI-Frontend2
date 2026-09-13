import { useCallback, useEffect, useState } from "react";
import { Loader2, Scale, Shield, ShieldCheck, Briefcase } from "lucide-react";

import Navbar from "../../components/home/Navbar";
import Alert from "../../components/Alert/Alert";
import ProfilePictureField from "./ProfilePictureField";
import ProfileForm from "./ProfileForm";
import ConfirmDialog from "./ConfirmDialog";

import { getProfile, updateProfile, deleteProfilePicture } from "../../services/profileApi";
import { getErrorMessage } from "../../services/apiError";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";

import "./ProfilePage.css";

export default function ProfilePage() {
    const { t, lang } = useLanguage();
    const isAr = lang === "ar";
    const { updateUser } = useAuth();

    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    const [pendingFile, setPendingFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState(null);

    const loadProfile = useCallback(async () => {
        setIsLoading(true);
        setFetchError(null);
        try {
            const data = await getProfile();
            setProfile(data);
        } catch (err) {
            setFetchError(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    useEffect(() => {
        if (!pendingFile) {
            setPreviewUrl(null);
            return;
        }
        const url = URL.createObjectURL(pendingFile);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [pendingFile]);

    const handleFileSelect = (file) => {
        setPendingFile(file);
        setSuccessMessage("");
        setSaveError(null);
    };

    const handleSave = async (changedFields) => {
        setIsSaving(true);
        setSaveError(null);
        setSuccessMessage("");

        try {
            const updated = await updateProfile(changedFields, pendingFile);
            setProfile(updated);
            updateUser(updated);
            setPendingFile(null);
            setSuccessMessage(t.profile.updateSuccess);
        } catch (err) {
            setSaveError(getErrorMessage(err));
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeletePicture = async () => {
        setIsDeleting(true);
        setDeleteError(null);

        try {
            const updated = await deleteProfilePicture();
            setProfile(updated);
            updateUser(updated);
            setIsConfirmOpen(false);
            setSuccessMessage(t.profile.deleteSuccess);
        } catch (err) {
            setDeleteError(getErrorMessage(err));
        } finally {
            setIsDeleting(false);
        }
    };

    const getRoleBadge = (role) => {
        if (!role) return null;
        if (role === "Legal Advisor" || role.includes("مستشار")) {
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 px-3 py-1 text-xs font-bold text-purple-600 dark:text-purple-400">
                    <Scale className="h-3.5 w-3.5" />
                    <span>{isAr ? "مستشار قانوني" : "Legal Advisor"}</span>
                </span>
            );
        }
        if (role === "Legal Manager" || role.includes("مدير")) {
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>{isAr ? "مدير الشؤون القانونية" : "Legal Manager"}</span>
                </span>
            );
        }
        if (role === "System Administrator" || role.includes("مسؤول")) {
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                    <Shield className="h-3.5 w-3.5" />
                    <span>{isAr ? "مسؤول النظام" : "System Administrator"}</span>
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/15 border border-blue-500/30 px-3 py-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                <Briefcase className="h-3.5 w-3.5" />
                <span>{isAr ? "محامي" : "Lawyer"}</span>
            </span>
        );
    };

    const hasSavedPicture = profile?.profilePicture && profile.profilePicture !== "No Profile Picture";

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#070A14] text-slate-900 dark:text-white transition-colors duration-200">
            <Navbar />

            <main className="mx-auto max-w-2xl px-6 py-12 lg:px-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{t.profile.title}</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {isAr ? "إدارة وتحديث بياناتك الشخصية والصورة الرمزية المعتمدة" : "Manage your personal information and profile picture"}
                        </p>
                    </div>
                    {profile?.role && (
                        <div>
                            {getRoleBadge(profile.role)}
                        </div>
                    )}
                </div>

                {isLoading && (
                    <div className="mt-8 flex items-center justify-center gap-2.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120]/80 py-16 text-sm text-slate-500 dark:text-slate-400 backdrop-blur-md">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-500" aria-hidden="true" />
                        {t.profile.loading}
                    </div>
                )}

                {!isLoading && fetchError && (
                    <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/5 px-6 py-10 text-center backdrop-blur-md">
                        <p className="text-sm font-semibold text-red-500">{getErrorMessage(fetchError)}</p>
                        <button
                            type="button"
                            onClick={loadProfile}
                            className="mt-4 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500"
                        >
                            {t.profile.tryAgain}
                        </button>
                    </div>
                )}

                {!isLoading && !fetchError && profile && (
                    <div className="mt-8 space-y-6">
                        {successMessage && (
                            <div className="profile-fade-in">
                                <Alert variant="success">{successMessage}</Alert>
                            </div>
                        )}
                        {saveError && <Alert>{saveError}</Alert>}

                        <div className="profile-fade-in rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120]/80 p-6 sm:p-8 shadow-xl dark:shadow-[0_10px_30px_rgba(0,0,0,0.4)] backdrop-blur-md">
                            <p className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                {t.profile.pictureSectionHeading}
                            </p>
                            <ProfilePictureField
                                key={profile.profilePicture}
                                currentUrl={profile.profilePicture}
                                previewUrl={previewUrl}
                                onFileSelect={handleFileSelect}
                                onError={(msg) => setSaveError(msg)}
                                disabled={isSaving}
                            />

                            {hasSavedPicture && (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => setIsConfirmOpen(true)}
                                        disabled={isSaving || isDeleting}
                                        className="mt-4 text-sm font-semibold text-red-500 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {t.profile.deletePhoto}
                                    </button>
                                    {deleteError && <p className="mt-2 text-sm text-red-500">{deleteError}</p>}
                                </>
                            )}
                        </div>

                        <div className="profile-fade-in rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120]/80 p-6 sm:p-8 shadow-xl dark:shadow-[0_10px_30px_rgba(0,0,0,0.4)] backdrop-blur-md">
                            <ProfileForm
                                profile={profile}
                                email={profile.email}
                                hasPendingPicture={!!pendingFile}
                                isSaving={isSaving}
                                onSubmit={handleSave}
                            />
                        </div>
                    </div>
                )}
            </main>

            {isConfirmOpen && (
                <ConfirmDialog
                    title={t.profile.deleteConfirmTitle}
                    message={t.profile.deleteConfirmMessage}
                    cancelLabel={t.profile.cancel}
                    confirmLabel={isDeleting ? t.profile.deleting : t.profile.confirmDelete}
                    isLoading={isDeleting}
                    onCancel={() => setIsConfirmOpen(false)}
                    onConfirm={handleDeletePicture}
                />
            )}
        </div>
    );
}