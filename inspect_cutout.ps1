Add-Type -AssemblyName System.Drawing

$img = [System.Drawing.Bitmap]::FromFile("C:\Users\HP\.gemini\antigravity\brain\2a400687-1c82-4d1c-a695-30d4fe924692\hassan_cutout_1788494815416.jpg")

$bmp = [System.Drawing.Bitmap]::FromFile("C:\Users\HP\.gemini\antigravity\brain\2a400687-1c82-4d1c-a695-30d4fe924692\hassan_cutout_1788494815416.jpg")

Write-Output "--- Behind neck (tx=47..53, ty=16..24) ---"
for ($ty = 16; $ty -le 24; $ty++) {
    $str = "ty=$ty | "
    for ($tx = 47; $tx -le 53; $tx++) {
        $p = $bmp.GetPixel($tx * 16 + 8, $ty * 16 + 8)
        $diff = [Math]::Max([Math]::Abs($p.R - $p.G), [Math]::Max([Math]::Abs($p.G - $p.B), [Math]::Abs($p.R - $p.B)))
        $str += "[$tx: R=$($p.R) G=$($p.G) B=$($p.B) d=$diff] "
    }
    Write-Output $str
}

Write-Output "--- Arm gap (tx=33..38, ty=38..45) ---"
for ($ty = 38; $ty -le 45; $ty++) {
    $str = "ty=$ty | "
    for ($tx = 33; $tx -le 38; $tx++) {
        $p = $bmp.GetPixel($tx * 16 + 8, $ty * 16 + 8)
        $diff = [Math]::Max([Math]::Abs($p.R - $p.G), [Math]::Max([Math]::Abs($p.G - $p.B), [Math]::Abs($p.R - $p.B)))
        $str += "[$tx: R=$($p.R) G=$($p.G) B=$($p.B) d=$diff] "
    }
    Write-Output $str
}

$bmp.Dispose()

$img.Dispose()
