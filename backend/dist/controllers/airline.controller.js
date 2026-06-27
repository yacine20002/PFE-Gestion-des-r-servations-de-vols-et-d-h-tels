"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignManagerToAirline = exports.deleteAirline = exports.updateAirline = exports.createAirline = exports.getAirlineById = exports.getAirlines = void 0;
const prisma_1 = require("../lib/prisma");
const getId = (param) => Array.isArray(param) ? param[0] : param;
const getAirlines = async (_req, res) => {
    try {
        const airlines = await prisma_1.prisma.airlineCompany.findMany({
            include: { _count: { select: { flights: true } } },
            orderBy: { name: 'asc' },
        });
        res.json(airlines);
    }
    catch {
        res.status(500).json({ error: 'Failed to fetch airlines' });
    }
};
exports.getAirlines = getAirlines;
const getAirlineById = async (req, res) => {
    try {
        const id = getId(req.params.id);
        const airline = await prisma_1.prisma.airlineCompany.findUnique({
            where: { id },
            include: {
                flights: { orderBy: { departureTime: 'desc' }, take: 10 },
                _count: { select: { flights: true } },
            },
        });
        if (!airline) {
            res.status(404).json({ error: 'Airline not found' });
            return;
        }
        res.json(airline);
    }
    catch {
        res.status(500).json({ error: 'Failed to fetch airline' });
    }
};
exports.getAirlineById = getAirlineById;
const createAirline = async (req, res) => {
    try {
        const { name, country, iataCode, logoUrl } = req.body;
        const airline = await prisma_1.prisma.airlineCompany.create({
            data: { name, country, iataCode, logoUrl },
        });
        res.status(201).json(airline);
    }
    catch (err) {
        if (err.code === 'P2002') {
            res.status(409).json({ error: 'IATA code already exists' });
        }
        else {
            res.status(500).json({ error: 'Failed to create airline' });
        }
    }
};
exports.createAirline = createAirline;
const updateAirline = async (req, res) => {
    try {
        const id = getId(req.params.id);
        const { name, country, iataCode, logoUrl } = req.body;
        const airline = await prisma_1.prisma.airlineCompany.update({
            where: { id },
            data: { name, country, iataCode, logoUrl },
        });
        res.json(airline);
    }
    catch {
        res.status(500).json({ error: 'Failed to update airline' });
    }
};
exports.updateAirline = updateAirline;
const deleteAirline = async (req, res) => {
    try {
        const id = getId(req.params.id);
        await prisma_1.prisma.airlineCompany.delete({ where: { id } });
        res.json({ message: 'Airline deleted' });
    }
    catch {
        res.status(500).json({ error: 'Failed to delete airline' });
    }
};
exports.deleteAirline = deleteAirline;
const assignManagerToAirline = async (req, res) => {
    try {
        const id = getId(req.params.id);
        const { managerId } = req.body;
        const airline = await prisma_1.prisma.airlineCompany.update({
            where: { id },
            data: { managers: { connect: { id: managerId } } },
        });
        res.json(airline);
    }
    catch {
        res.status(500).json({ error: 'Failed to assign manager' });
    }
};
exports.assignManagerToAirline = assignManagerToAirline;
//# sourceMappingURL=airline.controller.js.map