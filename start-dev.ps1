Write-Host "Starting NextWBC Development Server..." -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

Set-Location "c:\Users\Admin\Desktop\nextwbc_struct\nextwbc_assembly"

Write-Host ""
Write-Host "Current directory: $(Get-Location)" -ForegroundColor Yellow
Write-Host ""

Write-Host "Installing dependencies..." -ForegroundColor Cyan
npm install

Write-Host ""
Write-Host "Generating Prisma client..." -ForegroundColor Cyan
npx prisma generate

Write-Host ""
Write-Host "Starting development server..." -ForegroundColor Cyan
npm run dev
