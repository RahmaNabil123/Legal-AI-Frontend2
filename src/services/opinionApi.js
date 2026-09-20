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

    try {
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
        if (realResult) return realResult;
    } catch (err) {
        if (err?.status || err?.rawResponse) {
            throw err;
        }
        // Fallback for offline demo
    }

    await wait(MOCK_DELAY_MS);

    const session = getSession();
    const advisorName = session?.user?.firstName
        ? `${session.user.firstName} ${session.user.lastName || ""}`.trim()
        : "المستشار الحالي";

    const newOpinion = {
        id: Date.now(),
        title: opinionData.title.trim(),
        question: opinionData.question.trim(),
        answer: opinionData.answer?.trim() || "",
        createdByName: advisorName,
        submittedBy: advisorName,
        createdAt: new Date().toISOString().split("T")[0],
        status: "Pending",
        statusCode: 1,
        rejectionReason: null,
        document: file
            ? {
                  fileName: file.name,
                  fileSize: file.size,
                  fileType: file.name.split(".").pop()?.toUpperCase() || "PDF",
              }
            : null,
        reviews: [],
    };

    mockOpinions.unshift(newOpinion);
    return newOpinion;
}

/**
 * 2. GET /api/LegalOpinion/Legal-Advisor-Opinions
 * Backs GetLegalOpinionsForUser (Advisor's own opinions)
 */
export async function getMyOpinions(filters = {}) {
    try {
        const data = await request("/api/LegalOpinion/Legal-Advisor-Opinions", { method: "GET" });
        if (Array.isArray(data)) {
            let list = data.map((op) => ({
                ...op,
                status: normalizeOpinionStatusName(op.status),
                statusCode: typeof op.status === "number" ? op.status : op.statusCode,
            }));
            if (filters.status && filters.status !== "ALL") {
                list = list.filter((op) => op.status === filters.status);
            }
            if (filters.search) {
                const q = filters.search.toLowerCase();
                list = list.filter((op) => op.title?.toLowerCase().includes(q));
            }
            return list;
        }
    } catch (err) {
        if (err?.status || err?.rawResponse) {
            throw err;
        }
        // Fallback for offline demo only
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
            let list = data.map((op) => ({
                ...op,
                status: normalizeOpinionStatusName(op.status),
                statusCode: typeof op.status === "number" ? op.status : op.statusCode,
            }));
            if (filters.status && filters.status !== "ALL") {
                list = list.filter((op) => op.status === filters.status);
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
        if (err?.status || err?.rawResponse) {
            throw err;
        }
        // Fallback for offline demo only
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
        if (data) {
            return {
                ...data,
                status: normalizeOpinionStatusName(data.status),
                statusCode: typeof data.status === "number" ? data.status : data.statusCode,
            };
        }
    } catch (err) {
        if (err?.status || err?.rawResponse) {
            throw err;
        }
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
    try {
        const body = {
            Decision: decision,
            Comments: comments ? comments.trim() : null,
            decision,
            comments: comments ? comments.trim() : null,
        };
        const realResult = await request(`/api/LegalOpinion/${id}/Review`, {
            method: "POST",
            body,
        });
        if (realResult) return realResult;
    } catch (err) {
        if (err?.status || err?.rawResponse) {
            throw err;
        }
    }

    await wait(MOCK_DELAY_MS);
    const index = mockOpinions.findIndex((op) => String(op.id) === String(id));
    if (index === -1) {
        throw new ApiError("الرأي القانوني غير موجود.", 404);
    }

    const statusName =
        decision === 1 ? "Approved" : decision === 2 ? "Rejected" : "RevisionRequired";
    const statusCode = decision === 1 ? 2 : decision === 2 ? 3 : 4;

    mockOpinions[index] = {
        ...mockOpinions[index],
        status: statusName,
        statusCode,
        rejectionReason: decision !== 1 ? (comments ? comments.trim() : null) : null,
        reviews: [
            ...(mockOpinions[index].reviews || []),
            {
                reviewerName: "المدير الحالي",
                decision,
                comments: comments ? comments.trim() : null,
                createdAt: new Date().toISOString(),
            },
        ],
    };

    return { ...mockOpinions[index] };
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
    const titleVal = updatedFields.title?.trim() || updatedFields.Title?.trim();
    const questionVal = updatedFields.question?.trim() || updatedFields.Question?.trim();
    const answerVal = updatedFields.answer?.trim() || updatedFields.Answer?.trim();

    try {
        const body = {
            Title: titleVal,
            Question: questionVal,
            Answer: answerVal,
            title: titleVal,
            question: questionVal,
            answer: answerVal,
        };
        const result = await request(`/api/LegalOpinion/${id}/Resubmit`, {
            method: "PUT",
            body,
        });
        if (result) return result;
    } catch (err) {
        if (err?.status || err?.rawResponse) {
            throw err;
        }
    }

    await wait(MOCK_DELAY_MS);
    const index = mockOpinions.findIndex((op) => String(op.id) === String(id));
    if (index !== -1) {
        mockOpinions[index] = {
            ...mockOpinions[index],
            title: titleVal || mockOpinions[index].title,
            question: questionVal || mockOpinions[index].question,
            answer: answerVal || mockOpinions[index].answer,
            status: "Pending",
            statusCode: 1,
        };
        return mockOpinions[index];
    }
    return null;
}

/**
 * 7. DELETE /api/LegalOpinion/{id}
 * Deletes an opinion draft (any opinion that is NOT approved)
 */
export async function deleteOpinion(id) {
    try {
        const res = await request(`/api/LegalOpinion/${id}`, { method: "DELETE" });
        if (res) return res;
    } catch (err) {
        if (err?.status || err?.rawResponse) {
            throw err;
        }
    }

    await wait(MOCK_DELAY_MS);
    mockOpinions = mockOpinions.filter((op) => String(op.id) !== String(id));
    return { success: true };
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
