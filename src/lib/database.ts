import { PrismaClient } from '@prisma/client'

// Database connection utility
class DatabaseManager {
  private static instance: DatabaseManager
  private prisma: PrismaClient | null = null
  private connectionAttempts = 0
  private maxRetries = 3

  private constructor() {}

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager()
    }
    return DatabaseManager.instance
  }

  async getClient(): Promise<PrismaClient> {
    if (this.prisma) {
      return this.prisma
    }

    return this.createConnection()
  }

  private async createConnection(): Promise<PrismaClient> {
    try {
      const client = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
        datasources: {
          db: {
            url: process.env.DATABASE_URL,
          },
        },
        transactionOptions: {
          maxWait: 5000,
          timeout: 10000,
        },
      })

      // Test connection
      await client.$connect()
      console.log('Database connected successfully')
      
      this.prisma = client
      this.connectionAttempts = 0
      
      return client
    } catch (error) {
      this.connectionAttempts++
      console.error(`Database connection attempt ${this.connectionAttempts} failed:`, error)
      
      if (this.connectionAttempts < this.maxRetries) {
        console.log(`Retrying connection in 2 seconds... (${this.connectionAttempts}/${this.maxRetries})`)
        await new Promise(resolve => setTimeout(resolve, 2000))
        return this.createConnection()
      }
      
      throw new Error(`Failed to connect to database after ${this.maxRetries} attempts`)
    }
  }

  async disconnect(): Promise<void> {
    if (this.prisma) {
      await this.prisma.$disconnect()
      this.prisma = null
      console.log('Database disconnected')
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      if (!this.prisma) {
        return false
      }
      
      await this.prisma.$queryRaw`SELECT 1`
      return true
    } catch (error) {
      console.error('Database health check failed:', error)
      return false
    }
  }

  async reconnect(): Promise<PrismaClient> {
    await this.disconnect()
    return this.createConnection()
  }
}

export const dbManager = DatabaseManager.getInstance()

// Function to get prisma client
export const getPrismaClient = async (): Promise<PrismaClient> => {
  return dbManager.getClient()
}

// Export singleton prisma instance for backward compatibility
let _prisma: PrismaClient | null = null

export const prisma = {
  get client() {
    if (!_prisma) {
      throw new Error('Prisma client not initialized. Call initializePrisma() first.')
    }
    return _prisma
  }
}

export const initializePrisma = async (): Promise<PrismaClient> => {
  if (!_prisma) {
    _prisma = await dbManager.getClient()
  }
  return _prisma
}

// Initialize immediately
initializePrisma().catch(console.error)
