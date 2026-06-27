import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
export declare const getFlights: (req: Request, res: Response) => Promise<void>;
export declare const getFlightById: (req: Request, res: Response) => Promise<void>;
export declare const createFlight: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateFlight: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteFlight: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=flight.controller.d.ts.map