// API Configuration
export const API_CONFIG = {
  // Backend API URL - เปลี่ยนเป็น URL ของ backend ที่ deploy แล้ว
  BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000',
  
  // Production backend URL - ใส่ URL ของ Railway/Render/Heroku ที่ deploy แล้ว
  PRODUCTION_BACKEND_URL: process.env.NEXT_PUBLIC_PRODUCTION_BACKEND_URL || 'https://your-backend-url.railway.app',
  
  // Frontend URL
  FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://nextwbc.vercel.app',
};

// Helper function to get the appropriate backend URL
export const getBackendUrl = () => {
  // ถ้าเป็น production ให้ใช้ production URL
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return API_CONFIG.PRODUCTION_BACKEND_URL;
  }
  // ถ้าเป็น development ให้ใช้ localhost
  return API_CONFIG.BACKEND_URL;
};

// API endpoints
export const API_ENDPOINTS = {
  PREDICT: '/predict/',
  PREDICT_BATCH: '/predict-batch/',
  HEALTH: '/health',
}; 