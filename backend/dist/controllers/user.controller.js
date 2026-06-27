"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleBlockUser = exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserById = exports.getAllUsers = void 0;
const prisma_1 = require("../lib/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const getId = (param) => Array.isArray(param) ? param[0] : param;
const getAllUsers = async (req, res) => {
    try {
        const { role, isBlocked, search, page = '1', limit = '20' } = req.query;
        const where = {};
        if (role)
            where.role = role;
        if (isBlocked !== undefined)
            where.isBlocked = isBlocked === 'true';
        if (search) {
            where.OR = [
                { email: { contains: search } },
                { firstName: { contains: search } },
                { lastName: { contains: search } },
            ];
        }
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [users, total] = await Promise.all([
            prisma_1.prisma.user.findMany({
                where, skip, take: parseInt(limit),
                select: { id: true, email: true, firstName: true, lastName: true, role: true, isBlocked: true, createdAt: true, phone: true },
                orderBy: { createdAt: 'desc' },
            }),
            prisma_1.prisma.user.count({ where }),
        ]);
        res.json({ data: users, total, page: parseInt(page), limit: parseInt(limit) });
    }
    catch {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};
exports.getAllUsers = getAllUsers;
const getUserById = async (req, res) => {
    try {
        const id = getId(req.params.id);
        const user = await prisma_1.prisma.user.findUnique({
            where: { id },
            select: {
                id: true, email: true, firstName: true, lastName: true,
                role: true, isBlocked: true, phone: true, avatarUrl: true, createdAt: true,
                _count: { select: { flightReservations: true, hotelReservations: true } },
            },
        });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json(user);
    }
    catch {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
};
exports.getUserById = getUserById;
const createUser = async (req, res) => {
    try {
        const { email, password, firstName, lastName, phone, role } = req.body;
        const existing = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (existing) {
            res.status(409).json({ error: 'Email already in use' });
            return;
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 12);
        const user = await prisma_1.prisma.user.create({
            data: { email, passwordHash, firstName, lastName, phone, role },
            select: { id: true, email: true, firstName: true, lastName: true, role: true },
        });
        res.status(201).json(user);
    }
    catch {
        res.status(500).json({ error: 'Failed to create user' });
    }
};
exports.createUser = createUser;
const updateUser = async (req, res) => {
    try {
        const id = getId(req.params.id);
        const { firstName, lastName, email, password, phone, role, isBlocked, avatarUrl } = req.body;
        // Check if email is being updated and if it's already in use
        if (email) {
            const existingUser = await prisma_1.prisma.user.findFirst({
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
        const updateData = {
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
            updateData.passwordHash = await bcryptjs_1.default.hash(password, 12);
        }
        const user = await prisma_1.prisma.user.update({
            where: { id },
            data: updateData,
            select: { id: true, email: true, firstName: true, lastName: true, role: true, isBlocked: true, phone: true },
        });
        res.json(user);
    }
    catch (err) {
        console.error('Update user failed:', err);
        res.status(500).json({ error: 'Failed to update user' });
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res) => {
    try {
        const id = getId(req.params.id);
        await prisma_1.prisma.user.delete({ where: { id } });
        res.json({ message: 'User deleted' });
    }
    catch {
        res.status(500).json({ error: 'Failed to delete user' });
    }
};
exports.deleteUser = deleteUser;
const toggleBlockUser = async (req, res) => {
    try {
        const id = getId(req.params.id);
        const user = await prisma_1.prisma.user.findUnique({ where: { id } });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const updated = await prisma_1.prisma.user.update({
            where: { id },
            data: { isBlocked: !user.isBlocked },
        });
        res.json({ message: `User ${updated.isBlocked ? 'blocked' : 'unblocked'}`, isBlocked: updated.isBlocked });
    }
    catch {
        res.status(500).json({ error: 'Failed to toggle block' });
    }
};
exports.toggleBlockUser = toggleBlockUser;
//# sourceMappingURL=user.controller.js.map