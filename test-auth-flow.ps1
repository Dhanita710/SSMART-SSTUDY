Write-Host "Testing complete signup and login flow..." -ForegroundColor Cyan

# Step 1: Signup
Write-Host "`n1. Testing Signup..." -ForegroundColor Yellow
$signupBody = @{
    email = "test2@example.com"
    username = "testuser2"
    password = "TestPass123"
    full_name = "Test User 2"
} | ConvertTo-Json

try {
    $signupResponse = Invoke-WebRequest -Uri "http://localhost:8000/api/auth/signup" `
        -Method POST `
        -ContentType "application/json" `
        -Body $signupBody `
        -UseBasicParsing
    
    Write-Host "✅ Signup successful!" -ForegroundColor Green
    Write-Host "Response: $($signupResponse.Content)" -ForegroundColor White
} catch {
    Write-Host "❌ Signup failed: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# Step 2: Login
Write-Host "`n2. Testing Login..." -ForegroundColor Yellow
$loginBody = @{
    email = "test2@example.com"
    password = "TestPass123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest -Uri "http://localhost:8000/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody `
        -UseBasicParsing
    
    Write-Host "✅ Login successful!" -ForegroundColor Green
    $loginData = $loginResponse.Content | ConvertFrom-Json
    $accessToken = $loginData.access_token
    Write-Host "Access Token: $($accessToken.Substring(0, 20))..." -ForegroundColor White
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# Step 3: Get User Profile
Write-Host "`n3. Testing /api/users/me..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $accessToken"
    }
    
    $meResponse = Invoke-WebRequest -Uri "http://localhost:8000/api/users/me" `
        -Method GET `
        -Headers $headers `
        -UseBasicParsing
    
    Write-Host "✅ User profile retrieved!" -ForegroundColor Green
    Write-Host "Response: $($meResponse.Content)" -ForegroundColor White
} catch {
    Write-Host "❌ Failed to get user profile: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Error details: $responseBody" -ForegroundColor Red
    }
}

Write-Host "`n✅ All tests completed!" -ForegroundColor Green
