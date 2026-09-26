$env:PATH = "C:\Program Files\nodejs;" + $env:PATH
Write-Host "Running Node version: $(node -v)"
npm run dev
