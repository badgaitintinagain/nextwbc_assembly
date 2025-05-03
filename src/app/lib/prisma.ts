import { PrismaClient } from '@prisma/client';

// Implementation for PrismaClient specific to serverless environments
// to solve the "prepared statement already exists" error

// Prevent multiple instances of Prisma Client in development
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  // In production (serverless), create a new instance with specific options
  prisma = new PrismaClient({
    // Add Prisma Client specific options for serverless
    log: ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
} else {
  // In development, use global object to store PrismaClient
  const globalForPrisma = global as unknown as { prisma: PrismaClient };
  
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    });
  }
  
  prisma = globalForPrisma.prisma;
}

export default prisma;
