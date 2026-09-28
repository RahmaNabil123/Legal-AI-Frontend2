import { ApiError } from "./apiError";
import { request, apiUrl } from "./httpClient";
import { getSession, getToken } from "./tokenStorage";

/**
 * Legal Opinion & Review API Service
 * 100% Aligned with Backend LegalOpinionController:
 * 1. POST   /api/LegalOpinion                          -> [FromForm] CreateLegalOpinionDTO { Title, Question, Answer?, File? }
 * 2. GET    /api/LegalOpinion/Legal-Advisor-Opinions   -> IReadOnlyList<LegalOpinionListItemDTO>
 * 3. GET    /api/LegalOpinion                          -> IReadOnlyList<LegalOpinionListItemDTO> (Manager Review Queue)
 * 4. GET    /api/LegalOpinion/{id}                     -> LegalOpinionResultDTO
 * 5. POST   /api/LegalOpinion/{id}/Review              -> [FromBody] ReviewOpinionDTO { Decision: 1|2|3, Comments? }
 * 6. PUT    /api/LegalOpinion/{id}/Resubmit            -> [FromBody] UpdateLegalOpinionDTO { Title?, Question?, Answer? }
 * 7. DELETE /api/LegalOpinion/{id}                     -> Delete opinion draft
 * 8. GET    /api/LegalOpinion/Document-By-Source       -> Download document (?fileName=)
 * 9. GET    /api/LegalOpinion/Unknown-Questions        -> IReadOnlyList<UnknownQuestionResultDTO>
 * 10. DELETE /api/LegalOpinion/Unknown-Questions/{id}  -> Delete handled unknown question
 *
 * Enums (Domain.Entities.Enums):
 * OpinionStatus: 1=Submitted, 2=Approved, 3=Rejected, 4=RevisionRequired
 * ReviewDecision: 1=Approved, 2=Rejected, 3=RevisionRequired
 */

export const OpinionStatus = {
    Submitted: 1,
    Approved: 2,
    Rejected: 3,
    RevisionRequired: 4,
};

export const ReviewDecision = {
    Approved: 1,
    Rejected: 2,
    RevisionRequired: 3,
};

const MOCK_DELAY_MS = 600;

export function normalizeOpinionStatusName(status) {
    if (status === 1 || status === "Submitted" || status === "Pending") return "Pending";
    if (status === 2 || status === "Approved") return "Approved";
    if (status === 3 || status === "Rejected") return "Rejected";
    if (status === 4 || status === "RevisionRequired") return "RevisionRequired";
    return status || "Pending";
}

let mockOpinions = [
    {
        id: 101,
        title: "الرأي القانوني في شروط الفسخ الرضائي لخطابات الاعتماد المستندي",
        question: "ما هي التبعات القانونية لفسخ خطاب الاعتماد المستندي باتفاق الطرفين دون موافقة البنك المصدر؟",
        answer:
            "استناداً إلى الأعراف والقواعد الموحدة للاعتمادات المستندية (UCP 600) وقانون التجارة، فإن خطاب الاعتماد المستندي ينشئ التزاماً مستقلاً وقاطعاً في ذمة البنك المصدر تجاه المستفيد.\n\nلا يجوز للآمر والمستفيد إنهاء الاعتماد أو تعديل شروطه باتفاقهما الثنائي المنفرد ما لم يقترن ذلك بموافقة صريحة وكتابية من البنك المصدر، حمايةً لحقوق البنك في العمولات والمصاريف وتغطية الالتزامات المترتبة على إصدار الاعتماد.",
        createdByName: "المستشار أحمد فؤاد",
        submittedBy: "المستشار أحمد فؤاد",
        createdAt: "2026-08-28",
        status: "Pending", // 1 (Submitted)
        statusCode: 1,
        rejectionReason: null,
        document: {
            fileName: "UCP600_Banking_Guideline.pdf",
            fileSize: 1468006,
            fileType: "PDF",
        },
        reviews: [],
    },
    {
        id: 102,
        title: "مسؤولية البنك في التحقق من توقيعات السحب على الحسابات المشتركة",
        question: "هل يُلزم البنك بالتحقق من توقيع كافة الشركاء في الحساب المشترك حال النص على التوقيع المنفرد في نموذج فتح الحساب؟",
        answer:
            "إذا نص عقد فتح الحساب المشترك صراحةً على حق أي من أصحابه في السحب والتوقيع منفرداً، فإن البنك يبرأ ذمته بالوفاء لأي منهم، ولا يسأل عن النزاعات الداخلية بين الشركاء طالما لم يبلغه أي شريك رسمياً باعتراض كتابي قبل إتمام عملية الصرف.",
        createdByName: "المستشارة مروة السعيد",
        submittedBy: "المستشارة مروة السعيد",
        createdAt: "2026-08-27",
        status: "Approved", // 2 (Approved)
        statusCode: 2,
        rejectionReason: null,
        document: null,
        reviews: [
            {
                reviewerName: "د. طارق عبد الله",
                decision: 1,
                comments: "رأي قانوني متماسك ومعتمد للفهرسة بالذكاء الاصطناعي.",
                createdAt: "2026-08-27",
            },
        ],
    },
    {
        id: 103,
        title: "مدى جواز تجميد الحسابات المصرفية بأمر جهة إدارية دون حكم قضائي",
        question: "هل يلتزم البنك بتنفيذ قرارات التحفظ الصادرة من جهات غير قضائية؟",
        answer:
            "الأصل الدستوري والمصرفي هو سرية الحسابات وعدم جواز الحجز أو التجميد إلا بحكم قضائي أو أمر صادر من النائب العام، وتستثنى فقط حالات مكافحة غسل الأموال الصادرة وفق إجراءات القانون المنظم.",
        createdByName: "المستشار أحمد فؤاد",
        submittedBy: "المستشار أحمد فؤاد",
        createdAt: "2026-08-20",
        status: "Rejected", // 3 (Rejected)
        statusCode: 3,
        rejectionReason: "يرجى إضافة الاستناد للمادة 97 من قانون البنك المركزي 194 لسنة 2020 والتفريق بين التحفظ والتجميد المؤقت.",
        document: {
            fileName: "CBE_Law_194_Article97.pdf",
            fileSize: 870400,
            fileType: "PDF",
        },
        reviews: [
            {
                reviewerName: "د. طارق عبد الله",
                decision: 2,
                comments: "يرجى إضافة الاستناد للمادة 97 من قانون البنك المركزي 194 لسنة 2020 والتفريق بين التحفظ والتجميد المؤقت.",
                createdAt: "2026-08-21",
            },
        ],
    },
    {
        id: 104,
        title: "صحة الشروط الجزائية المقيدة في عقود التسهيلات الائتمانية",
        question: "هل يجوز تخفيض الشرط الجزائي المتفق عليه في عقد التسهيل إذا ثبت عدم وقوع ضرر فعلي للبنك؟",
        answer:
            "يجوز للقاضي تخفيض مبلغ التعويض المشروط إذا أثبت المدين أن التقدير كان مبالغاً فيه إلى درجة كبيرة أو أن الالتزام قد نفذ في جزء منه، وفقاً للمادة 224 من القانون المدني.",
        createdByName: "المستشار محمود كامل",
        submittedBy: "المستشار محمود كامل",
        createdAt: "2026-09-18",
        status: "Pending",
        statusCode: 1,
        rejectionReason: null,
        document: null,
        reviews: [],
    },
    {
        id: 105,
        title: "مدى التزام البنك بإجراء المقاصة القضائية بين حسابين لنفس العميل",
        question: "هل يحق للبنك إجراء مقاصة بين حساب مدين وحساب دائن لفرعين مختلفين؟",
        answer:
            "نعم، وحدة الذمة المالية للعميل ووحدة الشخصية الاعتبارية للبنك بفروعه تخول للبنك إجراء المقاصة القانونية والاتفاقية دون الحاجة إلى إذن قضائي مسبق إذا نص العقد على ذلك.",
        createdByName: "المستشارة مروة السعيد",
        submittedBy: "المستشارة مروة السعيد",
        createdAt: "2026-09-15",
        status: "Approved",
        statusCode: 2,
        rejectionReason: null,
        document: null,
        reviews: [
            {
                reviewerName: "د. طارق عبد الله",
                decision: 1,
                comments: "رأي متميز وموافق لتعليمات البنك المركزي المصري.",
                createdAt: "2026-09-16",
            },
        ],
    },
    {
        id: 106,
        title: "أثر إشهار إفلاس العميل على وثائق الضمان البنكية الصادرة لصالحه",
        question: "ما الوضع القانوني لخطاب الضمان الابتدائي عند صدور حكم بإفلاس العميل الآمر؟",
        answer:
            "خطاب الضمان يولد التزاماً مستقلاً عن العلاقة الأصلية، وصدور حكم الإفلاس لا يمنع البنك من الوفاء للمستفيد عند أول طلب إذا استوفى الشروط الشكلية قبل انتهاء سريان الخطاب.",
        createdByName: "المستشار أحمد فؤاد",
        submittedBy: "المستشار أحمد فؤاد",
        createdAt: "2026-09-19",
        status: "Approved",
        statusCode: 2,
        rejectionReason: null,
        document: null,
        reviews: [
            {
                reviewerName: "د. طارق عبد الله",
                decision: 1,
                comments: "معتمد وموثق بالسوابق القضائية.",
                createdAt: "2026-09-19",
            },
        ],
    },
];

/**
 * 1. POST /api/LegalOpinion
 * Payload: [FromForm] CreateLegalOpinionDTO { Title, Question, Answer?, File? }
 */
export async function submitLegalOpinion(opinionData, file) {
    if (!opinionData.title?.trim() || !opinionData.question?.trim() || !opinionData.answer?.trim()) {
        throw new ApiError("يرجى إدخال كافة الحقول الإلزامية: العنوان، السؤال، والرأي القانوني.", 400);
    }

    const formData = new FormData();
    formData.append("Title", opinionData.title.trim());
    formData.append("Question", opinionData.question.trim());
    formData.append("Answer", opinionData.answer.trim());
    if (file) {
        formData.append("File", file);
    }

    const realResult = await request("/api/LegalOpinion", {
        method: "POST",
        body: formData,
    });
    return realResult;
}

/**
 * 2. GET /api/LegalOpinion/Legal-Advisor-Opinions
 * Backs GetLegalOpinionsForUser (Advisor's own opinions)
 */
export async function getMyOpinions(filters = {}) {
    try {
        const data = await request("/api/LegalOpinion/Legal-Advisor-Opinions", { method: "GET" });
        if (Array.isArray(data)) {
            let list = data.map((op) => {
                const normalizedStatus = normalizeOpinionStatusName(op.status);
                const numStatus =
                    typeof op.status === "number"
                        ? op.status
                        : op.statusCode ||
                          (normalizedStatus === "Approved"
                              ? 2
                              : normalizedStatus === "Rejected"
                              ? 3
                              : normalizedStatus === "RevisionRequired"
                              ? 4
                              : 1);
                return {
                    ...op,
                    status: normalizedStatus,
                    statusCode: numStatus,
                };
            });

            if (filters.status && filters.status !== "ALL") {
                if (filters.status === "Pending") {
                    list = list.filter((op) => op.status === "Pending" || op.statusCode === 1);
                } else if (filters.status === "Approved") {
                    list = list.filter((op) => op.status === "Approved" || op.statusCode === 2);
                } else if (filters.status === "Rejected") {
                    list = list.filter((op) => op.status === "Rejected" || op.statusCode === 3);
                } else if (filters.status === "RevisionRequired") {
                    list = list.filter((op) => op.status === "RevisionRequired" || op.statusCode === 4);
                } else {
                    list = list.filter((op) => op.status === filters.status);
                }
            }
            if (filters.search) {
                const q = filters.search.toLowerCase();
                list = list.filter((op) => op.title?.toLowerCase().includes(q));
            }
            return list;
        }
    } catch (err) {
        if (getToken()) {
            throw err;
        }
    }

    await wait(MOCK_DELAY_MS);
    let list = [...mockOpinions];
    if (filters.status && filters.status !== "ALL") {
        list = list.filter((op) => op.status === filters.status);
    }
    if (filters.search) {
        const q = filters.search.toLowerCase();
        list = list.filter((op) => op.title.toLowerCase().includes(q) || op.question?.toLowerCase().includes(q));
    }
    return list;
}

/**
 * 3. GET /api/LegalOpinion
 * Backs GetAllOpinions (Legal Manager review & system-wide list of all opinions)
 */
export async function getAllOpinions(filters = {}) {
    try {
        const data = await request("/api/LegalOpinion", { method: "GET" });
        if (Array.isArray(data)) {
            let list = data.map((op) => {
                const normalizedStatus = normalizeOpinionStatusName(op.status);
                const numStatus =
                    typeof op.status === "number"
                        ? op.status
                        : op.statusCode ||
                          (normalizedStatus === "Approved"
                              ? 2
                              : normalizedStatus === "Rejected"
                              ? 3
                              : normalizedStatus === "RevisionRequired"
                              ? 4
                              : 1);
                return {
                    ...op,
                    status: normalizedStatus,
                    statusCode: numStatus,
                };
            });

            if (filters.status && filters.status !== "ALL") {
                if (filters.status === "Pending") {
                    list = list.filter((op) => op.status === "Pending" || op.statusCode === 1);
                } else if (filters.status === "Approved") {
                    list = list.filter((op) => op.status === "Approved" || op.statusCode === 2);
                } else if (filters.status === "Rejected") {
                    list = list.filter((op) => op.status === "Rejected" || op.statusCode === 3);
                } else if (filters.status === "RevisionRequired") {
                    list = list.filter((op) => op.status === "RevisionRequired" || op.statusCode === 4);
                } else {
                    list = list.filter((op) => op.status === filters.status);
                }
            }
            if (filters.search) {
                const q = filters.search.toLowerCase();
                list = list.filter(
                    (op) =>
                        op.title?.toLowerCase().includes(q) ||
                        op.createdByName?.toLowerCase().includes(q)
                );
            }
            return list;
        }
    } catch (err) {
        if (getToken()) {
            throw err;
        }
    }

    await wait(MOCK_DELAY_MS);
    let list = [...mockOpinions];
    if (filters.status && filters.status !== "ALL") {
        list = list.filter((op) => op.status === filters.status);
    }
    if (filters.search) {
        const q = filters.search.toLowerCase();
        list = list.filter(
            (op) =>
                op.title.toLowerCase().includes(q) ||
                op.createdByName?.toLowerCase().includes(q)
        );
    }
    return list;
}

/**
 * Backwards-compatible alias for Manager Pending queue
 */
export async function getPendingOpinions() {
    const list = await getAllOpinions();
    return list.filter((op) => op.status === "Pending" || op.statusCode === 1);
}

/**
 * 4. GET /api/LegalOpinion/{id}
 * Returns full LegalOpinionResultDTO
 */
export async function getOpinionById(id) {
    try {
        const data = await request(`/api/LegalOpinion/${id}`, { method: "GET" });
        if (data && typeof data === "object") {
            const normalizedStatus = normalizeOpinionStatusName(data.status);
            const numStatus =
                typeof data.status === "number"
                    ? data.status
                    : data.statusCode ||
                      (normalizedStatus === "Approved"
                          ? 2
                          : normalizedStatus === "Rejected"
                          ? 3
                          : normalizedStatus === "RevisionRequired"
                          ? 4
                          : 1);
            return {
                ...data,
                status: normalizedStatus,
                statusCode: numStatus,
            };
        }
    } catch (err) {
        // If it's a mock ID or server is unreachable, check mockOpinions first
        const found = mockOpinions.find((op) => String(op.id) === String(id));
        if (found) {
            return { ...found };
        }
        throw err;
    }

    await wait(MOCK_DELAY_MS);
    const found = mockOpinions.find((op) => String(op.id) === String(id));
    if (!found) {
        throw new ApiError("الرأي القانوني المطلوب غير موجود.", 404);
    }
    return { ...found };
}

/**
 * 5. POST /api/LegalOpinion/{id}/Review
 * Body: [FromBody] ReviewOpinionDTO { Decision: 1|2|3, Comments? }
 * Decision: 1=Approved, 2=Rejected, 3=RevisionRequired
 */
export async function reviewOpinion(id, decision, comments = "") {
    const numDecision = Number(decision);
    const trimmedComments = comments ? String(comments).trim() : null;

    const body = {
        Decision: numDecision,
        Comments: trimmedComments,
    };

    try {
        // 1. Send the review request to the backend
        await request(`/api/LegalOpinion/${id}/Review`, {
            method: "POST",
            body,
        });

        // 2. Fetch fresh opinion details from the backend to ensure accurate, live data
        try {
            const fresh = await getOpinionById(id);
            if (fresh && typeof fresh === "object" && fresh.id) {
                return fresh;
            }
        } catch {
            // Fallback to optimistic object below if transient GET fails
        }

        const statusName =
            numDecision === 1 ? "Approved" : numDecision === 2 ? "Rejected" : "RevisionRequired";
        const statusCode = numDecision === 1 ? 2 : numDecision === 2 ? 3 : 4;

        return {
            id,
            status: statusName,
            statusCode,
            rejectionReason: numDecision !== 1 ? trimmedComments : null,
            success: true,
        };
    } catch (err) {
        const index = mockOpinions.findIndex((op) => String(op.id) === String(id));
        if (index !== -1 && !err?.status) {
            const statusName =
                numDecision === 1 ? "Approved" : numDecision === 2 ? "Rejected" : "RevisionRequired";
            const statusCode = numDecision === 1 ? 2 : numDecision === 2 ? 3 : 4;
            mockOpinions[index] = {
                ...mockOpinions[index],
                status: statusName,
                statusCode,
                rejectionReason: numDecision !== 1 ? trimmedComments : null,
            };
            return { ...mockOpinions[index] };
        }
        throw err;
    }
}

export async function approveOpinion(id, comments = "") {
    return reviewOpinion(id, 1, comments);
}

export async function rejectOpinion(id, reason = "") {
    return reviewOpinion(id, 2, reason);
}

export async function requestRevisionOpinion(id, reason = "") {
    return reviewOpinion(id, 3, reason);
}

/**
 * 6. PUT /api/LegalOpinion/{id}/Resubmit
 * Body: [FromBody] UpdateLegalOpinionDTO { Title?, Question?, Answer? }
 */
export async function resubmitOpinion(id, updatedFields) {
    const titleVal = (updatedFields.title || updatedFields.Title || "").trim();
    const questionVal = (updatedFields.question || updatedFields.Question || "").trim();
    const answerVal = (updatedFields.answer || updatedFields.Answer || "").trim();

    if (!titleVal || !questionVal || !answerVal) {
        throw new ApiError("يرجى ملء كافة الحقول (العنوان، السؤال، والرأي).", 400);
    }

    const body = {
        Title: titleVal,
        Question: questionVal,
        Answer: answerVal,
    };

    try {
        const res = await request(`/api/LegalOpinion/${id}/Resubmit`, {
            method: "PUT",
            body,
        });

        if (res && typeof res === "object" && res.id) {
            const normalizedStatus = normalizeOpinionStatusName(res.status);
            return {
                ...res,
                status: normalizedStatus,
                statusCode: typeof res.status === "number" ? res.status : (res.statusCode || 1),
            };
        }

        // If backend returned rows affected or minimal response, fetch fresh data
        try {
            const fresh = await getOpinionById(id);
            if (fresh && typeof fresh === "object" && fresh.id) {
                return fresh;
            }
        } catch {
            // Fallback optimistic
        }

        return {
            id,
            title: titleVal,
            question: questionVal,
            answer: answerVal,
            status: "Pending",
            statusCode: 1,
            success: true,
        };
    } catch (err) {
        const index = mockOpinions.findIndex((op) => String(op.id) === String(id));
        if (index !== -1 && !err?.status) {
            mockOpinions[index] = {
                ...mockOpinions[index],
                title: titleVal,
                question: questionVal,
                answer: answerVal,
                status: "Pending",
                statusCode: 1,
            };
            return { ...mockOpinions[index] };
        }
        throw err;
    }
}

/**
 * 7. DELETE /api/LegalOpinion/{id}
 * Deletes an opinion draft (any opinion that is NOT approved)
 */
export async function deleteOpinion(id) {
    const res = await request(`/api/LegalOpinion/${id}`, { method: "DELETE" });
    return res || { success: true };
}

/**
 * 8. GET /api/LegalOpinion/Document-By-Source?fileName=...
 * Triggers binary file stream download (application/octet-stream)
 */
export async function downloadDocumentBySource(fileName) {
    const token = getToken();
    try {
        const response = await fetch(
            apiUrl(`/api/LegalOpinion/Document-By-Source?fileName=${encodeURIComponent(fileName)}`),
            {
                method: "GET",
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            }
        );

        if (response.ok) {
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(downloadUrl);
            return true;
        }
    } catch {
        // Fallback
    }

    // Fallback if offline
    const blob = new Blob([`محتوى مستند السابقة القضائية: ${fileName}`], {
        type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    return true;
}

let mockUnknownQuestions = [
    {
        id: 8,
        question: "هل يجوز فسخ العقد من طرف واحد في عقود التوريد المستمرة؟",
        askedByName: "أحمد عبد الرحمن",
        createdAt: "2026-09-01T09:00:00Z",
    },
    {
        id: 9,
        question: "ما هي الأحقية في استرداد العربون حال تراجع المشتري عن إتمام البيع الابتدائي بسبب عيب خفي؟",
        askedByName: "سارة محمود",
        createdAt: "2026-09-02T11:30:00Z",
    },
    {
        id: 10,
        question: "هل يسقط الحق في المطالبة بالتعويض عن حوادث العمل بمضي سنة واحدة وفقاً للقانون المدني؟",
        askedByName: "خالد إبراهيم",
        createdAt: "2026-09-03T14:15:00Z",
    },
];

/**
 * 9. GET /api/LegalOpinion/Unknown-Questions
 */
export async function getUnknownQuestions() {
    try {
        const data = await request("/api/LegalOpinion/Unknown-Questions", { method: "GET" });
        if (Array.isArray(data)) return data;
    } catch (err) {
        if (err?.status || err?.rawResponse) {
            throw err;
        }
        // Fallback for demo only
    }
    await wait(MOCK_DELAY_MS);
    return [...mockUnknownQuestions];
}

/**
 * 10. DELETE /api/LegalOpinion/Unknown-Questions/{id}
 */
export async function deleteUnknownQuestion(id) {
    try {
        const res = await request(`/api/LegalOpinion/Unknown-Questions/${id}`, { method: "DELETE" });
        if (res) return res;
    } catch (err) {
        if (err?.status || err?.rawResponse) {
            throw err;
        }
        // Fallback for demo only
    }
    await wait(MOCK_DELAY_MS);
    mockUnknownQuestions = mockUnknownQuestions.filter((q) => String(q.id) !== String(id));
    return { success: true };
}

function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
