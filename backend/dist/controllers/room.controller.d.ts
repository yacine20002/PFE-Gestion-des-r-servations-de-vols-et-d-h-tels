import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
export declare const addRoom: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateRoom: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteRoom: (req: Request, res: Response) => Promise<void>;
export declare const getRoomsByHotel: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=room.controller.d.ts.map