import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middlewares/auth.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';
import { Response } from 'express';

const router = Router();
const getId = (param: string | string[]): string => Array.isArray(param) ? param[0] : param;

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    res.json(notifications);
  } catch {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

router.patch('/:id/read', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const id = getId(req.params.id);
    const result = await prisma.notification.updateMany({
      where: { id, userId: req.user!.id },
      data: { isRead: true },
    });
    if (result.count === 0) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }
    res.json({ message: 'Marked as read' });
  } catch {
    res.status(500).json({ error: 'Failed to mark notification' });
  }
});

router.patch('/read-all', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.id, isRead: false },
      data: { isRead: true },
    });
    res.json({ message: 'All notifications marked as read' });
  } catch {
    res.status(500).json({ error: 'Failed to update notifications' });
  }
});

router.delete('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.notification.deleteMany({
      where: { userId: req.user!.id },
    });
    res.json({ message: 'All notifications cleared' });
  } catch {
    res.status(500).json({ error: 'Failed to clear notifications' });
  }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const id = getId(req.params.id);
    const result = await prisma.notification.deleteMany({
      where: { id, userId: req.user!.id },
    });
    if (result.count === 0) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }
    res.json({ message: 'Notification deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

export default router;
