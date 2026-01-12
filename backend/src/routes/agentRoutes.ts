import { Router } from 'express';
import * as agentController from '../controllers/agentController';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

router.post('/weekly-plan', agentController.generateWeeklyPlan);
router.post('/triage-inbox', agentController.triageInbox);

export default router;
