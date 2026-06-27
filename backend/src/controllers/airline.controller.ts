import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

const getId = (param: string | string[]): string => Array.isArray(param) ? param[0] : param;

export const getAirlines = async (_req: Request, res: Response): Promise<void> => {
  try {
    const airlines = await prisma.airlineCompany.findMany({
      include: { _count: { select: { flights: true } } },
      orderBy: { name: 'asc' },
    });
    res.json(airlines);
  } catch {
    res.status(500).json({ error: 'Failed to fetch airlines' });
  }
};

export const getAirlineById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = getId(req.params.id);
    const airline = await prisma.airlineCompany.findUnique({
      where: { id },
      include: {
        flights: { orderBy: { departureTime: 'desc' }, take: 10 },
        _count: { select: { flights: true } },
      },
    });
    if (!airline) { res.status(404).json({ error: 'Airline not found' }); return; }
    res.json(airline);
  } catch {
    res.status(500).json({ error: 'Failed to fetch airline' });
  }
};

export const createAirline = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, country, iataCode, logoUrl } = req.body;
    const airline = await prisma.airlineCompany.create({
      data: { name, country, iataCode, logoUrl },
    });
    res.status(201).json(airline);
  } catch (err: any) {
    if (err.code === 'P2002') {
      res.status(409).json({ error: 'IATA code already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create airline' });
    }
  }
};

export const updateAirline = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = getId(req.params.id);
    const { name, country, iataCode, logoUrl } = req.body;
    const airline = await prisma.airlineCompany.update({
      where: { id },
      data: { name, country, iataCode, logoUrl },
    });
    res.json(airline);
  } catch {
    res.status(500).json({ error: 'Failed to update airline' });
  }
};

export const deleteAirline = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = getId(req.params.id);
    await prisma.airlineCompany.delete({ where: { id } });
    res.json({ message: 'Airline deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete airline' });
  }
};

export const assignManagerToAirline = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = getId(req.params.id);
    const { managerId } = req.body;
    const airline = await prisma.airlineCompany.update({
      where: { id },
      data: { managers: { connect: { id: managerId } } },
    });
    res.json(airline);
  } catch {
    res.status(500).json({ error: 'Failed to assign manager' });
  }
};
