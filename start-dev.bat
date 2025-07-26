@echo off
echo Starting NextWBC Development Server...
echo =====================================

cd /d "c:\Users\Admin\Desktop\nextwbc_struct\nextwbc_assembly"

echo.
echo Current directory: %CD%
echo.

echo Installing dependencies...
call npm install

echo.
echo Generating Prisma client...
call npx prisma generate

echo.
echo Starting development server...
call npm run dev

pause
