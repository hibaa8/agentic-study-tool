import { Request, Response } from 'express';
import { google } from 'googleapis';
import { getGoogleClient } from '../services/googleAuth';
import { prisma } from '../utils/db';
import { CalendarActionSchema } from '@focus/shared';

const getUserId = (req: Request) => (req as any).userId as string;

export const createStudyBlocks = async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);
        const body = CalendarActionSchema.parse(req.body);

        if (!body.confirmed) {
            return res.status(400).json({ error: 'Action not confirmed' });
        }

        if (!body.blocks || body.blocks.length === 0) {
            return res.status(400).json({ error: 'No blocks provided' });
        }

        const auth = await getGoogleClient(userId);
        const calendar = google.calendar({ version: 'v3', auth });

        const results = [];
        for (const block of body.blocks) {
            console.log(`[Calendar] Creating event for: ${block.title} at ${block.start} - ${block.end}`);
            try {
                const eventInput = {
                    calendarId: 'primary',
                    requestBody: {
                        summary: block.title,
                        description: block.description || 'FocusOS Study Block',
                        start: { dateTime: block.start },
                        end: { dateTime: block.end }
                    }
                };
                console.log('[Calendar] Payload:', JSON.stringify(eventInput, null, 2));

                const event = await calendar.events.insert(eventInput);
                console.log(`[Calendar] Success! Event ID: ${event.data.id}`);

                // Save to local DB as well
                if (event.data.id) {
                    const calEvent = await prisma.calendarEvent.create({
                        data: {
                            userId,
                            gcalId: event.data.id,
                            title: block.title,
                            start: new Date(block.start),
                            end: new Date(block.end),
                            rawJson: JSON.stringify(event.data)
                        }
                    });
                    results.push(calEvent);
                }
            } catch (e: any) {
                console.error('[Calendar] Error creating event:', e.message);
                // Continue loop even if one fails
            }
        }

        // Log intent (Task requirement: Log every write action)
        console.log(`User ${userId} created ${results.length} study blocks`);

        res.json({ success: true, created: results.length, events: results });

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateEvent = async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);
        const { gcalId } = req.params;
        const body = CalendarActionSchema.parse(req.body); // expecting confirmed + updates

        if (!body.confirmed) return res.status(400).json({ error: 'Action not confirmed' });

        const auth = await getGoogleClient(userId);
        const calendar = google.calendar({ version: 'v3', auth });

        // First fetch existing to merge? Or just patch. patch is safer.
        const response = await calendar.events.patch({
            calendarId: 'primary',
            eventId: gcalId,
            requestBody: body.updates
        });

        // Update local DB
        await prisma.calendarEvent.update({
            where: { gcalId },
            data: {
                ...(body.updates?.summary && { title: body.updates.summary }),
                ...(body.updates?.start?.dateTime && { start: new Date(body.updates.start.dateTime) }),
                ...(body.updates?.end?.dateTime && { end: new Date(body.updates.end.dateTime) }),
                rawJson: JSON.stringify(response.data)
            }
        });

        console.log(`User ${userId} updated event ${gcalId}`);
        res.json({ success: true, event: response.data });

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteEvent = async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);
        const { gcalId } = req.params;
        // Check confirmation from body? DELETE requests usually have no body in some clients, but standard allows it.
        // If not, we typically use query param. Let's assume body for now strictly as per spec.
        const confirmed = req.body.confirmed === true;

        if (!confirmed) return res.status(400).json({ error: 'Action not confirmed' });

        const auth = await getGoogleClient(userId);
        const calendar = google.calendar({ version: 'v3', auth });

        await calendar.events.delete({
            calendarId: 'primary',
            eventId: gcalId
        });

        await prisma.calendarEvent.delete({
            where: { gcalId }
        });

        console.log(`User ${userId} deleted event ${gcalId}`);
        res.json({ success: true });

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
