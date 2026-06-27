"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const review_controller_1 = require("../controllers/review.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.get('/flight/:flightId', review_controller_1.getFlightReviews);
router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('CLIENT'), review_controller_1.createReview);
router.delete('/:id', auth_middleware_1.authenticate, review_controller_1.deleteReview);
exports.default = router;
//# sourceMappingURL=review.routes.js.map