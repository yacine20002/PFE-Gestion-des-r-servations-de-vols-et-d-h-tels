"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const flight_controller_1 = require("../controllers/flight.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.get('/', flight_controller_1.getFlights);
router.get('/:id', flight_controller_1.getFlightById);
router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('FLIGHT_MANAGER', 'ADMIN'), flight_controller_1.createFlight);
router.put('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('FLIGHT_MANAGER', 'ADMIN'), flight_controller_1.updateFlight);
router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), flight_controller_1.deleteFlight);
exports.default = router;
//# sourceMappingURL=flight.routes.js.map