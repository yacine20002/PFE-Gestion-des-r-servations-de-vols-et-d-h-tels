import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
export declare const getMyReservations: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createFlightReservation: (req: AuthRequest, res: Response) => Promise<void>;
export declare const cancelFlightReservation: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createHotelReservation: (req: AuthRequest, res: Response) => Promise<void>;
export declare const cancelHotelReservation: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getAllReservations: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=reservation.controller.d.ts.map