import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@flighthotel.com' },
    update: {},
    create: {
      email: 'admin@flighthotel.com',
      passwordHash: adminPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'ADMIN',
      phone: '+213600000000',
    },
  });

  // Flight Manager
  const fmPassword = await bcrypt.hash('manager123', 12);
  const flightManager = await prisma.user.upsert({
    where: { email: 'flight.manager@flighthotel.com' },
    update: {},
    create: {
      email: 'flight.manager@flighthotel.com',
      passwordHash: fmPassword,
      firstName: 'Ahmed',
      lastName: 'Ben Ali',
      role: 'FLIGHT_MANAGER',
    },
  });

  // Hotel Manager
  const hmPassword = await bcrypt.hash('manager123', 12);
  const hotelManager = await prisma.user.upsert({
    where: { email: 'hotel.manager@flighthotel.com' },
    update: {},
    create: {
      email: 'hotel.manager@flighthotel.com',
      passwordHash: hmPassword,
      firstName: 'Fatima',
      lastName: 'Zahra',
      role: 'HOTEL_MANAGER',
    },
  });

  // Test client
  const clientPassword = await bcrypt.hash('client123', 12);
  const client = await prisma.user.upsert({
    where: { email: 'client@flighthotel.com' },
    update: {},
    create: {
      email: 'client@flighthotel.com',
      passwordHash: clientPassword,
      firstName: 'Mohamed',
      lastName: 'Amine',
      role: 'CLIENT',
      phone: '+213699999999',
    },
  });

  // Airlines
  const airAlgerie = await prisma.airlineCompany.upsert({
    where: { iataCode: 'AH' },
    update: {},
    create: {
      name: 'Air Algérie',
      country: 'Algeria',
      iataCode: 'AH',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/96/Air_Alg%C3%A9rie.svg/200px-Air_Alg%C3%A9rie.svg.png',
      managers: { connect: { id: flightManager.id } },
    },
  });

  const airFrance = await prisma.airlineCompany.upsert({
    where: { iataCode: 'AF' },
    update: {},
    create: {
      name: 'Air France',
      country: 'France',
      iataCode: 'AF',
      logoUrl: 'https://logodownload.org/wp-content/uploads/2022/07/air-france-logo-1.png',
    },
  });

  const turkish = await prisma.airlineCompany.upsert({
    where: { iataCode: 'TK' },
    update: {},
    create: {
      name: 'Turkish Airlines',
      country: 'Turkey',
      iataCode: 'TK',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Turkish_Airlines_logo_2019_compact.svg/200px-Turkish_Airlines_logo_2019_compact.svg.png',
    },
  });

  // Flights
  const now = new Date();
  const flights = await Promise.all([
    prisma.flight.upsert({
      where: { flightNumber: 'AH1001' },
      update: {},
      create: {
        flightNumber: 'AH1001',
        origin: 'Algiers (ALG)',
        destination: 'Paris (CDG)',
        departureTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        arrivalTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 3.5 * 60 * 60 * 1000),
        price: 280,
        totalSeats: 180,
        availableSeats: 142,
        airlineId: airAlgerie.id,
      },
    }),
    prisma.flight.upsert({
      where: { flightNumber: 'AH1002' },
      update: {},
      create: {
        flightNumber: 'AH1002',
        origin: 'Algiers (ALG)',
        destination: 'Istanbul (IST)',
        departureTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        arrivalTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
        price: 350,
        totalSeats: 200,
        availableSeats: 87,
        airlineId: airAlgerie.id,
      },
    }),
    prisma.flight.upsert({
      where: { flightNumber: 'AF403' },
      update: {},
      create: {
        flightNumber: 'AF403',
        origin: 'Paris (CDG)',
        destination: 'Dubai (DXB)',
        departureTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        arrivalTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 7 * 60 * 60 * 1000),
        price: 620,
        totalSeats: 320,
        availableSeats: 211,
        airlineId: airFrance.id,
      },
    }),
    prisma.flight.upsert({
      where: { flightNumber: 'TK715' },
      update: {},
      create: {
        flightNumber: 'TK715',
        origin: 'Istanbul (IST)',
        destination: 'New York (JFK)',
        departureTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        arrivalTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 + 11 * 60 * 60 * 1000),
        price: 890,
        totalSeats: 350,
        availableSeats: 130,
        airlineId: turkish.id,
      },
    }),
  ]);

  // Hotels
  const hotel1 = await prisma.hotel.upsert({
    where: { id: 'hotel-001' },
    update: {},
    create: {
      id: 'hotel-001',
      name: 'El Aurassi Hotel',
      city: 'Algiers',
      address: 'Telemly, Algiers, Algeria',
      stars: 5,
      description: 'The prestigious 5-star hotel overlooking the Bay of Algiers.',
      imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
      amenities: JSON.stringify(['WiFi', 'Pool', 'Spa', 'Restaurant', 'Gym', 'Bar', 'Concierge']),
      managerId: hotelManager.id,
    },
  });

  const hotel2 = await prisma.hotel.upsert({
    where: { id: 'hotel-002' },
    update: {},
    create: {
      id: 'hotel-002',
      name: 'Sheraton Club des Pins',
      city: 'Algiers',
      address: 'Club des Pins, Staoueli, Algiers',
      stars: 5,
      description: 'Luxury beachfront resort with world-class amenities.',
      imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
      amenities: JSON.stringify(['Beach Access', 'WiFi', 'Pool', 'Tennis', 'Spa', 'Restaurant']),
      managerId: hotelManager.id,
    },
  });

  const hotel3 = await prisma.hotel.upsert({
    where: { id: 'hotel-003' },
    update: {},
    create: {
      id: 'hotel-003',
      name: 'Hilton Paris Opera',
      city: 'Paris',
      address: '108 Rue Saint-Lazare, Paris, France',
      stars: 4,
      description: 'Elegant hotel in the heart of Paris near the Opera.',
      imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
      amenities: JSON.stringify(['WiFi', 'Restaurant', 'Bar', 'Fitness Center', 'Concierge']),
    },
  });

  // Rooms for hotel1
  await Promise.all([
    prisma.room.upsert({ where: { id: 'room-001' }, update: {}, create: { id: 'room-001', hotelId: hotel1.id, roomNumber: '101', type: 'SINGLE', pricePerNight: 120, capacity: 1 } }),
    prisma.room.upsert({ where: { id: 'room-002' }, update: {}, create: { id: 'room-002', hotelId: hotel1.id, roomNumber: '201', type: 'DOUBLE', pricePerNight: 200, capacity: 2 } }),
    prisma.room.upsert({ where: { id: 'room-003' }, update: {}, create: { id: 'room-003', hotelId: hotel1.id, roomNumber: '301', type: 'SUITE', pricePerNight: 450, capacity: 3 } }),
    prisma.room.upsert({ where: { id: 'room-004' }, update: {}, create: { id: 'room-004', hotelId: hotel1.id, roomNumber: '401', type: 'DELUXE', pricePerNight: 600, capacity: 2 } }),
    // hotel2
    prisma.room.upsert({ where: { id: 'room-005' }, update: {}, create: { id: 'room-005', hotelId: hotel2.id, roomNumber: '101', type: 'DOUBLE', pricePerNight: 180, capacity: 2 } }),
    prisma.room.upsert({ where: { id: 'room-006' }, update: {}, create: { id: 'room-006', hotelId: hotel2.id, roomNumber: '201', type: 'SUITE', pricePerNight: 380, capacity: 4 } }),
    prisma.room.upsert({ where: { id: 'room-007' }, update: {}, create: { id: 'room-007', hotelId: hotel2.id, roomNumber: '301', type: 'FAMILY', pricePerNight: 290, capacity: 5 } }),
    // hotel3
    prisma.room.upsert({ where: { id: 'room-008' }, update: {}, create: { id: 'room-008', hotelId: hotel3.id, roomNumber: '101', type: 'SINGLE', pricePerNight: 160, capacity: 1 } }),
    prisma.room.upsert({ where: { id: 'room-009' }, update: {}, create: { id: 'room-009', hotelId: hotel3.id, roomNumber: '201', type: 'DOUBLE', pricePerNight: 250, capacity: 2 } }),
  ]);

  console.log('✅ Database seeded successfully!');
  console.log('\n📋 Test Accounts:');
  console.log('  Admin:          admin@flighthotel.com / admin123');
  console.log('  Flight Manager: flight.manager@flighthotel.com / manager123');
  console.log('  Hotel Manager:  hotel.manager@flighthotel.com / manager123');
  console.log('  Client:         client@flighthotel.com / client123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
