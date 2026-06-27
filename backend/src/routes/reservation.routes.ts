import { Router } from 'express';
import {
  getMyReservations, createFlightReservation, cancelFlightReservation,
  createHotelReservation, cancelHotelReservation, getAllReservations
} from '../controllers/reservation.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Client routes
router.get('/my', authenticate, getMyReservations);
router.post('/flight', authenticate, authorize('CLIENT'), createFlightReservation);
router.delete('/flight/:id', authenticate, cancelFlightReservation);
router.post('/hotel', authenticate, authorize('CLIENT'), createHotelReservation);
router.delete('/hotel/:id', authenticate, cancelHotelReservation);

// Admin routes
router.get('/all', authenticate, authorize('ADMIN', 'HOTEL_MANAGER', 'FLIGHT_MANAGER'), getAllReservations);

export default router;
