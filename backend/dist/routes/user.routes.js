"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.get('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), user_controller_1.getAllUsers);
router.get('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), user_controller_1.getUserById);
router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), user_controller_1.createUser);
router.put('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), user_controller_1.updateUser);
router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), user_controller_1.deleteUser);
router.patch('/:id/toggle-block', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), user_controller_1.toggleBlockUser);
exports.default = router;
//# sourceMappingURL=user.routes.js.map