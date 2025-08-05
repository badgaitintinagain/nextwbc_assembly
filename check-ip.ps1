# PowerShell script to check IP addresses
Write-Host "Checking your computer's IP addresses..." -ForegroundColor Green
Write-Host ""

Write-Host "=== IPv4 Addresses ===" -ForegroundColor Yellow
Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*" } | Select-Object IPAddress, InterfaceAlias | Format-Table -AutoSize

Write-Host "=== Recommended IP for self-hosting ===" -ForegroundColor Cyan
$mainIP = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { 
    $_.IPAddress -like "192.168.*" -or 
    $_.IPAddress -like "10.*" -or 
    $_.IPAddress -like "172.16.*" -or 
    $_.IPAddress -like "172.17.*" -or 
    $_.IPAddress -like "172.18.*" -or 
    $_.IPAddress -like "172.19.*" -or 
    $_.IPAddress -like "172.20.*" -or 
    $_.IPAddress -like "172.21.*" -or 
    $_.IPAddress -like "172.22.*" -or 
    $_.IPAddress -like "172.23.*" -or 
    $_.IPAddress -like "172.24.*" -or 
    $_.IPAddress -like "172.25.*" -or 
    $_.IPAddress -like "172.26.*" -or 
    $_.IPAddress -like "172.27.*" -or 
    $_.IPAddress -like "172.28.*" -or 
    $_.IPAddress -like "172.29.*" -or 
    $_.IPAddress -like "172.30.*" -or 
    $_.IPAddress -like "172.31.*"
} | Select-Object -First 1
if ($mainIP) {
    Write-Host "Use this IP: $($mainIP.IPAddress)" -ForegroundColor Green
    Write-Host "Update .env.local with: NEXT_PUBLIC_SELF_HOST_IP=$($mainIP.IPAddress)" -ForegroundColor Green
} else {
    Write-Host "No suitable private IP found. Check your network connection." -ForegroundColor Red
}

Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
