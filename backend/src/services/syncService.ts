import { google } from 'googleapis';
import { getGoogleClient } from './googleAuth';
import { prisma } from '../utils/db';

export const syncGmail = async (userId: string, limit: number = 10) => {
    const auth = await getGoogleClient(userId);
    const gmail = google.gmail({ version: 'v1', auth });

    const res = await gmail.users.messages.list({
        userId: 'me',
        q: 'is:unread',
        maxResults: limit
    });

    const messages = res.data.messages || [];
    const results = [];

    for (const msg of messages) {
        if (!msg.id) continue;
        const details = await gmail.users.messages.get({ userId: 'me', id: msg.id });
        const headers = details.data.payload?.headers;
        const subject = headers?.find(h => h.name === 'Subject')?.value || '(No Subject)';
        const from = headers?.find(h => h.name === 'From')?.value || '(Unknown)';

        // Simple upsert
        const emailItem = await prisma.emailItem.upsert({
            where: { gmailId: msg.id },
            update: {
                isUnread: true, // we queried unread
                // In a real app we might update snippet etc
            },
            create: {
                userId,
                gmailId: msg.id,
                threadId: msg.threadId,
                from,
                subject,
                snippet: details.data.snippet || '',
                receivedAt: new Date(Number(details.data.internalDate)),
                isUnread: true,
                rawJson: JSON.stringify(details.data)
            }
        });
        results.push(emailItem);
    }
    return results;
};

export const syncCalendar = async (userId: string, days: number = 7) => {
    const auth = await getGoogleClient(userId);
    const calendar = google.calendar({ version: 'v3', auth });

    const now = new Date();
    const end = new Date();
    end.setDate(now.getDate() + days);

    const res = await calendar.events.list({
        calendarId: 'primary',
        timeMin: now.toISOString(),
        timeMax: end.toISOString(),
        singleEvents: true,
        orderBy: 'startTime'
    });

    const events = res.data.items || [];
    const results = [];

    for (const event of events) {
        if (!event.id) continue;

        const start = event.start?.dateTime || event.start?.date;
        const end = event.end?.dateTime || event.end?.date;
        if (!start || !end) continue;

        const calEvent = await prisma.calendarEvent.upsert({
            where: { gcalId: event.id },
            update: {
                title: event.summary || '(No Title)',
                start: new Date(start),
                end: new Date(end),
                location: event.location,
                rawJson: JSON.stringify(event)
            },
            create: {
                userId,
                gcalId: event.id,
                title: event.summary || '(No Title)',
                start: new Date(start),
                end: new Date(end),
                location: event.location,
                rawJson: JSON.stringify(event)
            }
        });
        results.push(calEvent);
    }
    return results;
};

export const syncDocs = async (userId: string, opts: { docId?: string, folderId?: string }) => {
    const auth = await getGoogleClient(userId);
    const drive = google.drive({ version: 'v3', auth });

    // Placeholder logic for Docs
    // If docId provided, fetch that doc.
    // Logic for exporting Google Doc as text:
    // GET /files/fileId/export?mimeType=text/plain

    const results = [];

    if (opts.docId) {
        try {
            // Check if it's a google doc
            const meta = await drive.files.get({ fileId: opts.docId, fields: 'id, name, modifiedTime, mimeType' });

            let extractedText = '';
            if (meta.data.mimeType === 'application/vnd.google-apps.document') {
                const exportRes = await drive.files.export({
                    fileId: opts.docId,
                    mimeType: 'text/plain'
                });
                extractedText = typeof exportRes.data === 'string' ? exportRes.data : JSON.stringify(exportRes.data);
            }

            const docItem = await prisma.docItem.upsert({
                where: { fileId: opts.docId },
                update: {
                    title: meta.data.name || 'Untitled',
                    modifiedTime: new Date(meta.data.modifiedTime || new Date()),
                    extractedText,
                    // textHash: ... 
                },
                create: {
                    userId,
                    fileId: opts.docId,
                    title: meta.data.name || 'Untitled',
                    sourceType: 'doc',
                    modifiedTime: new Date(meta.data.modifiedTime || new Date()),
                    extractedText,
                    rawJson: JSON.stringify(meta.data)
                }
            });
            results.push(docItem);
        } catch (e) {
            console.error(`Failed to sync doc ${opts.docId}`, e);
        }
    }

    // TODO: Handle folderId recursion if needed

    return results;
};
