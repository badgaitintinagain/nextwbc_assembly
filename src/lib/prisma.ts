import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Force using DATABASE_URL environment variable for connection
const prismaClientOptions = {
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Add options to prevent the "prepared statement already exists" error
  log: ['error', 'warn'],
};

// Check if prisma client already exists to prevent duplicate connections
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  // In production, create a new instance each time
  prisma = new PrismaClient(prismaClientOptions);
} else {
  // In development, reuse the instance if it exists
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient(prismaClientOptions);
  }
  prisma = globalForPrisma.prisma;
}

export default prisma;