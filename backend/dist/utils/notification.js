"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotification = void 0;
const prisma_1 = require("../lib/prisma");
const createNotification = async (userId, title, message, type = 'INFO') => {
    try {
        await prisma_1.prisma.notification.create({
            data: { userId, title, message, type },
        });
    }
    catch (err) {
        console.error('Failed to create notification:', err);
    }
};
exports.createNotification = createNotification;
//# sourceMappingURL=notification.js.map