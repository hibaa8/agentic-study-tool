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

// Tasks
export async function getTasks() {
    const res = await fetch(`${API_BASE}/save/tasks`);
    if (!res.ok) throw new Error('Failed to fetch tasks');
    return res.json();
}

export async function addTask(taskId: string, title: string, description?: string) {
    const res = await fetch(`${API_BASE}/save/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, title, description })
    });
    if (!res.ok) throw new Error('Failed to add task');
    return res.json();
}

export async function toggleTask(taskId: string) {
    const res = await fetch(`${API_BASE}/save/tasks/${taskId}/toggle`, {
        method: 'PUT'
    });
    if (!res.ok) throw new Error('Failed to toggle task');
    return res.json();
}

export async function clearTasks() {
    const res = await fetch(`${API_BASE}/save/tasks`, {
        method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to clear tasks');
    return res.json();
}

// Calendar activities
export async function getCalendarActivities() {
    const res = await fetch(`${API_BASE}/save/calendar-activities`);
    if (!res.ok) throw new Error('Failed to fetch activities');
    return res.json();
}

export async function addCalendarActivity(eventId: string, title: string, start: string, end: string) {
    const res = await fetch(`${API_BASE}/save/calendar-activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, title, start, end })
    });
    if (!res.ok) throw new Error('Failed to add activity');
    return res.json();
}


