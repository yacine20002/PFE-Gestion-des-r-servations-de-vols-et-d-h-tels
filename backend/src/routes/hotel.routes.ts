import { Router } from 'express';
import {
  getHotels, getHotelById, createHotel, updateHotel, deleteHotel, getMyHotels
} from '../controllers/hotel.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', getHotels);
router.get('/my', authenticate, authorize('HOTEL_MANAGER', 'ADMIN'), getMyHotels);
router.get('/:id', getHotelById);
router.post('/', authenticate, authorize('HOTEL_MANAGER', 'ADMIN'), createHotel);
router.put('/:id', authenticate, authorize('HOTEL_MANAGER', 'ADMIN'), updateHotel);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteHotel);

export default router;
