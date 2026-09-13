import { useRef, useState } from "react";
import { User, Camera, AlertCircle } from "lucide-react";
import Button from "../../components/Button/Button";
import { useLanguage } from "../../context/LanguageContext";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg"];

export default function ProfilePictureField({ currentUrl, previewUrl, onFileSelect, onError, disabled }) {
    const { t, lang } = useLanguage();
    const isAr = lang === "ar";
    const fileInputRef = useRef(null);
    const [imgFailed, setImgFailed] = useState(false);
    const [fieldError, setFieldError] = useState("");

    const hasSavedPicture = currentUrl && currentUrl !== "No Profile Picture";
    const displayUrl = previewUrl || (hasSavedPicture ? currentUrl : null);

    const handleChange = (e) => {
        const file = e.target.files?.[0];
        setFieldError("");

        if (file) {
            // Check file type
            const ext = file.name.split(".").pop().toLowerCase();
            const isValidType = ALLOWED_TYPES.includes(file.type) || ["png", "jpg", "jpeg"].includes(ext);

            if (!isValidType) {
                const err = t.profile.fileTypeError || (isAr ? "الصيغ المسموح بها فقط هي .png و .jpg و .jpeg." : "Only .png, .jpg, and .jpeg files are allowed.");
                setFieldError(err);
                if (onError) onError(err);
                e.target.value = "";
                return;
            }

            // Check file size (5MB max)
            if (file.size > MAX_FILE_SIZE) {
                const err = t.profile.fileSizeError || (isAr ? "حجم الصورة يجب ألا يتجاوز 5 ميجابايت." : "Image size must not exceed 5MB.");
                setFieldError(err);
                if (onError) onError(err);
                e.target.value = "";
                return;
            }

            setImgFailed(false);
            onFileSelect(file);
        }
        e.target.value = "";
    };

    return (
        <div>
            <div className="flex items-center gap-5">
                <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 shadow-inner">
                    {displayUrl && !imgFailed ? (
                        <img
                            src={displayUrl}
                            alt=""
                            className="h-full w-full object-cover"
                            onError={() => setImgFailed(true)}
                        />
                    ) : (
                        <User className="h-9 w-9 text-slate-400 dark:text-slate-500" aria-hidden="true" />
                    )}
                </div>

                <div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".png, .jpg, .jpeg, image/png, image/jpeg"
                        onChange={handleChange}
                        disabled={disabled}
                        className="hidden"
                        aria-hidden="true"
                        tabIndex={-1}
                    />
                    <Button
                        type="button"
                        variant="secondary"
                        disabled={disabled}
                        onClick={() => fileInputRef.current?.click()}
                        className="w-auto"
                    >
                        <Camera className="h-4 w-4 text-blue-500" aria-hidden="true" />
                        <span>{t.profile.changePhoto}</span>
                    </Button>
                    <p className="mt-1.5 text-[11px] text-slate-400">
                        {isAr ? ".PNG, .JPG, .JPEG (بحد أقصى 5 ميجابايت)" : ".PNG, .JPG, .JPEG (max 5MB)"}
                    </p>
                </div>
            </div>

            {fieldError && (
                <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-red-500">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{fieldError}</span>
                </div>
            )}
        </div>
    );
}