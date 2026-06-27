import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import bcrypt from 'bcryptjs';

const getId = (param: string | string[]): string => Array.isArray(param) ? param[0] : param;

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role, isBlocked, search, page = '1', limit = '20' } = req.query as Record<string, string>;
    const where: any = {};
    if (role) where.role = role;
    if (isBlocked !== undefined) where.isBlocked = isBlocked === 'true';
    if (search) {
      where.OR = [
        { email: { contains: search } },
        { firstName: { contains: search } },
        { lastName: { contains: search } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where, skip, take: parseInt(limit),
        select: { id: true, email: true, firstName: true, lastName: true, role: true, isBlocked: true, createdAt: true, phone: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ data: users, total, page: parseInt(page), limit: parseInt(limit) });
  } catch {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = getId(req.params.id);
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        role: true, isBlocked: true, phone: true, avatarUrl: true, createdAt: true,
        _count: { select: { flightReservations: true, hotelReservations: true } },
      },
    });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    res.json(user);
  } catch {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, phone, role } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) { res.status(409).json({ error: 'Email already in use' }); return; }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, passwordHash, firstName, lastName, phone, role },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    });
    res.status(201).json(user);
  } catch {
    res.status(500).json({ error: 'Failed to create user' });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = getId(req.params.id);
    const { firstName, lastName, email, password, phone, role, isBlocked, avatarUrl } = req.body;

    // Check if email is being updated and if it's already in use
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id },
        },
      });
      if (existingUser) {
        res.status(409).json({ error: 'Email is already in use by another user' });
        return;
      }
    }

    // Prepare update data
    const updateData: any = {
      firstName,
      lastName,
      email,
      phone,
      role,
      isBlocked,
      avatarUrl,
    };

    // Hash password if provided
    if (password && password.trim() !== '') {
      updateData.passwordHash = await bcrypt.hash(password, 12);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, email: true, firstName: true, lastName: true, role: true, isBlocked: true, phone: true },
    });
    res.json(user);
  } catch (err) {
    console.error('Update user failed:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = getId(req.params.id);
    await prisma.user.delete({ where: { id } });
    res.json({ message: 'User deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

export const toggleBlockUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = getId(req.params.id);
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    const updated = await prisma.user.update({
      where: { id },
      data: { isBlocked: !user.isBlocked },
    });
    res.json({ message: `User ${updated.isBlocked ? 'blocked' : 'unblocked'}`, isBlocked: updated.isBlocked });
  } catch {
    res.status(500).json({ error: 'Failed to toggle block' });
  }
};
