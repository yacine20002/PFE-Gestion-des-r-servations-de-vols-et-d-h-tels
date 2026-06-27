import { Router } from 'express';
import {
  getAllUsers, getUserById, createUser, updateUser, deleteUser, toggleBlockUser
} from '../controllers/user.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticate, authorize('ADMIN'), getAllUsers);
router.get('/:id', authenticate, authorize('ADMIN'), getUserById);
router.post('/', authenticate, authorize('ADMIN'), createUser);
router.put('/:id', authenticate, authorize('ADMIN'), updateUser);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteUser);
router.patch('/:id/toggle-block', authenticate, authorize('ADMIN'), toggleBlockUser);

export default router;
