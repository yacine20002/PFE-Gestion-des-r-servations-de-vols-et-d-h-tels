import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
export declare const getDashboardStats: (_req: AuthRequest, res: Response) => Promise<void>;
export declare const getMonthlyReservations: (_req: AuthRequest, res: Response) => Promise<void>;
export declare const getRevenueByHotel: (_req: AuthRequest, res: Response) => Promise<void>;
export declare const getRevenueByAirline: (_req: AuthRequest, res: Response) => Promise<void>;
export declare const getOccupancyRate: (_req: AuthRequest, res: Response) => Promise<void>;
export declare const getRecentActivity: (_req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=dashboard.controller.d.ts.map