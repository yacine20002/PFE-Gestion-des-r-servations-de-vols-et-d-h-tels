"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecentActivity = exports.getOccupancyRate = exports.getRevenueByAirline = exports.getRevenueByHotel = exports.getMonthlyReservations = exports.getDashboardStats = void 0;
const prisma_1 = require("../lib/prisma");
const getDashboardStats = async (_req, res) => {
    try {
        const [totalUsers, totalClients, totalFlightReservations, totalHotelReservations, totalRevenue, activeFlights, totalHotels,] = await Promise.all([
            prisma_1.prisma.user.count(),
            prisma_1.prisma.user.count({ where: { role: 'CLIENT' } }),
            prisma_1.prisma.flightReservation.count({ where: { status: 'CONFIRMED' } }),
            prisma_1.prisma.hotelReservation.count({ where: { status: 'CONFIRMED' } }),
            prisma_1.prisma.payment.aggregate({ where: { status: 'PAID' }, _sum: { amount: true } }),
            prisma_1.prisma.flight.count({ where: { status: { in: ['SCHEDULED', 'BOARDING'] } } }),
            prisma_1.prisma.hotel.count(),
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
    }
    catch {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
};
exports.getDashboardStats = getDashboardStats;
const getMonthlyReservations = async (_req, res) => {
    try {
        const year = new Date().getFullYear();
        const months = Array.from({ length: 12 }, (_, i) => i + 1);
        const data = await Promise.all(months.map(async (month) => {
            const start = new Date(year, month - 1, 1);
            const end = new Date(year, month, 0, 23, 59, 59);
            const [flights, hotels, revenue] = await Promise.all([
                prisma_1.prisma.flightReservation.count({ where: { createdAt: { gte: start, lte: end } } }),
                prisma_1.prisma.hotelReservation.count({ where: { createdAt: { gte: start, lte: end } } }),
                prisma_1.prisma.payment.aggregate({
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
        }));
        res.json(data);
    }
    catch {
        res.status(500).json({ error: 'Failed to fetch monthly data' });
    }
};
exports.getMonthlyReservations = getMonthlyReservations;
const getRevenueByHotel = async (_req, res) => {
    try {
        const hotels = await prisma_1.prisma.hotel.findMany({
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
    }
    catch {
        res.status(500).json({ error: 'Failed to fetch hotel revenue' });
    }
};
exports.getRevenueByHotel = getRevenueByHotel;
const getRevenueByAirline = async (_req, res) => {
    try {
        const airlines = await prisma_1.prisma.airlineCompany.findMany({
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
            revenue: a.flights.reduce((sum, f) => sum + f.reservations.reduce((s, r) => s + Number(r.totalPrice), 0), 0),
            reservations: a.flights.reduce((sum, f) => sum + f.reservations.length, 0),
        })).sort((a, b) => b.revenue - a.revenue);
        res.json(data);
    }
    catch {
        res.status(500).json({ error: 'Failed to fetch airline revenue' });
    }
};
exports.getRevenueByAirline = getRevenueByAirline;
const getOccupancyRate = async (_req, res) => {
    try {
        const hotels = await prisma_1.prisma.hotel.findMany({
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
    }
    catch {
        res.status(500).json({ error: 'Failed to fetch occupancy data' });
    }
};
exports.getOccupancyRate = getOccupancyRate;
const getRecentActivity = async (_req, res) => {
    try {
        const [recentFlights, recentHotels, recentUsers] = await Promise.all([
            prisma_1.prisma.flightReservation.findMany({
                take: 5, orderBy: { createdAt: 'desc' },
                include: { user: { select: { firstName: true, lastName: true } }, flight: true },
            }),
            prisma_1.prisma.hotelReservation.findMany({
                take: 5, orderBy: { createdAt: 'desc' },
                include: { user: { select: { firstName: true, lastName: true } }, hotel: true },
            }),
            prisma_1.prisma.user.findMany({
                take: 5, orderBy: { createdAt: 'desc' },
                select: { id: true, firstName: true, lastName: true, email: true, role: true, createdAt: true },
            }),
        ]);
        res.json({ recentFlights, recentHotels, recentUsers });
    }
    catch {
        res.status(500).json({ error: 'Failed to fetch recent activity' });
    }
};
exports.getRecentActivity = getRecentActivity;
//# sourceMappingURL=dashboard.controller.js.map