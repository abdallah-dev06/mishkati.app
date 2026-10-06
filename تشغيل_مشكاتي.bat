@echo off
chcp 65001 >nul
title مشكاتي - خادم التشغيل المحلي
echo.
echo ========================================================
echo        تشغيل تطبيق مِشكاتي عبر خادم محلي آمن
echo ========================================================
echo.
echo جاري فحص بيئة التشغيل وفتح المتصفح...
echo.

where python >nul 2>nul
if %errorlevel% equ 0 (
    echo [OK] تم العثور على Python، جاري تشغيل الخادم على المنفذ 8000...
    start http://localhost:8000
    python -m http.server 8000
    goto end
)

where npx >nul 2>nul
if %errorlevel% equ 0 (
    echo [OK] تم العثور على Node.js، جاري تشغيل الخادم...
    start http://localhost:8000
    npx serve . -l 8000
    goto end
)

echo [OK] جاري التشغيل عبر ميزات Windows PowerShell المدمجة...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$port = 8000; Start-Process 'http://localhost:8000'; $listener = New-Object System.Net.HttpListener; $listener.Prefixes.Add('http://localhost:' + $port + '/'); $listener.Start(); Write-Host 'الخادم يعمل بنجاح على: http://localhost:8000'; while ($listener.IsListening) { $context = $listener.GetContext(); $request = $context.Request; $response = $context.Response; $localPath = $request.Url.LocalPath.TrimStart('/'); if ([string]::IsNullOrEmpty($localPath) -or $localPath -eq '/') { $localPath = 'index.html' }; $fullPath = Join-Path (Get-Location) $localPath; if (Test-Path $fullPath -PathType Leaf) { $bytes = [System.IO.File]::ReadAllBytes($fullPath); $ext = [System.IO.Path]::GetExtension($fullPath); switch ($ext) { '.html' { $response.ContentType = 'text/html; charset=utf-8' } '.js' { $response.ContentType = 'application/javascript' } '.css' { $response.ContentType = 'text/css' } '.json' { $response.ContentType = 'application/json' } default { $response.ContentType = 'application/octet-stream' } }; $response.ContentLength64 = $bytes.Length; $response.OutputStream.Write($bytes, 0, $bytes.Length) } else { $response.StatusCode = 404 }; $response.OutputStream.Close() }"

:end
pause
