"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const airline_controller_1 = require("../controllers/airline.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.get('/', airline_controller_1.getAirlines);
router.get('/:id', airline_controller_1.getAirlineById);
router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), airline_controller_1.createAirline);
router.put('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), airline_controller_1.updateAirline);
router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), airline_controller_1.deleteAirline);
router.post('/:id/assign-manager', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), airline_controller_1.assignManagerToAirline);
exports.default = router;
//# sourceMappingURL=airline.routes.js.map