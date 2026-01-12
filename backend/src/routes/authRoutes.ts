import { Router } from 'express';
import * as authController from '../controllers/authController';

const router = Router();

router.get('/google', authController.login);
router.get('/google/callback', authController.callback);
router.post('/logout', authController.logout);
router.get('/me', authController.getMe);
router.get('/dev-login', authController.devLogin);

export default router;
