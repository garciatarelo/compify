# Test Laravel API
Write-Host "Testing Laravel API at http://127.0.0.1:8000/api/test" -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/test" -UseBasicParsing -TimeoutSec 10
    Write-Host "✓ API is responding!" -ForegroundColor Green
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Yellow
    Write-Host "Response: $($response.Content)" -ForegroundColor White
    
    Write-Host "`nTesting laptops endpoint..." -ForegroundColor Cyan
    $laptopsResponse = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/laptops" -UseBasicParsing -TimeoutSec 10
    $data = $laptopsResponse.Content | ConvertFrom-Json
    Write-Host "✓ Laptops endpoint is working!" -ForegroundColor Green
    Write-Host "Total laptops found: $($data.data.Count)" -ForegroundColor Yellow
    
    if ($data.data.Count -gt 0) {
        Write-Host "`nFirst laptop:" -ForegroundColor Cyan
        $data.data[0] | ConvertTo-Json
    }
} catch {
    Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Make sure the Laravel server is running (php artisan serve)" -ForegroundColor Yellow
}
