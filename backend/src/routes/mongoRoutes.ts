import { Router } from 'express';
import * as mongoController from '../controllers/mongoController';

const router = Router();

router.post('/plan', mongoController.savePlan);
router.post('/summary', mongoController.saveSummary);
router.post('/learning-session', mongoController.saveLearningSession);
router.get('/learning-sessions', mongoController.getLearningSessions);
router.get('/plans', mongoController.getSavedPlans);

export default router;
