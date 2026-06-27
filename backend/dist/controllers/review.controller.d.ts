import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
export declare const createReview: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getFlightReviews: (req: Request, res: Response) => Promise<void>;
export declare const deleteReview: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=review.controller.d.ts.map