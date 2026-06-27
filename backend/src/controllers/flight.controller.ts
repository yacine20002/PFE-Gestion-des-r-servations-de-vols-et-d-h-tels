import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

const getId = (param: string | string[]): string => Array.isArray(param) ? param[0] : param;

export const getFlights = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      origin, destination, departureDate, passengers = '1',
      minPrice, maxPrice, airline, status, page = '1', limit = '20'
    } = req.query as Record<string, string>;

    const where: any = {};
    if (origin) where.origin = { contains: origin };
    if (destination) where.destination = { contains: destination };
    if (airline) where.airlineId = airline;
    if (status) where.status = status;
    if (departureDate) {
      const date = new Date(departureDate);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      where.departureTime = { gte: date, lt: nextDay };
    }
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }
    if (parseInt(passengers) > 0) {
      where.availableSeats = { gte: parseInt(passengers) };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [flights, total] = await Promise.all([
      prisma.flight.findMany({
        where,
        include: { airline: { select: { id: true, name: true, logoUrl: true, iataCode: true } } },
        orderBy: { departureTime: 'asc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.flight.count({ where }),
    ]);

    res.json({ data: flights, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch flights' });
  }
};

export const getFlightById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = getId(req.params.id);
    const flight = await prisma.flight.findUnique({
      where: { id },
      include: {
        airline: true,
        reviews: { include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } } },
      },
    });
    if (!flight) { res.status(404).json({ error: 'Flight not found' }); return; }
    res.json(flight);
  } catch {
    res.status(500).json({ error: 'Failed to fetch flight' });
  }
};

export const createFlight = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      flightNumber, origin, destination, departureTime, arrivalTime,
      price, totalSeats, airlineId
    } = req.body;

    // Check if manager owns the airline
    if (req.user?.role === 'FLIGHT_MANAGER') {
      const airline = await prisma.airlineCompany.findFirst({
        where: { id: airlineId, managers: { some: { id: req.user.id } } },
      });
      if (!airline) { res.status(403).json({ error: 'Not authorized for this airline' }); return; }
    }

    const parsedPrice = price !== undefined ? parseFloat(price) : 0;
    const parsedTotalSeats = totalSeats !== undefined ? parseInt(totalSeats, 10) : 0;

    const flight = await prisma.flight.create({
      data: {
        flightNumber, origin, destination,
        departureTime: new Date(departureTime),
        arrivalTime: new Date(arrivalTime),
        price: isNaN(parsedPrice) ? 0 : parsedPrice,
        totalSeats: isNaN(parsedTotalSeats) ? 0 : parsedTotalSeats,
        availableSeats: isNaN(parsedTotalSeats) ? 0 : parsedTotalSeats,
        airlineId,
      },
      include: { airline: true },
    });
    res.status(201).json(flight);
  } catch (err: any) {
    console.error('createFlight error:', err);
    if (err.code === 'P2002') {
      res.status(409).json({ error: 'Flight number already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create flight' });
    }
  }
};

export const updateFlight = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = getId(req.params.id);
    const flight = await prisma.flight.findUnique({ where: { id } });
    if (!flight) { res.status(404).json({ error: 'Flight not found' }); return; }

    if (req.user?.role === 'FLIGHT_MANAGER') {
      const airline = await prisma.airlineCompany.findFirst({
        where: { id: flight.airlineId, managers: { some: { id: req.user.id } } },
      });
      if (!airline) { res.status(403).json({ error: 'Not authorized' }); return; }
    }

    const { flightNumber, origin, destination, departureTime, arrivalTime, price, totalSeats, status } = req.body;
    
    const parsedTotalSeats = totalSeats !== undefined ? parseInt(totalSeats, 10) : undefined;
    let availableSeatsUpdate = undefined;
    if (parsedTotalSeats !== undefined && !isNaN(parsedTotalSeats) && parsedTotalSeats !== flight.totalSeats) {
      const diff = parsedTotalSeats - flight.totalSeats;
      availableSeatsUpdate = Math.max(0, flight.availableSeats + diff);
    }

    const updated = await prisma.flight.update({
      where: { id },
      data: {
        flightNumber, origin, destination,
        ...(departureTime && { departureTime: new Date(departureTime) }),
        ...(arrivalTime && { arrivalTime: new Date(arrivalTime) }),
        ...(price !== undefined && !isNaN(parseFloat(price)) && { price: parseFloat(price) }),
        ...(parsedTotalSeats !== undefined && !isNaN(parsedTotalSeats) && { totalSeats: parsedTotalSeats }),
        ...(availableSeatsUpdate !== undefined && { availableSeats: availableSeatsUpdate }),
        status,
      },
    });
    res.json(updated);
  } catch (err: any) {
    console.error('updateFlight error:', err);
    if (err.code === 'P2002') {
      res.status(409).json({ error: 'Flight number already exists' });
    } else {
      res.status(500).json({ error: 'Failed to update flight' });
    }
  }
};

export const deleteFlight = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = getId(req.params.id);
    await prisma.flight.delete({ where: { id } });
    res.json({ message: 'Flight deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete flight' });
  }
};
