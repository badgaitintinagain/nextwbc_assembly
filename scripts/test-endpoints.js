// Test authentication endpoints
const testAuth = async () => {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🧪 Testing Authentication Endpoints');
  console.log('=====================================');
  
  // Test 1: Register new user
  console.log('\n1. Testing user registration...');
  try {
    const registerResponse = await fetch(`${baseUrl}/api/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'password123'
      }),
    });
    
    const registerData = await registerResponse.json();
    console.log('Register Response:', {
      status: registerResponse.status,
      data: registerData
    });
    
    if (registerResponse.status === 201) {
      console.log('✅ Registration successful');
    } else if (registerResponse.status === 400 && registerData.message.includes('already exists')) {
      console.log('ℹ️ User already exists, proceeding to login test');
    } else {
      console.log('❌ Registration failed');
    }
  } catch (error) {
    console.error('❌ Registration error:', error);
  }
  
  // Test 2: Sign in with NextAuth
  console.log('\n2. Testing user sign in...');
  try {
    const signInResponse = await fetch(`${baseUrl}/api/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'testuser@example.com',
        password: 'password123',
        callbackUrl: '/'
      }),
    });
    
    console.log('Sign in Response Status:', signInResponse.status);
    
  } catch (error) {
    console.error('❌ Sign in error:', error);
  }
  
  // Test 3: Test database connection
  console.log('\n3. Testing database connection...');
  try {
    const dbTestResponse = await fetch(`${baseUrl}/api/debug/db-test`);
    if (dbTestResponse.ok) {
      const dbData = await dbTestResponse.json();
      console.log('✅ Database connection:', dbData);
    } else {
      console.log('❌ Database connection failed');
    }
  } catch (error) {
    console.log('ℹ️ DB test endpoint not available (this is normal)');
  }
};

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  testAuth();
}

export default testAuth;
