import { PrismaClient } from '@prisma/client';

// For serverless environments - add special handling to avoid prepared statement conflicts
const createPrismaClient = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Log queries in development
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

// Add solution for PrismaClient in serverless environments
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
  prismaCreationCount: number;
};

// Track creation count to help debug multiple instance issues
if (!globalForPrisma.prismaCreationCount) {
  globalForPrisma.prismaCreationCount = 0;
}

// In production (serverless environment), always create a new client to avoid prepared statement conflicts
// In development, reuse the client to avoid reaching connection limits
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  // In production serverless environment, create a new client for each request
  prisma = createPrismaClient();
  globalForPrisma.prismaCreationCount++;
} else {
  // In development, reuse existing client
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
    globalForPrisma.prismaCreationCount++;
  }
  prisma = globalForPrisma.prisma;
}

export default prisma;