// ไฟล์ทดสอบการกำหนดค่า Backend URL
const dotenv = require('dotenv');

// โหลด environment variables
dotenv.config({ path: '.env.local' });

console.log('=== การตรวจสอบ Environment Variables ===');
console.log('NEXT_PUBLIC_SELF_HOST_IP:', process.env.NEXT_PUBLIC_SELF_HOST_IP);
console.log('NEXT_PUBLIC_SELF_HOST_PORT:', process.env.NEXT_PUBLIC_SELF_HOST_PORT);
console.log('NEXT_PUBLIC_USE_LOCALHOST_BACKEND:', process.env.NEXT_PUBLIC_USE_LOCALHOST_BACKEND);
console.log('NEXT_PUBLIC_BACKEND_URL:', process.env.NEXT_PUBLIC_BACKEND_URL);

// สร้าง URL ที่ควรใช้
const expectedUrl = `http://${process.env.NEXT_PUBLIC_SELF_HOST_IP || 'localhost'}:${process.env.NEXT_PUBLIC_SELF_HOST_PORT || '8000'}`;
console.log('\n=== Expected Backend URL ===');
console.log('Backend URL ที่ Frontend ควรใช้:', expectedUrl);

console.log('\n=== การทดสอบ ===');
console.log('1. ทดสอบจากเครื่องเดียวกัน:', expectedUrl + '/health');
console.log('2. ทดสอบจากเครื่องอื่น: http://172.20.10.3:3000');

// Test function simulation
const testConfig = () => {
  const SELF_HOST_IP = process.env.NEXT_PUBLIC_SELF_HOST_IP || 'localhost';
  const SELF_HOST_PORT = process.env.NEXT_PUBLIC_SELF_HOST_PORT || '8000';
  const USE_LOCALHOST_BACKEND = process.env.NEXT_PUBLIC_USE_LOCALHOST_BACKEND === 'true';
  
  if (USE_LOCALHOST_BACKEND) {
    return `http://${SELF_HOST_IP}:${SELF_HOST_PORT}`;
  }
  
  return 'http://localhost:8000';
};

console.log('\n=== Function Result ===');
console.log('getBackendUrl() จะ return:', testConfig());
