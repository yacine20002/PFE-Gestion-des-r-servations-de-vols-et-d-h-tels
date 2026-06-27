import { Router } from 'express';
import { addRoom, updateRoom, deleteRoom, getRoomsByHotel } from '../controllers/room.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.get('/hotel/:hotelId', getRoomsByHotel);
router.post('/', authenticate, authorize('HOTEL_MANAGER', 'ADMIN'), addRoom);
router.put('/:id', authenticate, authorize('HOTEL_MANAGER', 'ADMIN'), updateRoom);
router.delete('/:id', authenticate, authorize('HOTEL_MANAGER', 'ADMIN'), deleteRoom);

export default router;
