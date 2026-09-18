Add-Type -AssemblyName System.Drawing
$bmp = [System.Drawing.Bitmap]::FromFile("C:\Users\HP\.gemini\antigravity\brain\2a400687-1c82-4d1c-a695-30d4fe924692\hassan_cutout_1788494815416.jpg")

# Test 10 points along the top border
for ($x = 0; $x -lt 80; $x += 8) {
    $p = $bmp.GetPixel($x, 0)
    Write-Output "x=$($x) : R=$($p.R) G=$($p.G) B=$($p.B)"
}
$bmp.Dispose()
