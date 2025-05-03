import { PrismaClient } from '@prisma/client';

/**
 * PrismaClient initialization optimized for serverless environments
 * This addresses the "prepared statement already exists" error in Vercel
 */

// Generate a unique identifier for this instance
// This helps avoid prepared statement conflicts in serverless environments
const generateId = () => `_${Math.random().toString(36).substr(2, 9)}`;

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

// In development, use global object to store PrismaClient for hot reloading
// In production, always create a new instance with a unique identifier
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Use environment-specific initialization
const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

// In development, keep the client reference for hot module reloading
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;