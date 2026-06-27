import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

const getId = (param: string | string[]): string => Array.isArray(param) ? param[0] : param;

export const getHotels = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      city, checkIn, checkOut, guests,
      minPrice, maxPrice, stars, page, limit
    } = req.query as Record<string, string>;

    const parsedPage = parseInt(page) || 1;
    const parsedLimit = parseInt(limit) || 20;
    const guestCount = parseInt(guests) || 1;
    const starsCount = parseInt(stars);

    const parsedMinPrice = parseFloat(minPrice);
    const parsedMaxPrice = parseFloat(maxPrice);
    const hasMinPrice = !isNaN(parsedMinPrice);
    const hasMaxPrice = !isNaN(parsedMaxPrice);

    const where: any = {};
    if (hasMinPrice || hasMaxPrice) {
      where.rooms = {
        some: {
          isAvailable: true,
          pricePerNight: {
            ...(hasMinPrice ? { gte: parsedMinPrice } : {}),
            ...(hasMaxPrice ? { lte: parsedMaxPrice } : {}),
          },
        },
      };
    }
    if (city) where.city = { contains: city };
    if (!isNaN(starsCount)) where.stars = { gte: starsCount };

    const skip = (parsedPage - 1) * parsedLimit;

    const [hotels, total] = await Promise.all([
      prisma.hotel.findMany({
        where,
        include: {
          rooms: {
            where: {
              isAvailable: true,
              capacity: { gte: guestCount },
              ...(hasMinPrice || hasMaxPrice ? {
                pricePerNight: {
                  ...(hasMinPrice ? { gte: parsedMinPrice } : {}),
                  ...(hasMaxPrice ? { lte: parsedMaxPrice } : {}),
                },
              } : {}),
            },
            orderBy: { pricePerNight: 'asc' },
            take: 1,
          },
          manager: { select: { firstName: true, lastName: true } },
        },
        orderBy: { stars: 'desc' },
        skip,
        take: parsedLimit,
      }),
      prisma.hotel.count({ where }),
    ]);

    res.json({ data: hotels, total, page: parsedPage, limit: parsedLimit });
  } catch (error) {
    console.error('getHotels error:', error);
    res.status(500).json({ error: 'Failed to fetch hotels' });
  }
};

export const getHotelById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = getId(req.params.id);
    const hotel = await prisma.hotel.findUnique({
      where: { id },
      include: {
        rooms: { orderBy: { pricePerNight: 'asc' } },
        manager: { select: { firstName: true, lastName: true, email: true } },
      },
    });
    if (!hotel) { res.status(404).json({ error: 'Hotel not found' }); return; }
    res.json(hotel);
  } catch {
    res.status(500).json({ error: 'Failed to fetch hotel' });
  }
};

export const createHotel = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, city, address, stars, description, imageUrl, amenities } = req.body;
    const managerId = req.user?.role === 'HOTEL_MANAGER' ? req.user.id : req.body.managerId;

    const parsedStars = stars !== undefined ? parseInt(stars, 10) : 3;

    const hotel = await prisma.hotel.create({
      data: {
        name,
        city,
        address,
        stars: isNaN(parsedStars) ? 3 : parsedStars,
        description,
        imageUrl,
        amenities: JSON.stringify(amenities || []),
        managerId,
      },
    });
    res.status(201).json(hotel);
  } catch (err: any) {
    console.error('createHotel error:', err);
    res.status(500).json({ error: 'Failed to create hotel' });
  }
};

export const updateHotel = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = getId(req.params.id);
    const hotel = await prisma.hotel.findUnique({ where: { id } });
    if (!hotel) { res.status(404).json({ error: 'Hotel not found' }); return; }

    if (req.user?.role === 'HOTEL_MANAGER' && hotel.managerId !== req.user.id) {
      res.status(403).json({ error: 'Not authorized to edit this hotel' }); return;
    }

    const { name, city, address, stars, description, imageUrl, amenities } = req.body;

    const parsedStars = stars !== undefined ? parseInt(stars, 10) : undefined;

    const updated = await prisma.hotel.update({
      where: { id },
      data: {
        name,
        city,
        address,
        ...(parsedStars !== undefined && !isNaN(parsedStars) && { stars: parsedStars }),
        description,
        imageUrl,
        amenities: amenities ? JSON.stringify(amenities) : undefined,
      },
    });
    res.json(updated);
  } catch (err: any) {
    console.error('updateHotel error:', err);
    res.status(500).json({ error: 'Failed to update hotel' });
  }
};

export const deleteHotel = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = getId(req.params.id);
    await prisma.hotel.delete({ where: { id } });
    res.json({ message: 'Hotel deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete hotel' });
  }
};

export const getMyHotels = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const hotels = await prisma.hotel.findMany({
      where: { managerId: req.user!.id },
      include: { rooms: true, _count: { select: { reservations: true } } },
    });
    res.json(hotels);
  } catch {
    res.status(500).json({ error: 'Failed to fetch your hotels' });
  }
};
