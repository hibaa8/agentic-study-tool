const API_BASE = '/api'; // Proxied to 5001

export async function fetchMe() {
    const res = await fetch(`${API_BASE}/auth/me`);
    if (!res.ok) throw new Error('Not authenticated');
    return res.json();
}

export async function syncServices(type: 'gmail' | 'calendar' | 'all') {
    const res = await fetch(`${API_BASE}/sync/${type}`, { method: 'POST' });
    return res.json();
}

export async function generateWeeklyPlan(weekStartDate: string) {
    const res = await fetch(`${API_BASE}/agent/weekly-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weekStartDate })
    });
    return res.json();
}

export async function triageInbox(limit = 10) {
    const res = await fetch(`${API_BASE}/agent/triage-inbox`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit })
    });
    return res.json();
}

export async function createStudyBlocks(blocks: any[], confirmed: boolean) {
    const res = await fetch(`${API_BASE}/calendar/create-study-blocks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocks, confirmed })
    });
    return res.json();
}

export const saveWeeklyPlan = async (plan: any) => {
    const res = await fetch(`${API_BASE}/save/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            weekStartDate: plan.weekStartDate,
            planJson: plan
        })
    });
    return res.json();
};

export const saveSummary = async (filename: string, text: string) => {
    const res = await fetch(`${API_BASE}/save/summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            sourceFile: filename,
            summaryText: text
        })
    });
    return res.json();
};

export const sendEmail = async (to: string, subject: string, body: string) => {
    const res = await fetch(`${API_BASE}/email/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, body })
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to send email');
    }
    return res.json();
};

export async function uploadLearningMaterial(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/learning/upload`, {
        method: 'POST',
        body: formData
        // Content-Type header not needed, browser sets it boundary
    });

    if (!res.ok) throw new Error('Upload failed');
    return res.json();
}

export async function generateMCQ(materialId: string) {
    const res = await fetch(`${API_BASE}/learning/${materialId}/mcq`, {
        method: 'POST'
    });
    if (!res.ok) throw new Error('MCQ generation failed');
    return res.json();
}

export async function generateGraph(materialId: string) {
    const res = await fetch(`${API_BASE}/learning/${materialId}/graph`, {
        method: 'POST'
    });
    if (!res.ok) throw new Error('Graph generation failed');
    return res.json();
}

export async function saveLearningSession(filename: string, summary?: any, graph?: any, quiz?: any) {
    const res = await fetch(`${API_BASE}/save/learning-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, summary, graph, quiz })
    });
    if (!res.ok) throw new Error('Save failed');
    return res.json();
}

export async function getLearningSessions() {
    const res = await fetch(`${API_BASE}/save/learning-sessions`);
    if (!res.ok) throw new Error('Failed to fetch sessions');
    return res.json();
}

export async function getSavedPlans() {
    const res = await fetch(`${API_BASE}/save/plans`);
    if (!res.ok) throw new Error('Failed to fetch plans');
    return res.json();
}
