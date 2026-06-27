"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllReservations = exports.cancelHotelReservation = exports.createHotelReservation = exports.cancelFlightReservation = exports.createFlightReservation = exports.getMyReservations = void 0;
const prisma_1 = require("../lib/prisma");
const email_1 = require("../utils/email");
const notification_1 = require("../utils/notification");
const getId = (param) => Array.isArray(param) ? param[0] : param;
// ========================
// FLIGHT RESERVATIONS
// ========================
const getMyReservations = async (req, res) => {
    try {
        const [flightRes, hotelRes] = await Promise.all([
            prisma_1.prisma.flightReservation.findMany({
                where: { userId: req.user.id },
                include: {
                    flight: { include: { airline: { select: { name: true, logoUrl: true } } } },
                    payment: true,
                },
                orderBy: { createdAt: 'desc' },
            }),
            prisma_1.prisma.hotelReservation.findMany({
                where: { userId: req.user.id },
                include: { hotel: true, room: true, payment: true },
                orderBy: { createdAt: 'desc' },
            }),
        ]);
        res.json({ flights: flightRes, hotels: hotelRes });
    }
    catch {
        res.status(500).json({ error: 'Failed to fetch reservations' });
    }
};
exports.getMyReservations = getMyReservations;
const createFlightReservation = async (req, res) => {
    try {
        const { flightId, seatsBooked, seatClass, passengerInfo } = req.body;
        const seats = parseInt(seatsBooked) || 1;
        const flight = await prisma_1.prisma.flight.findUnique({ where: { id: flightId } });
        if (!flight) {
            res.status(404).json({ error: 'Flight not found' });
            return;
        }
        if (flight.availableSeats < seats) {
            res.status(400).json({ error: `Only ${flight.availableSeats} seats available` });
            return;
        }
        if (flight.status === 'CANCELLED') {
            res.status(400).json({ error: 'Flight is cancelled' });
            return;
        }
        const totalPrice = Number(flight.price) * seats;
        const reservation = await prisma_1.prisma.$transaction(async (tx) => {
            await tx.flight.update({
                where: { id: flightId },
                data: { availableSeats: { decrement: seats } },
            });
            return tx.flightReservation.create({
                data: {
                    userId: req.user.id, flightId, seatsBooked: seats,
                    totalPrice, seatClass: seatClass || 'ECONOMY',
                    passengerInfo: passengerInfo ? JSON.stringify(passengerInfo) : null,
                },
                include: { flight: { include: { airline: true } } },
            });
        });
        await (0, notification_1.createNotification)(req.user.id, 'Reservation Created', `Your flight reservation to ${flight.destination} is pending payment.`, 'SUCCESS');
        await (0, email_1.sendEmail)({
            to: req.user.email,
            subject: 'Flight Reservation Confirmation',
            html: `<h2>Reservation Confirmed!</h2><p>Flight: ${flight.flightNumber}</p><p>Seats: ${seats}</p><p>Total: $${totalPrice}</p><p>Please complete your payment to confirm.</p>`,
        });
        res.status(201).json(reservation);
    }
    catch {
        res.status(500).json({ error: 'Failed to create reservation' });
    }
};
exports.createFlightReservation = createFlightReservation;
const cancelFlightReservation = async (req, res) => {
    try {
        const id = getId(req.params.id);
        const reservation = await prisma_1.prisma.flightReservation.findUnique({
            where: { id },
            include: {
                flight: {
                    include: {
                        airline: {
                            include: { managers: { select: { id: true } } }
                        }
                    }
                }
            },
        });
        if (!reservation) {
            res.status(404).json({ error: 'Reservation not found' });
            return;
        }
        const isOwner = reservation.userId === req.user.id;
        const isAdmin = req.user.role === 'ADMIN';
        const isFlightManager = req.user.role === 'FLIGHT_MANAGER' &&
            reservation.flight.airline.managers.some((m) => m.id === req.user.id);
        if (!isOwner && !isAdmin && !isFlightManager) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }
        if (reservation.status === 'CANCELLED') {
            res.status(400).json({ error: 'Already cancelled' });
            return;
        }
        const updated = await prisma_1.prisma.$transaction(async (tx) => {
            await tx.flight.update({
                where: { id: reservation.flightId },
                data: { availableSeats: { increment: reservation.seatsBooked } },
            });
            return tx.flightReservation.update({
                where: { id },
                data: { status: 'CANCELLED', paymentStatus: reservation.paymentStatus === 'PAID' ? 'REFUNDED' : reservation.paymentStatus },
            });
        });
        await (0, notification_1.createNotification)(reservation.userId, 'Reservation Cancelled', `Your flight to ${reservation.flight.destination} has been cancelled.`, 'WARNING');
        await (0, email_1.sendEmail)({
            to: req.user.email,
            subject: 'Flight Reservation Cancelled',
            html: `<h2>Reservation Cancelled</h2><p>Your reservation for flight ${reservation.flight.flightNumber} has been cancelled.</p>`,
        });
        res.json(updated);
    }
    catch {
        res.status(500).json({ error: 'Failed to cancel reservation' });
    }
};
exports.cancelFlightReservation = cancelFlightReservation;
// ========================
// HOTEL RESERVATIONS
// ========================
const createHotelReservation = async (req, res) => {
    try {
        const { hotelId, roomId, checkIn, checkOut, guestCount, specialRequests } = req.body;
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        if (checkInDate >= checkOutDate) {
            res.status(400).json({ error: 'Check-out must be after check-in' });
            return;
        }
        const room = await prisma_1.prisma.room.findUnique({ where: { id: roomId } });
        if (!room || !room.isAvailable) {
            res.status(400).json({ error: 'Room not available' });
            return;
        }
        const conflict = await prisma_1.prisma.hotelReservation.findFirst({
            where: {
                roomId,
                status: { not: 'CANCELLED' },
                AND: [{ checkIn: { lt: checkOutDate } }, { checkOut: { gt: checkInDate } }],
            },
        });
        if (conflict) {
            res.status(400).json({ error: 'Room is already booked for those dates' });
            return;
        }
        const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
        const totalPrice = Number(room.pricePerNight) * nights;
        const reservation = await prisma_1.prisma.hotelReservation.create({
            data: {
                userId: req.user.id, hotelId, roomId, checkIn: checkInDate, checkOut: checkOutDate,
                totalPrice, guestCount: guestCount || 1, specialRequests,
            },
            include: { hotel: true, room: true },
        });
        await (0, notification_1.createNotification)(req.user.id, 'Hotel Reservation Created', `Your reservation at ${reservation.hotel.name} is pending payment.`, 'SUCCESS');
        await (0, email_1.sendEmail)({
            to: req.user.email,
            subject: 'Hotel Reservation Confirmation',
            html: `<h2>Hotel Reservation!</h2><p>Hotel: ${reservation.hotel.name}</p><p>Check-in: ${checkIn}</p><p>Check-out: ${checkOut}</p><p>Total: $${totalPrice} (${nights} nights)</p>`,
        });
        res.status(201).json(reservation);
    }
    catch {
        res.status(500).json({ error: 'Failed to create hotel reservation' });
    }
};
exports.createHotelReservation = createHotelReservation;
const cancelHotelReservation = async (req, res) => {
    try {
        const id = getId(req.params.id);
        const reservation = await prisma_1.prisma.hotelReservation.findUnique({
            where: { id },
            include: { hotel: true },
        });
        if (!reservation) {
            res.status(404).json({ error: 'Reservation not found' });
            return;
        }
        const isOwner = reservation.userId === req.user.id;
        const isAdmin = req.user.role === 'ADMIN';
        const isHotelManager = req.user.role === 'HOTEL_MANAGER' && reservation.hotel.managerId === req.user.id;
        if (!isOwner && !isAdmin && !isHotelManager) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }
        if (reservation.status === 'CANCELLED') {
            res.status(400).json({ error: 'Already cancelled' });
            return;
        }
        const updated = await prisma_1.prisma.hotelReservation.update({
            where: { id },
            data: { status: 'CANCELLED', paymentStatus: reservation.paymentStatus === 'PAID' ? 'REFUNDED' : reservation.paymentStatus },
        });
        await (0, notification_1.createNotification)(reservation.userId, 'Hotel Reservation Cancelled', `Your reservation at ${reservation.hotel.name} has been cancelled.`, 'WARNING');
        res.json(updated);
    }
    catch {
        res.status(500).json({ error: 'Failed to cancel hotel reservation' });
    }
};
exports.cancelHotelReservation = cancelHotelReservation;
// ========================
// ADMIN: All reservations
// ========================
const getAllReservations = async (req, res) => {
    try {
        const { type = 'flight', page = '1', limit = '20' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        if (type === 'hotel') {
            const where = {};
            if (req.user?.role === 'HOTEL_MANAGER') {
                where.hotel = { managerId: req.user.id };
            }
            const [data, total] = await Promise.all([
                prisma_1.prisma.hotelReservation.findMany({
                    where,
                    include: { user: { select: { firstName: true, lastName: true, email: true } }, hotel: true, room: true, payment: true },
                    orderBy: { createdAt: 'desc' },
                    skip, take: parseInt(limit),
                }),
                prisma_1.prisma.hotelReservation.count({ where }),
            ]);
            res.json({ data, total });
        }
        else {
            const where = {};
            if (req.user?.role === 'FLIGHT_MANAGER') {
                where.flight = { airline: { managers: { some: { id: req.user.id } } } };
            }
            const [data, total] = await Promise.all([
                prisma_1.prisma.flightReservation.findMany({
                    where,
                    include: { user: { select: { firstName: true, lastName: true, email: true } }, flight: { include: { airline: true } }, payment: true },
                    orderBy: { createdAt: 'desc' },
                    skip, take: parseInt(limit),
                }),
                prisma_1.prisma.flightReservation.count({ where }),
            ]);
            res.json({ data, total });
        }
    }
    catch (err) {
        console.error('getAllReservations error:', err);
        res.status(500).json({ error: 'Failed to fetch reservations' });
    }
};
exports.getAllReservations = getAllReservations;
//# sourceMappingURL=reservation.controller.js.map