import { Router } from 'express';
import * as emailController from '../controllers/emailController';

const router = Router();

router.post('/send', emailController.sendReply);

export default router;
