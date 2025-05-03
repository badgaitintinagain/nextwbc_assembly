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
  // In production, add a unique ID to avoid prepared statement conflicts
  const uniqueId = process.env.NODE_ENV === 'production' ? generateId() : '';
  
  return new PrismaClient({
    // Add Prisma Client specific options for serverless
    log: ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Use the unique ID to avoid prepared statement conflicts
    __internal: {
      hooks: {
        beforeQueryExecution: (params: any) => {
          // In production, make each statement name unique to avoid conflicts
          if (process.env.NODE_ENV === 'production' && params.queryText) {
            params.queryText = params.queryText.replace(/\$(\d+)/g, `$\${uniqueId}$1`);
          }
          return params;
        }
      }
    }
  });
};

// In development, use global object to store PrismaClient for hot reloading
// In production, always create a new instance with a unique identifier
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create a new instance in production to avoid prepared statement conflicts
const prisma = process.env.NODE_ENV === 'production' 
  ? prismaClientSingleton() 
  : (globalForPrisma.prisma ?? prismaClientSingleton());

// In development, keep the client reference for hot module reloading
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;