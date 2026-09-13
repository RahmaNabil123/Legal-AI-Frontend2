import { useEffect, useState } from "react";
import { Scale, Shield, ShieldCheck, Briefcase } from "lucide-react";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import { useLanguage } from "../../context/LanguageContext";

const FIELD_KEYS = ["firstName", "lastName", "userName", "phoneNumber", "address", "governorate"];

function toFieldValues(profile) {
    const values = {};
    FIELD_KEYS.forEach((key) => {
        values[key] = profile?.[key] ?? "";
    });
    return values;
}

export default function ProfileForm({ profile, email, hasPendingPicture, isSaving, onSubmit }) {
    const { t, lang } = useLanguage();
    const isAr = lang === "ar";
    const [values, setValues] = useState(() => toFieldValues(profile));
    const [validationError, setValidationError] = useState("");

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

    useEffect(() => {
        setValues(toFieldValues(profile));
    }, [profile]);

    const changedFields = {};
    FIELD_KEYS.forEach((key) => {
        const original = profile?.[key] ?? "";
        if (values[key] !== original) {
            changedFields[key] = values[key];
        }
    });

    const hasTextChanges = Object.keys(changedFields).length > 0;
    const canSave = (hasTextChanges || hasPendingPicture) && !isSaving;

    const handleChange = (key) => (e) => {
        setValues((prev) => ({ ...prev, [key]: e.target.value }));
        if (validationError) setValidationError("");
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!canSave) return;

        const nextFirstName = "firstName" in changedFields ? changedFields.firstName : profile?.firstName;
        const nextLastName = "lastName" in changedFields ? changedFields.lastName : profile?.lastName;

        if (!nextFirstName?.trim() || !nextLastName?.trim()) {
            setValidationError(t.profile.validationEmptyName);
            return;
        }

        onSubmit(changedFields);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t.profile.detailsSectionHeading}
            </p>

            <div className="grid gap-5 sm:grid-cols-2">
                <Input
                    id="firstName"
                    label={t.profile.firstName}
                    value={values.firstName}
                    onChange={handleChange("firstName")}
                    disabled={isSaving}
                />
                <Input
                    id="lastName"
                    label={t.profile.lastName}
                    value={values.lastName}
                    onChange={handleChange("lastName")}
                    disabled={isSaving}
                />
                <Input
                    id="userName"
                    label={t.profile.userName}
                    value={values.userName}
                    onChange={handleChange("userName")}
                    disabled={isSaving}
                />
                <Input
                    id="phoneNumber"
                    label={t.profile.phoneNumber}
                    type="tel"
                    value={values.phoneNumber}
                    onChange={handleChange("phoneNumber")}
                    disabled={isSaving}
                />
                <Input
                    id="address"
                    label={t.profile.address}
                    value={values.address}
                    onChange={handleChange("address")}
                    disabled={isSaving}
                />
                <Input
                    id="governorate"
                    label={t.profile.governorate}
                    value={values.governorate}
                    onChange={handleChange("governorate")}
                    disabled={isSaving}
                />
            </div>

            <div className="grid gap-5 sm:grid-cols-2 pt-2 border-t border-slate-200 dark:border-white/10">
                <div>
                    <Input id="email" label={t.profile.email} value={email ?? ""} disabled />
                    <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{t.profile.emailReadOnlyHint}</p>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        {t.profile.role}
                    </label>
                    <div className="flex items-center h-[42px] px-3.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5">
                        {getRoleBadge(profile?.role)}
                    </div>
                    <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                        {t.profile.roleReadOnlyHint}
                    </p>
                </div>
            </div>

            {validationError && <p className="text-sm font-semibold text-red-500">{validationError}</p>}

            <div className="flex flex-col gap-2 pt-2">
                <Button type="submit" disabled={!canSave} isLoading={isSaving} className="sm:w-auto">
                    {isSaving ? t.profile.saving : t.profile.saveChanges}
                </Button>
                {!hasTextChanges && !hasPendingPicture && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t.profile.noChangesHint}</p>
                )}
            </div>
        </form>
    );
}