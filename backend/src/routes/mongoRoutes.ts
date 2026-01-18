import { Router } from 'express';
import * as mongoController from '../controllers/mongoController';

const router = Router();

router.post('/plan', mongoController.savePlan);
router.post('/summary', mongoController.saveSummary);
router.post('/learning-session', mongoController.saveLearningSession);
router.get('/learning-sessions', mongoController.getLearningSessions);
router.get('/plans', mongoController.getSavedPlans);

// Task checklist
router.get('/tasks', mongoController.getTasks);
router.post('/tasks', mongoController.addTask);
router.delete('/tasks', mongoController.clearTasks);
router.put('/tasks/:taskId/toggle', mongoController.toggleTask);

// Calendar activities
router.get('/calendar-activities', mongoController.getCalendarActivities);
router.post('/calendar-activities', mongoController.addCalendarActivity);

export default router;

