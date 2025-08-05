// Test configuration
import { getBackendUrl } from './src/lib/config';

console.log('Backend URL:', getBackendUrl());
console.log('Environment variables:');
console.log('NEXT_PUBLIC_SELF_HOST_IP:', process.env.NEXT_PUBLIC_SELF_HOST_IP);
console.log('NEXT_PUBLIC_SELF_HOST_PORT:', process.env.NEXT_PUBLIC_SELF_HOST_PORT);
console.log('NEXT_PUBLIC_USE_LOCALHOST_BACKEND:', process.env.NEXT_PUBLIC_USE_LOCALHOST_BACKEND);
