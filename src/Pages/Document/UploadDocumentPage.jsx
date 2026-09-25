import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    UploadCloud,
    FileText,
    CheckCircle2,
    AlertCircle,
    X,
    Sparkles,
    Scale,
    Landmark,
    Calendar,
    Hash,
    BookOpen,
    Loader2,
    Eye,
} from "lucide-react";
import Navbar from "../../components/home/Navbar";
import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";
import Alert from "../../components/Alert/Alert";
import { uploadLegalDocument } from "../../services/searchApi";
import { useLanguage } from "../../context/LanguageContext";

export default function UploadDocumentPage() {
    const { lang, dir } = useLanguage();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const isAr = lang === "ar";

    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [fields, setFields] = useState({
        title: "",
        court: "المحكمة الاقتصادية العليا",
        caseNumber: "",
        year: "2024",
        category: "تسهيلات ائتمانية ومنازعات بنكية",
        parties: "",
        summary: "",
    });

    const [errors, setErrors] = useState({});
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [serverError, setServerError] = useState("");
    const [uploadedDoc, setUploadedDoc] = useState(null);

    const courts = [
        "محكمة النقض - الدائرة التجارية",
        "محكمة النقض - الدائرة الاقتصادية",
        "المحكمة الاقتصادية العليا - دائرة الاستئناف",
        "محكمة استئناف القاهرة - الدائرة التجارية",
        "محكمة استئناف الإسكندرية",
    ];

    const categories = [
        "تسهيلات ائتمانية ومنازعات بنكية",
        "خطابات الضمان والاعتمادات المستندية",
        "مسؤولية البنوك عن التحويلات الإلكترونية",
        "عقود التمويل والرهون العقارية والتجارية",
        "سرية الحسابات المصرفية ومكافحة غسل الأموال",
    ];

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile) validateAndSetFile(droppedFile);
    };

    const handleFileInput = (e) => {
        const selected = e.target.files?.[0];
        if (selected) validateAndSetFile(selected);
    };

    const validateAndSetFile = (f) => {
        const validTypes = [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/msword",
        ];
        if (
            !validTypes.includes(f.type) &&
            !f.name.endsWith(".pdf") &&
            !f.name.endsWith(".docx")
        ) {
            setServerError(isAr ? "يرجى اختيار ملف بصيغة PDF أو DOCX فقط." : "Only PDF and DOCX files are allowed.");
            return;
        }
        if (f.size > 25 * 1024 * 1024) {
            setServerError(isAr ? "حجم الملف يتجاوز الحد الأقصى (25 ميجابايت)." : "File exceeds 25 MB limit.");
            return;
        }

        setFile(f);
        setServerError("");

        // Auto extract preliminary title from filename if empty
        if (!fields.title) {
            const cleanName = f.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
            setFields((prev) => ({ ...prev, title: cleanName }));
        }
    };

    const handleChange = (name) => (e) => {
        setFields((prev) => ({ ...prev, [name]: e.target.value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError("");

        const errs = {};
        if (!file) errs.file = isAr ? "يرجى إرفاق ملف الحكم أو المستند." : "Please upload a document file.";
        if (!fields.title.trim()) errs.title = isAr ? "عنوان الحكم مطلوب." : "Title is required.";
        if (!fields.caseNumber.trim()) errs.caseNumber = isAr ? "رقم القضية أو الطعن مطلوب." : "Case number is required.";
        if (!fields.summary.trim()) errs.summary = isAr ? "ملخص المبدأ القانوني مطلوب." : "Legal summary is required.";

        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }

        setIsUploading(true);
        setUploadProgress(15);

        try {
            const progressInterval = setInterval(() => {
                setUploadProgress((p) => (p < 85 ? p + 25 : p));
            }, 300);

            const result = await uploadLegalDocument(fields, file);
            clearInterval(progressInterval);
            setUploadProgress(100);
            setUploadedDoc(result);
        } catch (err) {
            setServerError(err.message || (isAr ? "فشل رفع وفهرسة المستند." : "Failed to upload document."));
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#070A14] text-slate-900 dark:text-white transition-colors duration-200">
            <Navbar />

            <main className="mx-auto max-w-4xl px-6 py-12 lg:px-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-bold text-blue-500 mb-3">
                        <UploadCloud className="h-4 w-4" />
                        <span>{isAr ? "فهرسة وتوثيق السوابق القضائية" : "Judicial Precedent Ingestion"}</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        {isAr ? "رفع وتوثيق حكم قضائي جديد" : "Upload & Index Judicial Precedent"}
                    </h1>
                    <p className="mt-2 text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                        {isAr
                            ? "أرفق ملف الحكم بصيغة ملف رقمي مع إدخال بيانات المحكمة ورقم القضية لفهرسته واستخراجه آلياً عبر الذكاء الاصطناعي."
                            : "Upload full rulings to index and train the legal precedent AI engine for institutional citations."}
                    </p>
                </div>

                {serverError && (
                    <div className="mb-6">
                        <Alert>{serverError}</Alert>
                    </div>
                )}

                {uploadedDoc ? (
                    <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-8 sm:p-10 text-center shadow-xl backdrop-blur-md">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 mb-4 animate-bounce">
                            <CheckCircle2 className="h-8 w-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                            {isAr ? "تم رفع وفهرسة الحكم بنجاح في المنظومة!" : "Document Indexed Successfully!"}
                        </h2>
                        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>{isAr ? "الحالة: مفهرس وجاهز للبحث" : "Status: Indexed & Ready for AI Search"}</span>
                        </div>
                        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                            {isAr
                                ? `تم استخراج نصوص الحكم (${uploadedDoc.fileName}) وربطه بنموذج الاسترجاع الذكي للاستشهاد به في الفتاوى والبحث.`
                                : `Document ${uploadedDoc.fileName} is now searchable by all banking counsel.`}
                        </p>

                        <div className="mt-8 flex flex-wrap justify-center gap-4">
                            <button
                                type="button"
                                onClick={() => navigate(`/documents/${uploadedDoc.id || "case-7235"}`)}
                                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all"
                            >
                                <Eye className="h-4 w-4" />
                                <span>{isAr ? "معاينة تفاصيل الحكم" : "View Ruling Details"}</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setUploadedDoc(null);
                                    setFile(null);
                                    setFields({
                                        title: "",
                                        court: "المحكمة الاقتصادية العليا",
                                        caseNumber: "",
                                        year: "2024",
                                        category: "تسهيلات ائتمانية ومنازعات بنكية",
                                        parties: "",
                                        summary: "",
                                    });
                                }}
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120] px-5 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                            >
                                <UploadCloud className="h-4 w-4" />
                                <span>{isAr ? "رفع مستند آخر" : "Upload Another"}</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* File Dropzone */}
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => !file && fileInputRef.current?.click()}
                            className={`relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 sm:p-12 text-center transition-all cursor-pointer ${
                                isDragging
                                    ? "border-blue-500 bg-blue-500/10 scale-[1.01]"
                                    : file
                                    ? "border-emerald-500/40 bg-emerald-500/5"
                                    : "border-slate-300 dark:border-white/15 bg-white dark:bg-[#0B1120]/70 hover:border-blue-500/50 hover:bg-blue-500/5"
                            }`}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.docx,.doc"
                                onChange={handleFileInput}
                                className="hidden"
                            />

                            {file ? (
                                <div className="flex items-center gap-4 text-start w-full max-w-md bg-white dark:bg-[#0E1528] p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-blue-600/15 text-blue-500 border border-blue-500/30">
                                        <FileText className="h-6 w-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                                            {file.name}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {(file.size / (1024 * 1024)).toFixed(2)} MB · {isAr ? "جاهز للفهرسة" : "Ready to index"}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setFile(null);
                                        }}
                                        className="rounded-lg p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-600/15 text-blue-500 border border-blue-500/25 mb-4 shadow-inner">
                                        <UploadCloud className="h-8 w-8" />
                                    </div>
                                    <p className="text-base font-bold text-slate-900 dark:text-white">
                                        {isAr ? "اسحب وأفلت ملف الحكم القضائي هنا أو انقر للتصفح" : "Drag & drop legal document file here, or browse"}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                        {isAr ? "صيغ مدعومة: PDF, DOCX (الحد الأقصى 25 ميجابايت)" : "Supported formats: PDF, DOCX (Up to 25 MB)"}
                                    </p>
                                </>
                            )}

                            {errors.file && <p className="mt-3 text-xs font-bold text-red-500">{errors.file}</p>}
                        </div>

                        {/* Metadata Inputs */}
                        <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120]/80 p-6 sm:p-8 shadow-xl backdrop-blur-md space-y-5">
                            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-3">
                                <Scale className="h-4 w-4 text-blue-500" />
                                <span>{isAr ? "بيانات وتصنيف الحكم القضائي" : "Judicial Precedent Details"}</span>
                            </h2>

                            {/* Title */}
                            <Input
                                id="doc-title"
                                label={isAr ? "عنوان الحكم أو المبدأ القضائي *" : "Judgment Title *"}
                                placeholder={isAr ? "مثال: حكم محكمة النقض في سلطة البنك المركزي في تحديد الفائدة" : "e.g. Cassation Court Ruling on CBE interest authority"}
                                required
                                value={fields.title}
                                onChange={handleChange("title")}
                                error={errors.title}
                            />

                            {/* Grid 2 Cols: Court & Case Number */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                        {isAr ? "المحكمة المصدرة للحكم *" : "Issuing Court *"}
                                    </label>
                                    <select
                                        value={fields.court}
                                        onChange={handleChange("court")}
                                        className="w-full rounded-2xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#0E1528] px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                                    >
                                        {courts.map((c) => (
                                            <option key={c} value={c} className="bg-slate-900 text-white">
                                                {c}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <Input
                                    id="caseNumber"
                                    label={isAr ? "رقم القضية أو الطعن *" : "Case / Appeal Number *"}
                                    placeholder={isAr ? "مثال: الطعن رقم 7235 لسنة 81 ق" : "e.g. Appeal 7235 / 81Q"}
                                    required
                                    value={fields.caseNumber}
                                    onChange={handleChange("caseNumber")}
                                    error={errors.caseNumber}
                                />
                            </div>

                            {/* Grid 2 Cols: Category & Year */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                        {isAr ? "التصنيف المصرفي والقانوني" : "Banking Legal Category"}
                                    </label>
                                    <select
                                        value={fields.category}
                                        onChange={handleChange("category")}
                                        className="w-full rounded-2xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#0E1528] px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                                    >
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat} className="bg-slate-900 text-white">
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <Input
                                    id="doc-year"
                                    label={isAr ? "السنة القضائية" : "Judicial Year"}
                                    placeholder="2024"
                                    value={fields.year}
                                    onChange={handleChange("year")}
                                />
                            </div>

                            {/* Parties */}
                            <Input
                                id="parties"
                                label={isAr ? "أطراف النزاع (اختياري)" : "Litigating Parties (Optional)"}
                                placeholder={isAr ? "مثال: بنك مصر ضد شركة الأمل للتنمية والتجارة" : "e.g. National Bank vs Horizon Trading Co."}
                                value={fields.parties}
                                onChange={handleChange("parties")}
                            />

                            {/* Summary & Legal Ruling */}
                            <div>
                                <label htmlFor="doc-summary" className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                    {isAr ? "ملخص القاعدة والمبدأ القانوني المستخلص *" : "Legal Ruling Summary & Principles *"}
                                </label>
                                <textarea
                                    id="doc-summary"
                                    rows={4}
                                    value={fields.summary}
                                    onChange={handleChange("summary")}
                                    placeholder={isAr ? "اكتب موجز القاعدة القانونية ومنطوق الحكم المستقر عليه في النزاع المصرفي..." : "Summarize the legal principle..."}
                                    className="w-full rounded-2xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#0E1528] p-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
                                />
                                {errors.summary && <p className="mt-1.5 text-xs font-bold text-red-500">{errors.summary}</p>}
                            </div>

                            {/* Submit & Progress */}
                            {isUploading && (
                                <div className="space-y-2 pt-2">
                                    <div className="flex items-center justify-between text-xs font-bold text-blue-500">
                                        <span>{isAr ? "جارٍ الفهرسة والتحليل بالذكاء الاصطناعي…" : "Indexing with AI..."}</span>
                                        <span>{uploadProgress}%</span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="pt-3">
                                <Button type="submit" isLoading={isUploading}>
                                    {isUploading
                                        ? isAr
                                            ? "جارٍ استخراج النصوص والفهرسة…"
                                            : "Indexing Document…"
                                        : isAr
                                        ? "اعتماد وفهرسة الحكم القضائي"
                                        : "Index Judicial Precedent"}
                                </Button>
                            </div>
                        </div>
                    </form>
                )}
            </main>
        </div>
    );
}
