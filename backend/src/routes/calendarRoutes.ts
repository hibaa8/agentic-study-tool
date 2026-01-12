import { Router } from 'express';
import * as calendarController from '../controllers/calendarController';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

router.post('/create-study-blocks', calendarController.createStudyBlocks);
router.patch('/event/:gcalId', calendarController.updateEvent);
router.delete('/event/:gcalId', calendarController.deleteEvent);

export default router;
