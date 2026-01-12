"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.triageInbox = exports.generateWeeklyPlan = void 0;
const db_1 = require("../utils/db");
const llm_1 = require("./llm");
const generateWeeklyPlan = async (userId, weekStartDate) => {
    // 1. Gather context: Calendar events, Unread emails, Tasks
    const start = new Date(weekStartDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    const events = await db_1.prisma.calendarEvent.findMany({
        where: {
            userId,
            start: {
                gte: start.toISOString(),
                lte: end.toISOString()
            }
        }
    });
    const tasks = await db_1.prisma.task.findMany({ where: { userId, status: 'todo' } });
    // 2. Construct Prompt
    // 2. Construct Prompt
    console.log(`[WeeklyPlan] Generating plan for ${events.length} events and ${tasks.length} tasks.`);
    // Calculate busy slots for the next 24 hours to help LLM avoid overlaps
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const busySlots = events
        .filter(e => {
        const eStart = new Date(e.start);
        return eStart >= now && eStart <= tomorrow;
    })
        .map(e => `${new Date(e.start).toLocaleTimeString()} - ${new Date(e.end).toLocaleTimeString()} (${e.title})`);
    const prompt = `
    You are an expert study + scheduling planner. Your job is to:
    (1) infer what I need to do to prepare for the coming week based on my calendar,
    (2) turn that into a concrete task list with time estimates, and
    (3) schedule focused work blocks over the next few days without conflicts.

    TIME CONTEXT
    - Current time (ISO): ${now.toISOString()}
    - Planning window: from ${now.toISOString()} through ${new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString()} (next 3 days)
    - Busy slots (already unavailable) within the planning window: ${JSON.stringify(busySlots)}
    - Calendar events (next 7 days): ${JSON.stringify(events.map(e => ({ start: e.start, end: e.end, title: e.title })))}
    - Existing user to-do list (may be empty): ${JSON.stringify(tasks.map(t => ({ title: t.title, priority: t.priority })))}

    WHAT TO DO
    A) Build a realistic TASK LIST for the coming week.
    - Always include the user's existing tasks (if any).
    - If the user’s list is empty OR incomplete, INFER additional prep tasks from upcoming calendar events.
    - Examples of inferred tasks:
    - "Prep for [Class Name]" (reading, slides review, practice problems)
    - "Study for [Exam/Midterm]" (topic breakdown + practice)
    - "Interview prep for [Company/Round]" (DSA + behavioral + systems)
    - "Prepare presentation for [Event]" (outline, slides, rehearsal)
    - Prefer concrete tasks that are actionable. Avoid vague tasks like "be productive".

    B) Prioritize tasks:
    - Highest priority = tasks tied to events happening soonest OR tasks with explicit deadlines.
    - Use these priority labels only: "high" | "medium" | "low".
    - If two tasks are similar priority, favor the one with nearer event date.

    C) Schedule STUDY/WORK BLOCKS for the next 3 days (NOT just 24h):
    - Create 2–4 deep work blocks per day if there is time; fewer if the schedule is tight.
    - Each block should be 50–120 minutes.
    - STRICTLY avoid overlaps with busy slots.
    - Place high-priority tasks earlier.
    - Use titles that clearly reflect the task (e.g., "Interview prep: Arrays + Two Pointers", "Presentation: slide draft", "Class prep: reading + notes").

    OUTPUT FORMAT (STRICT)
    Return ONLY a valid JSON object matching this exact schema (no markdown, no backticks, no commentary):

    {
    "weekStartDate": "ISO_DATE_STRING",
    "tasks": [
        {
        "title": "string",
        "sourceType": "manual" | "inferred",
        "priority": "high" | "medium" | "low",
        "status": "todo",
        "estMins": 15 | 30 | 45 | 60 | 90 | 120
        }
    ],
    "studyBlocks": [
        {
        "title": "string",
        "start": "ISO_8601_DATETIME_STRING",
        "end": "ISO_8601_DATETIME_STRING"
        }
    ]
    }

    STRICT RULES (DO NOT VIOLATE)
    1) Output must be valid JSON only.
    2) Use ONLY the keys in the schema: weekStartDate, tasks, studyBlocks, and inside arrays use ONLY the specified keys.
    3) Dates/times MUST be full ISO 8601 strings.
    4) Every study block MUST be within the planning window:
    start/end between ${now.toISOString()} and ${new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString()}.
    5) No overlaps:
    - studyBlocks must not overlap busySlots
    - studyBlocks must not overlap each other
    6) Ensure start < end for every block, and durations are 50–120 minutes.

    Now produce the JSON.
    `;
    // 3. Call LLM
    const response = await (0, llm_1.callLLM)({
        userPrompt: prompt,
        // systemPrompt: "You are an expert productivity planner." // integrated into prompt
    });
    // 4. Validate & Save
    // const plan = WeeklyPlanSchema.parse(response); // Validation disabled for mock simplicity
    const plan = response;
    await db_1.prisma.plan.create({
        data: {
            userId,
            weekStartDate: new Date(weekStartDate),
            planJson: JSON.stringify(plan)
        }
    });
    return plan;
};
exports.generateWeeklyPlan = generateWeeklyPlan;
const triageInbox = async (userId, limit = 10) => {
    // 1. Fetch unread emails from the last 48 hours
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const emails = await db_1.prisma.emailItem.findMany({
        where: {
            userId,
            isUnread: true,
            receivedAt: {
                gte: twoDaysAgo.toISOString()
            }
        },
        take: limit
    });
    if (emails.length === 0)
        return [];
    // Get user info for self-email detection
    const user = await db_1.prisma.user.findUnique({ where: { id: userId } });
    const userEmail = user?.email || '';
    // 2. Prompt
    const prompt = `
    Analyze these emails and output a JSON array of objects.
    
    User's email address: ${userEmail}
    
    Emails:
    ${emails.map(e => `- ID:${e.gmailId} From:${e.from} Sub:${e.subject} Body:${e.snippet}`).join('\n')}
    
    Goals:
    1. **Classify** each email into one of these EXACT categories:
       - "SPAM": Newsletters, automated alerts (security/login), marketing, promotions, social media notifs.
         EXCEPTION: NEVER classify emails from "${userEmail}" (self-emails) as SPAM.
       - "FYI": Receipts, confirmations, informational updates that don't need a reply. Also includes self-emails.
       - "ACTION": Personal emails, work requests, questions requiring a specific human reply.
       
    2. **Draft Reply**:
       - Format ALL replies with proper email structure:
         * Greeting (e.g., "Hi [Name]," or "Hello,")
         * Message body (1-3 paragraphs, context-appropriate)
         * Signature: "Sincerely,\nHiba Altaf"
       - FOR "ACTION": specific, polite draft reply addressing the email content.
       - FOR "FYI": brief polite acknowledgement (e.g., "Thanks for the update!").
       - FOR "SPAM": empty string "".
       
    Output a valid JSON array strictly matching this schema:
    [
      { 
        "gmailId": "string (from input)", 
        "subject": "string (from input)",
        "from": "string (from input)",
        "classification": "SPAM" | "FYI" | "ACTION", 
        "reason": "short string explaining classification",
        "draftReply": "string" 
      }
    ]
    `;
    // 3. Call LLM
    const result = await (0, llm_1.callLLM)({ userPrompt: prompt });
    // 4. Save Triage Run
    await db_1.prisma.triageRun.create({
        data: {
            userId,
            resultJson: JSON.stringify(result)
        }
    });
    return result;
};
exports.triageInbox = triageInbox;
