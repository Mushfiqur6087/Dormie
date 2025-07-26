# PowerShell script to fix mess manager API calls
Write-Host "Fixing mess manager API calls..." -ForegroundColor Green

# Get all JavaScript files in mess-manager directories
$files = Get-ChildItem -Path "Dormie-Frontend\app\**\mess-manager\**\*.js" -Recurse

foreach ($file in $files) {
    Write-Host "Processing: $($file.FullName)" -ForegroundColor Yellow
    
    # Read the file content
    $content = Get-Content $file.FullName -Raw
    
    # Check if the file needs fixing
    $needsImport = $content -match "fetch\('/api" -and $content -notmatch "createApiUrl"
    $needsTokenFix = $content -match "localStorage\.getItem\('token'\)"
    
    if ($needsImport -or $needsTokenFix) {
        Write-Host "  - Fixing $($file.Name)" -ForegroundColor Cyan
        
        # Add import for createApiUrl if needed and not already present
        if ($needsImport -and $content -notmatch "createApiUrl") {
            # Determine the correct relative path for the import
            $depth = ($file.DirectoryName -split "\\").Count - ($file.DirectoryName -split "app")[0].Split("\\").Count
            $importPath = "../" * ($depth - 1) + "lib/api"
            
            # Add the import after the last existing import
            $importStatement = "import { createApiUrl } from '$importPath'"
            
            if ($content -match "import.*from.*\n") {
                $lastImportIndex = [regex]::Matches($content, "import.*from.*\n").Index | Select-Object -Last 1
                $lastImportEnd = [regex]::Matches($content, "import.*from.*\n")[0].Index + [regex]::Matches($content, "import.*from.*\n")[0].Length
                $content = $content.Insert($lastImportEnd, $importStatement + "`n")
            }
        }
        
        # Fix token references
        if ($needsTokenFix) {
            $content = $content -replace "localStorage\.getItem\('token'\)", "localStorage.getItem('jwtToken')"
        }
        
        # Fix relative API calls
        $content = $content -replace "fetch\('/api/([^']+)'\)", "fetch(createApiUrl('/api/`$1'))"
        $content = $content -replace "fetch\(`/api/([^`]+)`\)", "fetch(createApiUrl(`/api/`$1`))"
        
        # Write the fixed content back
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "  - Fixed $($file.Name)" -ForegroundColor Green
    } else {
        Write-Host "  - No changes needed for $($file.Name)" -ForegroundColor Gray
    }
}

Write-Host "Done fixing mess manager API calls!" -ForegroundColor Green
