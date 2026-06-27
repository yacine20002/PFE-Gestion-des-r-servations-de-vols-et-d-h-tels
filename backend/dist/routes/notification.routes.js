"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const getId = (param) => Array.isArray(param) ? param[0] : param;
router.get('/', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const notifications = await prisma_1.prisma.notification.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });
        res.json(notifications);
    }
    catch {
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});
router.patch('/:id/read', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const id = getId(req.params.id);
        const result = await prisma_1.prisma.notification.updateMany({
            where: { id, userId: req.user.id },
            data: { isRead: true },
        });
        if (result.count === 0) {
            res.status(404).json({ error: 'Notification not found' });
            return;
        }
        res.json({ message: 'Marked as read' });
    }
    catch {
        res.status(500).json({ error: 'Failed to mark notification' });
    }
});
router.patch('/read-all', auth_middleware_1.authenticate, async (req, res) => {
    try {
        await prisma_1.prisma.notification.updateMany({
            where: { userId: req.user.id, isRead: false },
            data: { isRead: true },
        });
        res.json({ message: 'All notifications marked as read' });
    }
    catch {
        res.status(500).json({ error: 'Failed to update notifications' });
    }
});
router.delete('/', auth_middleware_1.authenticate, async (req, res) => {
    try {
        await prisma_1.prisma.notification.deleteMany({
            where: { userId: req.user.id },
        });
        res.json({ message: 'All notifications cleared' });
    }
    catch {
        res.status(500).json({ error: 'Failed to clear notifications' });
    }
});
router.delete('/:id', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const id = getId(req.params.id);
        const result = await prisma_1.prisma.notification.deleteMany({
            where: { id, userId: req.user.id },
        });
        if (result.count === 0) {
            res.status(404).json({ error: 'Notification not found' });
            return;
        }
        res.json({ message: 'Notification deleted' });
    }
    catch {
        res.status(500).json({ error: 'Failed to delete notification' });
    }
});
exports.default = router;
//# sourceMappingURL=notification.routes.js.map