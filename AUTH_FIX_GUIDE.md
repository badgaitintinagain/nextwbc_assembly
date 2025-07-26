# การแก้ไขระบบ Authentication - NextWBC

## ปัญหาที่พบและการแก้ไข

### 1. ปัญหา NextAuth Configuration
- **ปัญหา**: Configuration ไม่ถูกต้อง, การใช้ PrismaAdapter ที่ไม่จำเป็น
- **แก้ไข**: ปรับปรุง authOptions ใน `src/app/api/auth/[...nextauth]/route.ts`

### 2. ปัญหา Prisma Client Import
- **ปัญหา**: Import path ไม่ถูกต้อง
- **แก้ไข**: เปลี่ยนจาก `@/app/lib/prisma` เป็น `@/lib/prisma`

### 3. ปัญหา Session Management
- **ปัญหา**: Session timeout สั้นเกินไป (15 นาที)
- **แก้ไข**: เพิ่มเป็น 24 ชั่วโมง

### 4. ปัญหา Error Handling
- **ปัญหา**: Error messages ไม่ชัดเจน
- **แก้ไข**: ปรับปรุง error handling ใน AuthModal และ register API

## การทดสอบระบบ

### 1. ทดสอบ Database Connection
```bash
node scripts/test-auth.js
```

### 2. ทดสอบ API Endpoints
```bash
node scripts/test-endpoints.js
```

### 3. เริ่มต้น Development Server
```bash
# Windows PowerShell
.\start-dev.ps1

# หรือ
npm run dev
```

### 4. ทดสอบ Authentication ผ่าน Browser
1. ไปที่ `http://localhost:3000/signup`
2. สร้างบัญชีใหม่
3. ลองเข้าสู่ระบบที่ `http://localhost:3000/signin`

## ไฟล์ที่ได้รับการแก้ไข

### Core Authentication Files
- `src/app/api/auth/[...nextauth]/route.ts` - NextAuth configuration
- `src/app/api/register/route.ts` - User registration API
- `src/components/AuthModal.tsx` - Authentication UI component
- `src/lib/prisma.ts` - Prisma client configuration

### Environment Configuration
- `.env.local` - Environment variables

### Debug & Testing
- `scripts/test-auth.js` - Database and auth testing
- `scripts/test-endpoints.js` - API endpoint testing
- `src/app/api/debug/db-test/route.ts` - Database connection test API

## การแก้ไขที่สำคัญ

### 1. NextAuth Configuration
```typescript
// เก่า - มีปัญหา
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma), // ไม่จำเป็นสำหรับ JWT
  session: {
    strategy: "jwt" as const,
    maxAge: 15 * 60, // สั้นเกินไป
  },
  // ...
};

// ใหม่ - ปรับปรุงแล้ว
export const authOptions: NextAuthOptions = {
  // ลบ adapter ออก
  session: {
    strategy: "jwt" as const,
    maxAge: 24 * 60 * 60, // 24 ชั่วโมง
  },
  secret: process.env.NEXTAUTH_SECRET,
  // ...
};
```

### 2. Improved Error Handling
```typescript
// เพิ่ม validation และ error messages ที่ชัดเจน
if (password.length < 6) {
  setError("Password must be at least 6 characters long.");
  return;
}
```

### 3. Better Session Management
```typescript
// Force hard refresh เพื่อให้ session โหลดถูกต้อง
if (result?.ok) {
  handleClose();
  window.location.href = "/";
}
```

## วิธีการใช้งาน

1. **เริ่มต้น Development Server**
   ```bash
   npm run dev
   ```

2. **ทดสอบการสมัครสมาชิก**
   - ไปที่ `/signup`
   - กรอกข้อมูล: ชื่อ, อีเมล, รหัสผ่าน
   - คลิก "Create account"

3. **ทดสอบการเข้าสู่ระบบ**
   - ไปที่ `/signin`
   - กรอกอีเมลและรหัสผ่าน
   - คลิก "Sign in"

4. **ตรวจสอบสถานะการเข้าสู่ระบบ**
   - หลังจากเข้าสู่ระบบสำเร็จ จะถูก redirect ไปหน้าแรก
   - ตรวจสอบ user menu ที่ header

## หมายเหตุ

- ตรวจสอบให้แน่ใจว่า database connection string ใน `.env.local` ถูกต้อง
- NEXTAUTH_SECRET ต้องเป็น string ที่ strong และ unique
- ในการ production ต้องเปลี่ยน NEXTAUTH_URL ให้ตรงกับ domain จริง
