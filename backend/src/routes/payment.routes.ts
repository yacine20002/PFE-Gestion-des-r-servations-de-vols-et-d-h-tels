import { Router } from 'express';
import { processPayment } from '../controllers/payment.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authenticate, authorize('CLIENT'), processPayment);

export default router;
