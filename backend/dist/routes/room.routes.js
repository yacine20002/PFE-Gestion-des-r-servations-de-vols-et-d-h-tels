"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const room_controller_1 = require("../controllers/room.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.get('/hotel/:hotelId', room_controller_1.getRoomsByHotel);
router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('HOTEL_MANAGER', 'ADMIN'), room_controller_1.addRoom);
router.put('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('HOTEL_MANAGER', 'ADMIN'), room_controller_1.updateRoom);
router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('HOTEL_MANAGER', 'ADMIN'), room_controller_1.deleteRoom);
exports.default = router;
//# sourceMappingURL=room.routes.js.map