import { Router } from 'express';
import * as syncController from '../controllers/syncController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.post('/gmail', syncController.syncGmail);
router.post('/calendar', syncController.syncCalendar);
router.post('/docs', syncController.syncDocs);
router.post('/all', syncController.syncAll);

export default router;
