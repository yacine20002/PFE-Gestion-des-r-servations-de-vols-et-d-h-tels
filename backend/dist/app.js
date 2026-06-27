"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
dotenv_1.default.config();
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const flight_routes_1 = __importDefault(require("./routes/flight.routes"));
const hotel_routes_1 = __importDefault(require("./routes/hotel.routes"));
const room_routes_1 = __importDefault(require("./routes/room.routes"));
const airline_routes_1 = __importDefault(require("./routes/airline.routes"));
const reservation_routes_1 = __importDefault(require("./routes/reservation.routes"));
const payment_routes_1 = __importDefault(require("./routes/payment.routes"));
const review_routes_1 = __importDefault(require("./routes/review.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { error: 'Too many requests, please try again later.' },
});
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.APP_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/api', limiter);
// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/flights', flight_routes_1.default);
app.use('/api/hotels', hotel_routes_1.default);
app.use('/api/rooms', room_routes_1.default);
app.use('/api/airlines', airline_routes_1.default);
app.use('/api/reservations', reservation_routes_1.default);
app.use('/api/payments', payment_routes_1.default);
app.use('/api/reviews', review_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/dashboard', dashboard_routes_1.default);
app.use('/api/notifications', notification_routes_1.default);
// 404 handler
app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
// Global error handler
app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
    });
});
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📋 Health: http://localhost:${PORT}/health`);
});
exports.default = app;
//# sourceMappingURL=app.js.map