@echo off
echo Checking your computer's IP addresses...
echo.

echo === IPv4 Addresses ===
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do echo %%a

echo.
echo === Network Interface Details ===
ipconfig | findstr /i "IPv4 Address"

echo.
echo === All Network Adapters ===
ipconfig /all | findstr /i "IPv4 Address"

echo.
echo Copy one of the IPv4 addresses above (usually starts with 192.168.x.x or 10.x.x.x)
echo and use it in your .env.local file as NEXT_PUBLIC_SELF_HOST_IP
echo.
pause
