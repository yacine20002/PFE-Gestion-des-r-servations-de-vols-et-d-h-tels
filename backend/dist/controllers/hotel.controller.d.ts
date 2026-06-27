import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
export declare const getHotels: (req: Request, res: Response) => Promise<void>;
export declare const getHotelById: (req: Request, res: Response) => Promise<void>;
export declare const createHotel: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateHotel: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteHotel: (req: Request, res: Response) => Promise<void>;
export declare const getMyHotels: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=hotel.controller.d.ts.map