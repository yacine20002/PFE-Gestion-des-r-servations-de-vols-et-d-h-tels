import { Router } from 'express';
import { createReview, getFlightReviews, deleteReview } from '../controllers/review.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.get('/flight/:flightId', getFlightReviews);
router.post('/', authenticate, authorize('CLIENT'), createReview);
router.delete('/:id', authenticate, deleteReview);

export default router;
