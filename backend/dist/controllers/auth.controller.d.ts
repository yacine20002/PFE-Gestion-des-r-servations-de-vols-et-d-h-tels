import { Request, Response } from 'express';
export declare const register: (req: Request, res: Response) => Promise<void>;
export declare const login: (req: Request, res: Response) => Promise<void>;
export declare const forgotPassword: (req: Request, res: Response) => Promise<void>;
export declare const resetPassword: (req: Request, res: Response) => Promise<void>;
export declare const getMe: (req: any, res: Response) => Promise<void>;
export declare const updateProfile: (req: any, res: Response) => Promise<void>;
export declare const changePassword: (req: any, res: Response) => Promise<void>;
//# sourceMappingURL=auth.controller.d.ts.map