"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.updateProfile = exports.getMe = exports.resetPassword = exports.forgotPassword = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../lib/prisma");
const email_1 = require("../utils/email");
const crypto_1 = __importDefault(require("crypto"));
const register = async (req, res) => {
    try {
        const { email, password, firstName, lastName, phone, role } = req.body;
        if (!email || !password || !firstName || !lastName) {
            res.status(400).json({ error: 'All fields are required' });
            return;
        }
        const existing = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (existing) {
            res.status(409).json({ error: 'Email already in use' });
            return;
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 12);
        const allowedRoles = ['CLIENT', 'HOTEL_MANAGER', 'FLIGHT_MANAGER'];
        const userRole = allowedRoles.includes(role) ? role : 'CLIENT';
        const user = await prisma_1.prisma.user.create({
            data: { email, passwordHash, firstName, lastName, phone, role: userRole },
            select: { id: true, email: true, firstName: true, lastName: true, role: true },
        });
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
        await (0, email_1.sendEmail)({
            to: email,
            subject: 'Welcome to FlightHotel Booking!',
            html: `<h2>Welcome, ${firstName}!</h2><p>Your account has been created successfully.</p>`,
        });
        res.status(201).json({ message: 'Account created', token, user });
    }
    catch (err) {
        res.status(500).json({ error: 'Registration failed' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: 'Email and password required' });
            return;
        }
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        if (user.isBlocked) {
            res.status(403).json({ error: 'Account is blocked. Contact support.' });
            return;
        }
        const valid = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!valid) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
        res.json({
            token,
            user: {
                id: user.id, email: user.email, firstName: user.firstName,
                lastName: user.lastName, role: user.role, avatarUrl: user.avatarUrl,
            },
        });
    }
    catch (err) {
        res.status(500).json({ error: 'Login failed' });
    }
};
exports.login = login;
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        console.log(`[AUTH] Forgot password request received for email: ${email}`);
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            console.log(`[AUTH] Reset email NOT sent: user with email "${email}" does not exist in the database.`);
            res.json({ message: 'If the email exists, a reset link has been sent.' });
            return;
        }
        const token = crypto_1.default.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 3600000); // 1 hour
        await prisma_1.prisma.passwordReset.create({ data: { userId: user.id, token, expiresAt } });
        const resetUrl = `${process.env.APP_URL}/auth/reset-password?token=${token}`;
        console.log(`[AUTH] User found. Generating token and sending password reset email to: ${email}`);
        await (0, email_1.sendEmail)({
            to: email,
            subject: 'Password Reset Request',
            html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. Link expires in 1 hour.</p>`,
        });
        res.json({ message: 'If the email exists, a reset link has been sent.' });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to process request' });
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        const reset = await prisma_1.prisma.passwordReset.findUnique({ where: { token } });
        if (!reset || reset.used || reset.expiresAt < new Date()) {
            res.status(400).json({ error: 'Invalid or expired reset token' });
            return;
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 12);
        await prisma_1.prisma.user.update({ where: { id: reset.userId }, data: { passwordHash } });
        await prisma_1.prisma.passwordReset.update({ where: { id: reset.id }, data: { used: true } });
        res.json({ message: 'Password reset successfully' });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to reset password' });
    }
};
exports.resetPassword = resetPassword;
const getMe = async (req, res) => {
    try {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true, email: true, firstName: true, lastName: true,
                phone: true, role: true, avatarUrl: true, createdAt: true,
            },
        });
        res.json(user);
    }
    catch {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};
exports.getMe = getMe;
const updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, phone, avatarUrl } = req.body;
        const user = await prisma_1.prisma.user.update({
            where: { id: req.user.id },
            data: { firstName, lastName, phone, avatarUrl },
            select: { id: true, email: true, firstName: true, lastName: true, phone: true, role: true, avatarUrl: true },
        });
        res.json(user);
    }
    catch {
        res.status(500).json({ error: 'Failed to update profile' });
    }
};
exports.updateProfile = updateProfile;
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await prisma_1.prisma.user.findUnique({ where: { id: req.user.id } });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const valid = await bcryptjs_1.default.compare(currentPassword, user.passwordHash);
        if (!valid) {
            res.status(400).json({ error: 'Current password incorrect' });
            return;
        }
        const passwordHash = await bcryptjs_1.default.hash(newPassword, 12);
        await prisma_1.prisma.user.update({ where: { id: req.user.id }, data: { passwordHash } });
        res.json({ message: 'Password changed successfully' });
    }
    catch {
        res.status(500).json({ error: 'Failed to change password' });
    }
};
exports.changePassword = changePassword;
//# sourceMappingURL=auth.controller.js.map