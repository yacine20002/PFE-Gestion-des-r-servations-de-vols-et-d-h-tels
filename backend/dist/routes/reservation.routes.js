"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reservation_controller_1 = require("../controllers/reservation.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Client routes
router.get('/my', auth_middleware_1.authenticate, reservation_controller_1.getMyReservations);
router.post('/flight', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('CLIENT'), reservation_controller_1.createFlightReservation);
router.delete('/flight/:id', auth_middleware_1.authenticate, reservation_controller_1.cancelFlightReservation);
router.post('/hotel', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('CLIENT'), reservation_controller_1.createHotelReservation);
router.delete('/hotel/:id', auth_middleware_1.authenticate, reservation_controller_1.cancelHotelReservation);
// Admin routes
router.get('/all', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN', 'HOTEL_MANAGER', 'FLIGHT_MANAGER'), reservation_controller_1.getAllReservations);
exports.default = router;
//# sourceMappingURL=reservation.routes.js.map