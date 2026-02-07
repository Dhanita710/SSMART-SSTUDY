$body = @{
    email = "dhanita@example.com"
    username = "dhanita"
    password = "SecurePass123"
    full_name = "Dhanita Srivastava"
} | ConvertTo-Json

Write-Host "Testing signup with valid password (13 characters)..." -ForegroundColor Cyan
Write-Host "Request body:" -ForegroundColor Yellow
Write-Host $body

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/auth/signup" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -UseBasicParsing

    Write-Host "`nSuccess! Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Yellow
    Write-Host $response.Content
} catch {
    Write-Host "`nError occurred:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response body:" -ForegroundColor Yellow
        Write-Host $responseBody
    }
}
