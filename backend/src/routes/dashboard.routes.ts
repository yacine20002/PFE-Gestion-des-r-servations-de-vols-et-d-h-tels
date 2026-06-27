import { Router } from 'express';
import {
  getDashboardStats, getMonthlyReservations, getRevenueByHotel,
  getRevenueByAirline, getOccupancyRate, getRecentActivity
} from '../controllers/dashboard.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

const adminOrManager = authorize('ADMIN', 'HOTEL_MANAGER', 'FLIGHT_MANAGER');

router.get('/stats', authenticate, authorize('ADMIN'), getDashboardStats);
router.get('/monthly', authenticate, adminOrManager, getMonthlyReservations);
router.get('/revenue/hotels', authenticate, adminOrManager, getRevenueByHotel);
router.get('/revenue/airlines', authenticate, adminOrManager, getRevenueByAirline);
router.get('/occupancy', authenticate, adminOrManager, getOccupancyRate);
router.get('/recent', authenticate, authorize('ADMIN'), getRecentActivity);

export default router;
