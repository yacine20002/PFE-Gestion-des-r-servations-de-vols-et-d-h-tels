import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getDashboardStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [
      totalUsers, totalClients, totalFlightReservations, totalHotelReservations,
      totalRevenue, activeFlights, totalHotels,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'CLIENT' } }),
      prisma.flightReservation.count({ where: { status: 'CONFIRMED' } }),
      prisma.hotelReservation.count({ where: { status: 'CONFIRMED' } }),
      prisma.payment.aggregate({ where: { status: 'PAID' }, _sum: { amount: true } }),
      prisma.flight.count({ where: { status: { in: ['SCHEDULED', 'BOARDING'] } } }),
      prisma.hotel.count(),
    ]);

    const revenue = Number(totalRevenue._sum.amount || 0);

    res.json({
      totalUsers,
      totalClients,
      totalReservations: totalFlightReservations + totalHotelReservations,
      totalFlightReservations,
      totalHotelReservations,
      totalRevenue: revenue,
      activeFlights,
      totalHotels,
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

export const getMonthlyReservations = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const year = new Date().getFullYear();
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    const data = await Promise.all(
      months.map(async (month) => {
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0, 23, 59, 59);

        const [flights, hotels, revenue] = await Promise.all([
          prisma.flightReservation.count({ where: { createdAt: { gte: start, lte: end } } }),
          prisma.hotelReservation.count({ where: { createdAt: { gte: start, lte: end } } }),
          prisma.payment.aggregate({
            where: { status: 'PAID', createdAt: { gte: start, lte: end } },
            _sum: { amount: true },
          }),
        ]);

        return {
          month: start.toLocaleString('default', { month: 'short' }),
          flights,
          hotels,
          revenue: Number(revenue._sum.amount || 0),
        };
      })
    );

    res.json(data);
  } catch {
    res.status(500).json({ error: 'Failed to fetch monthly data' });
  }
};

export const getRevenueByHotel = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const hotels = await prisma.hotel.findMany({
      include: {
        reservations: {
          where: { paymentStatus: 'PAID' },
          select: { totalPrice: true },
        },
      },
      take: 10,
    });

    const data = hotels.map((h) => ({
      name: h.name,
      city: h.city,
      revenue: h.reservations.reduce((sum, r) => sum + Number(r.totalPrice), 0),
      reservations: h.reservations.length,
    })).sort((a, b) => b.revenue - a.revenue);

    res.json(data);
  } catch {
    res.status(500).json({ error: 'Failed to fetch hotel revenue' });
  }
};

export const getRevenueByAirline = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const airlines = await prisma.airlineCompany.findMany({
      include: {
        flights: {
          include: {
            reservations: {
              where: { paymentStatus: 'PAID' },
              select: { totalPrice: true },
            },
          },
        },
      },
    });

    const data = airlines.map((a) => ({
      name: a.name,
      iataCode: a.iataCode,
      revenue: a.flights.reduce((sum, f) =>
        sum + f.reservations.reduce((s, r) => s + Number(r.totalPrice), 0), 0
      ),
      reservations: a.flights.reduce((sum, f) => sum + f.reservations.length, 0),
    })).sort((a, b) => b.revenue - a.revenue);

    res.json(data);
  } catch {
    res.status(500).json({ error: 'Failed to fetch airline revenue' });
  }
};

export const getOccupancyRate = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const hotels = await prisma.hotel.findMany({
      include: {
        rooms: { select: { id: true } },
        reservations: {
          where: { status: 'CONFIRMED', checkIn: { lte: new Date() }, checkOut: { gte: new Date() } },
          select: { id: true },
        },
      },
    });

    const data = hotels.map((h) => ({
      name: h.name,
      totalRooms: h.rooms.length,
      occupiedRooms: h.reservations.length,
      occupancyRate: h.rooms.length > 0 ? Math.round((h.reservations.length / h.rooms.length) * 100) : 0,
    }));

    res.json(data);
  } catch {
    res.status(500).json({ error: 'Failed to fetch occupancy data' });
  }
};

export const getRecentActivity = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [recentFlights, recentHotels, recentUsers] = await Promise.all([
      prisma.flightReservation.findMany({
        take: 5, orderBy: { createdAt: 'desc' },
        include: { user: { select: { firstName: true, lastName: true } }, flight: true },
      }),
      prisma.hotelReservation.findMany({
        take: 5, orderBy: { createdAt: 'desc' },
        include: { user: { select: { firstName: true, lastName: true } }, hotel: true },
      }),
      prisma.user.findMany({
        take: 5, orderBy: { createdAt: 'desc' },
        select: { id: true, firstName: true, lastName: true, email: true, role: true, createdAt: true },
      }),
    ]);

    res.json({ recentFlights, recentHotels, recentUsers });
  } catch {
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
};
