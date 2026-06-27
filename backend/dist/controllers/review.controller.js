"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReview = exports.getFlightReviews = exports.createReview = void 0;
const prisma_1 = require("../lib/prisma");
const getId = (param) => Array.isArray(param) ? param[0] : String(param);
const createReview = async (req, res) => {
    try {
        const { flightId, rating, comment } = req.body;
        const ratingNum = parseInt(String(rating));
        if (ratingNum < 1 || ratingNum > 5) {
            res.status(400).json({ error: 'Rating must be between 1 and 5' });
            return;
        }
        const reservation = await prisma_1.prisma.flightReservation.findFirst({
            where: { userId: req.user.id, flightId: String(flightId), status: 'CONFIRMED' },
        });
        if (!reservation) {
            res.status(403).json({ error: 'You can only review flights you have completed' });
            return;
        }
        const review = await prisma_1.prisma.review.upsert({
            where: { userId_flightId: { userId: req.user.id, flightId: String(flightId) } },
            create: { userId: req.user.id, flightId: String(flightId), rating: ratingNum, comment },
            update: { rating: ratingNum, comment },
            include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } },
        });
        res.status(201).json(review);
    }
    catch {
        res.status(500).json({ error: 'Failed to submit review' });
    }
};
exports.createReview = createReview;
const getFlightReviews = async (req, res) => {
    try {
        const flightId = getId(req.params.flightId);
        const reviews = await prisma_1.prisma.review.findMany({
            where: { flightId },
            include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } },
            orderBy: { createdAt: 'desc' },
        });
        const avgRating = reviews.length
            ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
            : 0;
        res.json({ reviews, avgRating: Math.round(avgRating * 10) / 10, total: reviews.length });
    }
    catch {
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
};
exports.getFlightReviews = getFlightReviews;
const deleteReview = async (req, res) => {
    try {
        const id = getId(req.params.id);
        const review = await prisma_1.prisma.review.findUnique({ where: { id } });
        if (!review) {
            res.status(404).json({ error: 'Review not found' });
            return;
        }
        if (review.userId !== req.user.id && req.user.role !== 'ADMIN') {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }
        await prisma_1.prisma.review.delete({ where: { id } });
        res.json({ message: 'Review deleted' });
    }
    catch {
        res.status(500).json({ error: 'Failed to delete review' });
    }
};
exports.deleteReview = deleteReview;
//# sourceMappingURL=review.controller.js.map