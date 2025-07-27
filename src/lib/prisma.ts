import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create singleton instance with proper configuration
const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Add connection pooling and transaction settings to prevent prepared statement issues
    transactionOptions: {
      maxWait: 3000, // ลดลงเพื่อหลีกเลี่ยง timeout
      timeout: 5000, 
    },
  });
};

const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Helper function to handle Prisma queries with retry logic
export const handlePrismaQuery = async <T>(
  queryFn: () => Promise<T>,
  retries = 2 // ลดการ retry ลง
): Promise<T | null> => {
  for (let i = 0; i <= retries; i++) {
    try {
      return await queryFn();
    } catch (error: any) {
      // Check for PostgreSQL prepared statement errors
      const isPreparedStatementError = 
        error?.code === 'P2034' || 
        error?.message?.includes('prepared statement') ||
        error?.message?.includes('already exists') ||
        error?.message?.includes('does not exist') ||
        (error?.meta?.code === '42P05'); // PostgreSQL error code for prepared statement already exists
      
      if (isPreparedStatementError) {
        console.warn(`🔄 Prisma prepared statement error, attempt ${i + 1}/${retries + 1}:`, error.message);
        
        if (i === retries) {
          console.error('❌ Max retries reached for Prisma query:', error);
          // ลองสร้าง client ใหม่
          try {
            await prisma.$disconnect();
            // รอสักครู่ก่อนลองใหม่
            await new Promise(resolve => setTimeout(resolve, 1000));
          } catch (disconnectError) {
            console.warn('⚠️ Error during disconnect:', disconnectError);
          }
          return null;
        }
        
        // Progressive backoff: wait longer on each retry
        await new Promise(resolve => setTimeout(resolve, 200 * Math.pow(2, i)));
        continue;
      }
      
      // Re-throw non-prepared statement errors immediately
      throw error;
    }
  }
  return null;
};

// Helper function to check database connection health
export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection check failed:', error);
    return false;
  }
};

// Handle graceful shutdown
if (typeof window === 'undefined') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });

  process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

export default prisma;