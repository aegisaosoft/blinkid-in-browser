# PowerShell script to generate self-signed certificate for development

$certsDir = Join-Path $PSScriptRoot "certs"

# Create certs directory if it doesn't exist
if (-not (Test-Path $certsDir)) {
    New-Item -ItemType Directory -Path $certsDir | Out-Null
}

Write-Host "Generating self-signed SSL certificate for development..." -ForegroundColor Green

# Create a self-signed certificate
$cert = New-SelfSignedCertificate `
    -DnsName "localhost", "192.168.1.147", "127.0.0.1" `
    -CertStoreLocation "cert:\CurrentUser\My" `
    -NotAfter (Get-Date).AddYears(1) `
    -KeyAlgorithm RSA `
    -KeyLength 2048 `
    -HashAlgorithm SHA256 `
    -KeyUsage DigitalSignature, KeyEncipherment `
    -TextExtension @("2.5.29.37={text}1.3.6.1.5.5.7.3.1") `
    -FriendlyName "BlinkID Development Certificate"

# Export certificate to PEM format
$certPath = Join-Path $certsDir "cert.pem"
$keyPath = Join-Path $certsDir "key.pem"
$pfxPath = Join-Path $certsDir "cert.pfx"
$password = ConvertTo-SecureString -String "dev" -Force -AsPlainText

# Export to PFX first
Export-PfxCertificate -Cert $cert -FilePath $pfxPath -Password $password | Out-Null

Write-Host ""
Write-Host "Certificate generated successfully!" -ForegroundColor Green
Write-Host "PFX file: $pfxPath" -ForegroundColor Cyan
Write-Host "Thumbprint: $($cert.Thumbprint)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Converting to PEM format..." -ForegroundColor Yellow
Write-Host "Note: For PEM conversion, you'll need OpenSSL or you can use the PFX directly." -ForegroundColor Yellow
Write-Host ""
Write-Host "If you have OpenSSL installed, run:" -ForegroundColor White
Write-Host "  openssl pkcs12 -in ui\certs\cert.pfx -nocerts -nodes -out ui\certs\key.pem -passin pass:dev" -ForegroundColor Gray
Write-Host "  openssl pkcs12 -in ui\certs\cert.pfx -clcerts -nokeys -out ui\certs\cert.pem -passin pass:dev" -ForegroundColor Gray
Write-Host ""

# Try to convert to PEM if OpenSSL is available
try {
    $opensslCheck = Get-Command openssl -ErrorAction Stop
    Write-Host "OpenSSL found, converting to PEM format..." -ForegroundColor Green
    
    # Convert to PEM
    & openssl pkcs12 -in $pfxPath -nocerts -nodes -out $keyPath -passin pass:dev 2>$null
    & openssl pkcs12 -in $pfxPath -clcerts -nokeys -out $certPath -passin pass:dev 2>$null
    
    if ((Test-Path $certPath) -and (Test-Path $keyPath)) {
        Write-Host "PEM files created successfully!" -ForegroundColor Green
        Write-Host "  Certificate: $certPath" -ForegroundColor Cyan
        Write-Host "  Private Key: $keyPath" -ForegroundColor Cyan
    }
}
catch {
    Write-Host "OpenSSL not found in PATH. You can:" -ForegroundColor Yellow
    Write-Host "  1. Install OpenSSL and run the commands above" -ForegroundColor White
    Write-Host "  2. Or use the PFX file directly if your dev server supports it" -ForegroundColor White
}

Write-Host ""
Write-Host "Certificate creation complete!" -ForegroundColor Green
