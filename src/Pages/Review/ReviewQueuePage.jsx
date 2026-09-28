import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    FileCheck,
    User,
    Calendar,
    ArrowRight,
    ArrowLeft,
    Sparkles,
    CheckCircle2,
    XCircle,
    Loader2,
} from "lucide-react";

import Navbar from "../../components/home/Navbar";
import { getPendingOpinions } from "../../services/opinionApi";
import { useLanguage } from "../../context/LanguageContext";

export default function ReviewQueuePage() {
    const { t, dir } = useLanguage();
    const [opinions, setOpinions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const ro = t.reviewOpinion || {};
    const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;

    useEffect(() => {
        let isMounted = true;
        async function loadQueue() {
            try {
                const list = await getPendingOpinions();
                if (isMounted) setOpinions(list);
            } catch {
                if (isMounted) setOpinions([]);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        }
        loadQueue();
        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#070A14] text-slate-900 dark:text-white transition-colors duration-200">
            <Navbar />

            <main className="mx-auto max-w-5xl px-6 py-12 lg:px-8">
                {/* Header Card */}
                <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120]/90 p-8 shadow-xl dark:shadow-[0_15px_35px_rgba(0,0,0,0.4)] backdrop-blur-md mb-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-500 border border-blue-500/25">
                            <FileCheck className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                                {ro.queueTitle || "Legal Opinion Review Queue"}
                            </h1>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                {ro.queueSubtitle || "Review, approve, or reject legal opinions submitted by Legal Advisors."}
                            </p>
                        </div>
                    </div>
                </div>

                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-16">
                        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                        <p className="mt-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
                            {ro.loading || "Loading pending opinions..."}
                        </p>
                    </div>
                )}

                {!isLoading && opinions.length === 0 && (
                    <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120]/90 p-12 text-center">
                        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500 mb-4" />
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                            {ro.emptyQueue || "No pending opinions to review."}
                        </h2>
                    </div>
                )}

                {!isLoading && opinions.length > 0 && (
                    <div className="space-y-4">
                        {opinions.map((opinion) => {
                            const isPending = opinion.status === "Pending";
                            const isApproved = opinion.status === "Approved";
                            const isRejected = opinion.status === "Rejected";

                            return (
                                <Link
                                    key={opinion.id}
                                    to={`/opinions/${opinion.id}`}
                                    className="group block rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120]/80 p-6 sm:p-7 shadow-sm backdrop-blur-md hover:border-blue-500/40 hover:shadow-xl dark:hover:shadow-[0_10px_30px_rgba(37,99,235,0.15)] transition-all duration-200"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                                        <span className="rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-0.5 text-xs font-bold text-blue-600 dark:text-blue-400">
                                            ID: {opinion.id}
                                        </span>

                                        {isPending && (
                                            <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                                                {ro.statusPending || "Pending Review"}
                                            </span>
                                        )}
                                        {isApproved && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                                <Sparkles className="h-3 w-3" />
                                                {ro.statusApproved || "Approved"}
                                            </span>
                                        )}
                                        {isRejected && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 border border-red-500/20 px-3 py-0.5 text-xs font-bold text-red-600 dark:text-red-400">
                                                <XCircle className="h-3 w-3" />
                                                {ro.statusRejected || "Rejected"}
                                            </span>
                                        )}
                                    </div>

                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {opinion.title}
                                    </h2>

                                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                                        "{opinion.question}"
                                    </p>

                                    <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 dark:border-white/5 pt-4 text-xs text-slate-500 dark:text-slate-400">
                                        <div className="flex items-center gap-5">
                                            <span className="flex items-center gap-1.5">
                                                <User className="h-3.5 w-3.5 text-blue-500" />
                                                {opinion.submittedBy}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                                {opinion.submissionDate}
                                            </span>
                                        </div>

                                        <span className="inline-flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 group-hover:underline">
                                            <span>{isPending ? "Review Decision" : "View Details"}</span>
                                            <Arrow className="h-3.5 w-3.5" />
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
