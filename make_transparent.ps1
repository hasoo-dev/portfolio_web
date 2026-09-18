Add-Type -AssemblyName System.Drawing

$src = "C:\Users\HP\.gemini\antigravity\brain\2a400687-1c82-4d1c-a695-30d4fe924692\hassan_cutout_1788494815416.jpg"
$dest = "d:\projects\hassan_portfolio\assets\images\hassan-hero-cutout.png"

$bmp = [System.Drawing.Bitmap]::FromFile($src)
$width = $bmp.Width
$height = $bmp.Height

# Create a 32-bit ARGB bitmap
$result = New-Object System.Drawing.Bitmap($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

# Lock bits for high speed performance
$rect = New-Object System.Drawing.Rectangle(0, 0, $width, $height)
$srcData = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$dstData = $result.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::WriteOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

$byteCount = $srcData.Stride * $height
$srcBytes = New-Object byte[] $byteCount
$dstBytes = New-Object byte[] $byteCount

[System.Runtime.InteropServices.Marshal]::Copy($srcData.Scan0, $srcBytes, 0, $byteCount)

# Initialize dstBytes with srcBytes
[Array]::Copy($srcBytes, $dstBytes, $byteCount)

# BFS Queue to flood fill from border pixels
$visited = New-Object bool[] ($width * $height)
$queue = New-Object System.Collections.Generic.Queue[int]

function IsChecker($r, $g, $b) {
    # Checkerboard is neutral gray (around 195) or white (around 255)
    # High brightness and very low color saturation
    $diffRG = [Math]::Abs($r - $g)
    $diffGB = [Math]::Abs($g - $b)
    $diffRB = [Math]::Abs($r - $b)
    $maxDiff = [Math]::Max($diffRG, [Math]::Max($diffGB, $diffRB))
    
    if ($r -gt 165 -and $g -gt 165 -and $b -gt 165 -and $maxDiff -le 14) {
        return $true
    }
    # Also near-white edge blend
    if ($r -gt 240 -and $g -gt 240 -and $b -gt 240) {
        return $true
    }
    return $false
}

# Seed borders: top edge, left edge, right edge (top half)
for ($x = 0; $x -lt $width; $x++) {
    $idx = $x
    $queue.Enqueue($idx)
    $visited[$idx] = $true
}
for ($y = 0; $y -lt $height; $y++) {
    $idx1 = $y * $width
    $idx2 = $y * $width + ($width - 1)
    if (-not $visited[$idx1]) { $queue.Enqueue($idx1); $visited[$idx1] = $true }
    if (-not $visited[$idx2]) { $queue.Enqueue($idx2); $visited[$idx2] = $true }
}

Write-Output "Starting flood fill from image borders..."

# BFS traversal
while ($queue.Count -gt 0) {
    $curr = $queue.Dequeue()
    $cx = $curr % $width
    $cy = [Math]::Floor($curr / $width)

    $offset = $cy * $srcData.Stride + ($cx * 4)
    $b = $srcBytes[$offset]
    $g = $srcBytes[$offset + 1]
    $r = $srcBytes[$offset + 2]

    if (IsChecker $r $g $b) {
        # Set alpha to 0 (fully transparent)
        $dstBytes[$offset + 3] = 0
        $dstBytes[$offset + 2] = 0
        $dstBytes[$offset + 1] = 0
        $dstBytes[$offset] = 0

        # Check 4 neighbors
        $neighbors = @(
            @{x=$cx-1; y=$cy},
            @{x=$cx+1; y=$cy},
            @{x=$cx; y=$cy-1},
            @{x=$cx; y=$cy+1}
        )

        foreach ($n in $neighbors) {
            if ($n.x -ge 0 -and $n.x -lt $width -and $n.y -ge 0 -and $n.y -lt $height) {
                $nIdx = $n.y * $width + $n.x
                if (-not $visited[$nIdx]) {
                    $visited[$nIdx] = $true
                    $queue.Enqueue($nIdx)
                }
            }
        }
    }
}

# Edge anti-aliasing feathering: for non-transparent pixels touching transparent pixels
for ($y = 1; $y -lt $height - 1; $y++) {
    for ($x = 1; $x -lt $width - 1; $x++) {
        $offset = $y * $srcData.Stride + ($x * 4)
        $alpha = $dstBytes[$offset + 3]
        if ($alpha -eq 255) {
            $r = $dstBytes[$offset + 2]
            $g = $dstBytes[$offset + 1]
            $b = $dstBytes[$offset]
            
            # Check if touching transparent pixel
            $leftA = $dstBytes[$offset - 4 + 3]
            $rightA = $dstBytes[$offset + 4 + 3]
            $topA = $dstBytes[$offset - $srcData.Stride + 3]
            $botA = $dstBytes[$offset + $srcData.Stride + 3]

            if ($leftA -eq 0 -or $rightA -eq 0 -or $topA -eq 0 -or $botA -eq 0) {
                # If near gray/white edge halo, soften alpha
                $diffRG = [Math]::Abs($r - $g)
                $diffGB = [Math]::Abs($g - $b)
                if ($r -gt 150 -and $diffRG -lt 12 -and $diffGB -lt 12) {
                    $dstBytes[$offset + 3] = 60
                }
            }
        }
    }
}

[System.Runtime.InteropServices.Marshal]::Copy($dstBytes, 0, $dstData.Scan0, $byteCount)

$bmp.UnlockBits($srcData)
$result.UnlockBits($dstData)
$bmp.Dispose()

$result.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
$result.Dispose()

Write-Output "Successfully created clean transparent cutout: $dest"
