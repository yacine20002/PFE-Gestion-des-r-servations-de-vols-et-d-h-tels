import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

const getId = (param: string | string[]): string => Array.isArray(param) ? param[0] : param;

export const addRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { hotelId, roomNumber, type, pricePerNight, capacity, description, imageUrl } = req.body;

    if (req.user?.role === 'HOTEL_MANAGER') {
      const hotel = await prisma.hotel.findFirst({ where: { id: String(hotelId), managerId: req.user.id } });
      if (!hotel) { res.status(403).json({ error: 'Not authorized for this hotel' }); return; }
    }

    const parsedPrice = pricePerNight !== undefined ? parseFloat(pricePerNight) : 0;
    const parsedCapacity = capacity !== undefined ? parseInt(capacity, 10) : 2;

    const room = await prisma.room.create({
      data: {
        hotelId: String(hotelId),
        roomNumber,
        type,
        pricePerNight: isNaN(parsedPrice) ? 0 : parsedPrice,
        capacity: isNaN(parsedCapacity) ? 2 : parsedCapacity,
        description,
        imageUrl,
      },
    });
    res.status(201).json(room);
  } catch (err: any) {
    console.error('addRoom error:', err);
    res.status(500).json({ error: 'Failed to add room' });
  }
};

export const updateRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = getId(req.params.id);
    const room = await prisma.room.findUnique({
      where: { id },
      include: { hotel: true },
    });
    if (!room) { res.status(404).json({ error: 'Room not found' }); return; }

    if (req.user?.role === 'HOTEL_MANAGER' && room.hotel.managerId !== req.user.id) {
      res.status(403).json({ error: 'Not authorized' }); return;
    }

    const { roomNumber, type, pricePerNight, capacity, isAvailable, description, imageUrl } = req.body;
    
    const parsedPrice = pricePerNight !== undefined ? parseFloat(pricePerNight) : undefined;
    const parsedCapacity = capacity !== undefined ? parseInt(capacity, 10) : undefined;

    const updated = await prisma.room.update({
      where: { id },
      data: {
        roomNumber,
        type,
        ...(parsedPrice !== undefined && !isNaN(parsedPrice) && { pricePerNight: parsedPrice }),
        ...(parsedCapacity !== undefined && !isNaN(parsedCapacity) && { capacity: parsedCapacity }),
        isAvailable: isAvailable === true || isAvailable === 'true',
        description,
        imageUrl,
      },
    });
    res.json(updated);
  } catch (err: any) {
    console.error('updateRoom error:', err);
    res.status(500).json({ error: 'Failed to update room' });
  }
};

export const deleteRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = getId(req.params.id);
    await prisma.room.delete({ where: { id } });
    res.json({ message: 'Room deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete room' });
  }
};

export const getRoomsByHotel = async (req: Request, res: Response): Promise<void> => {
  try {
    const hotelId = getId(req.params.hotelId);
    const rooms = await prisma.room.findMany({
      where: { hotelId },
      orderBy: { pricePerNight: 'asc' },
    });
    res.json(rooms);
  } catch {
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
};
