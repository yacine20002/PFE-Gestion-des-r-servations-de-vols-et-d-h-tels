import { prisma } from '../lib/prisma';

export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' = 'INFO'
): Promise<void> => {
  try {
    await prisma.notification.create({
      data: { userId, title, message, type },
    });
  } catch (err) {
    console.error('Failed to create notification:', err);
  }
};
