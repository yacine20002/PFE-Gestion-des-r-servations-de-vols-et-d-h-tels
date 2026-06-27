"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processPayment = void 0;
const prisma_1 = require("../lib/prisma");
const email_1 = require("../utils/email");
const notification_1 = require("../utils/notification");
const uuid_1 = require("uuid");
const processPayment = async (req, res) => {
    try {
        const { reservationType, reservationId, paymentMethod, cardNumber, cardHolder } = req.body;
        if (!['flight', 'hotel'].includes(reservationType)) {
            res.status(400).json({ error: 'Invalid reservation type' });
            return;
        }
        // Simulate payment (90% success rate)
        const paymentSuccess = Math.random() > 0.1;
        const transactionId = (0, uuid_1.v4)();
        const cardLast4 = cardNumber ? cardNumber.slice(-4) : '****';
        if (!paymentSuccess) {
            res.status(402).json({ error: 'Payment declined. Please try again.' });
            return;
        }
        let totalAmount;
        let userEmail = req.user.email;
        let paymentData = { amount: 0, method: paymentMethod || 'CARD', status: 'PAID', transactionId, cardLast4 };
        if (reservationType === 'flight') {
            const reservation = await prisma_1.prisma.flightReservation.findUnique({
                where: { id: reservationId },
                include: { flight: { include: { airline: true } } },
            });
            if (!reservation) {
                res.status(404).json({ error: 'Reservation not found' });
                return;
            }
            if (reservation.userId !== req.user.id) {
                res.status(403).json({ error: 'Forbidden' });
                return;
            }
            if (reservation.paymentStatus === 'PAID') {
                res.status(400).json({ error: 'Already paid' });
                return;
            }
            totalAmount = Number(reservation.totalPrice);
            paymentData.amount = totalAmount;
            paymentData.flightReservationId = reservationId;
            const [payment] = await prisma_1.prisma.$transaction([
                prisma_1.prisma.payment.create({ data: paymentData }),
                prisma_1.prisma.flightReservation.update({
                    where: { id: reservationId },
                    data: { paymentStatus: 'PAID', status: 'CONFIRMED' },
                }),
            ]);
            await (0, notification_1.createNotification)(req.user.id, 'Payment Successful', `Payment of $${totalAmount} confirmed for flight ${reservation.flight.flightNumber}.`, 'SUCCESS');
            await (0, email_1.sendEmail)({
                to: userEmail,
                subject: '✅ Payment Confirmed — Flight Ticket',
                html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
            <h2 style="color:#1a56db">✈️ Booking Confirmed!</h2>
            <p>Dear ${req.user.email},</p>
            <table style="width:100%;border-collapse:collapse">
              <tr><td><strong>Flight:</strong></td><td>${reservation.flight.flightNumber}</td></tr>
              <tr><td><strong>Airline:</strong></td><td>${reservation.flight.airline.name}</td></tr>
              <tr><td><strong>From:</strong></td><td>${reservation.flight.origin}</td></tr>
              <tr><td><strong>To:</strong></td><td>${reservation.flight.destination}</td></tr>
              <tr><td><strong>Departure:</strong></td><td>${reservation.flight.departureTime.toLocaleString()}</td></tr>
              <tr><td><strong>Seats:</strong></td><td>${reservation.seatsBooked}</td></tr>
              <tr><td><strong>Amount Paid:</strong></td><td style="color:green"><strong>$${totalAmount}</strong></td></tr>
              <tr><td><strong>Transaction ID:</strong></td><td>${transactionId}</td></tr>
            </table>
            <p>Download your ticket from your account dashboard.</p>
          </div>
        `,
            });
            res.json({ message: 'Payment successful', transactionId, payment });
        }
        else {
            const reservation = await prisma_1.prisma.hotelReservation.findUnique({
                where: { id: reservationId },
                include: { hotel: true, room: true },
            });
            if (!reservation) {
                res.status(404).json({ error: 'Reservation not found' });
                return;
            }
            if (reservation.userId !== req.user.id) {
                res.status(403).json({ error: 'Forbidden' });
                return;
            }
            if (reservation.paymentStatus === 'PAID') {
                res.status(400).json({ error: 'Already paid' });
                return;
            }
            totalAmount = Number(reservation.totalPrice);
            paymentData.amount = totalAmount;
            paymentData.hotelReservationId = reservationId;
            const [payment] = await prisma_1.prisma.$transaction([
                prisma_1.prisma.payment.create({ data: paymentData }),
                prisma_1.prisma.hotelReservation.update({
                    where: { id: reservationId },
                    data: { paymentStatus: 'PAID', status: 'CONFIRMED' },
                }),
            ]);
            await (0, notification_1.createNotification)(req.user.id, 'Payment Successful', `Payment of $${totalAmount} confirmed for ${reservation.hotel.name}.`, 'SUCCESS');
            await (0, email_1.sendEmail)({
                to: userEmail,
                subject: '✅ Payment Confirmed — Hotel Booking',
                html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
            <h2 style="color:#1a56db">🏨 Hotel Booking Confirmed!</h2>
            <table style="width:100%;border-collapse:collapse">
              <tr><td><strong>Hotel:</strong></td><td>${reservation.hotel.name}</td></tr>
              <tr><td><strong>City:</strong></td><td>${reservation.hotel.city}</td></tr>
              <tr><td><strong>Room:</strong></td><td>${reservation.room.type} - ${reservation.room.roomNumber}</td></tr>
              <tr><td><strong>Check-in:</strong></td><td>${reservation.checkIn.toLocaleDateString()}</td></tr>
              <tr><td><strong>Check-out:</strong></td><td>${reservation.checkOut.toLocaleDateString()}</td></tr>
              <tr><td><strong>Amount Paid:</strong></td><td style="color:green"><strong>$${totalAmount}</strong></td></tr>
              <tr><td><strong>Transaction ID:</strong></td><td>${transactionId}</td></tr>
            </table>
          </div>
        `,
            });
            res.json({ message: 'Payment successful', transactionId, payment });
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Payment processing failed' });
    }
};
exports.processPayment = processPayment;
//# sourceMappingURL=payment.controller.js.map