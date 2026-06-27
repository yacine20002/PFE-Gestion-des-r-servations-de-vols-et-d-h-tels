"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const adminOrManager = (0, auth_middleware_1.authorize)('ADMIN', 'HOTEL_MANAGER', 'FLIGHT_MANAGER');
router.get('/stats', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), dashboard_controller_1.getDashboardStats);
router.get('/monthly', auth_middleware_1.authenticate, adminOrManager, dashboard_controller_1.getMonthlyReservations);
router.get('/revenue/hotels', auth_middleware_1.authenticate, adminOrManager, dashboard_controller_1.getRevenueByHotel);
router.get('/revenue/airlines', auth_middleware_1.authenticate, adminOrManager, dashboard_controller_1.getRevenueByAirline);
router.get('/occupancy', auth_middleware_1.authenticate, adminOrManager, dashboard_controller_1.getOccupancyRate);
router.get('/recent', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), dashboard_controller_1.getRecentActivity);
exports.default = router;
//# sourceMappingURL=dashboard.routes.js.map