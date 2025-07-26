const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function testAuth() {
  try {
    console.log('Testing database connection...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Test finding a user
    const users = await prisma.user.findMany({
      take: 5,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });
    
    console.log('✅ Users found:', users.length);
    if (users.length > 0) {
      console.log('First user:', users[0]);
    }
    
    // Test creating a test user (if doesn't exist)
    const testEmail = 'test@example.com';
    let testUser = await prisma.user.findUnique({
      where: { email: testEmail }
    });
    
    if (!testUser) {
      console.log('Creating test user...');
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      testUser = await prisma.user.create({
        data: {
          name: 'Test User',
          email: testEmail,
          password: hashedPassword,
          role: 'USER'
        }
      });
      console.log('✅ Test user created:', testUser.email);
    } else {
      console.log('✅ Test user already exists:', testUser.email);
    }
    
    // Test password verification
    const isPasswordValid = await bcrypt.compare('password123', testUser.password);
    console.log('✅ Password verification:', isPasswordValid);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
    console.log('Database disconnected');
  }
}

testAuth();
