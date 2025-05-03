import { PrismaClient } from '@prisma/client';

/**
 * PrismaClient initialization optimized for serverless environments
 * This addresses the "prepared statement already exists" error in Vercel
 */

// Different behavior for production (serverless) vs development
const prismaClientSingleton = () => {
  return new PrismaClient({
    // Add Prisma Client specific options for serverless
    log: ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
};

// For global singleton in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prisma: PrismaClient;

// In production (serverless), create a new client for each request
// In development, reuse the existing client
if (process.env.NODE_ENV === 'production') {
  // In production, always create a new client to avoid prepared statement conflicts
  prisma = prismaClientSingleton();
} else {
  // In development, reuse the client
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = prismaClientSingleton();
  }
  prisma = globalForPrisma.prisma;
}

export default prisma;
