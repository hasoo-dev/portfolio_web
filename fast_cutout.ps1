$sourceCode = @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Collections.Generic;
using System.Runtime.InteropServices;

public class FastCutout
{
    public static void Process(string srcPath, string dstPath)
    {
        using (Bitmap bmp = new Bitmap(srcPath))
        {
            int width = bmp.Width;
            int height = bmp.Height;

            Bitmap result = new Bitmap(width, height, PixelFormat.Format32bppArgb);
            Rectangle rect = new Rectangle(0, 0, width, height);

            BitmapData srcData = bmp.LockBits(rect, ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
            BitmapData dstData = result.LockBits(rect, ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);

            int stride = srcData.Stride;
            int byteCount = stride * height;
            byte[] srcBytes = new byte[byteCount];
            byte[] dstBytes = new byte[byteCount];

            Marshal.Copy(srcData.Scan0, srcBytes, 0, byteCount);
            Array.Copy(srcBytes, dstBytes, byteCount);

            bool[] visited = new bool[width * height];
            Queue<int> queue = new Queue<int>(100000);

            // Seed only from TOP edge, LEFT edge, and TOP-RIGHT edge
            for (int x = 0; x < width; x++)
            {
                queue.Enqueue(x);
                visited[x] = true;
            }
            for (int y = 0; y < height; y++)
            {
                int leftIdx = y * width;
                if (!visited[leftIdx]) { queue.Enqueue(leftIdx); visited[leftIdx] = true; }
                
                // Only top 180px of right edge (sky above hair)
                if (y < 180)
                {
                    int rightIdx = y * width + (width - 1);
                    if (!visited[rightIdx]) { queue.Enqueue(rightIdx); visited[rightIdx] = true; }
                }
            }

            while (queue.Count > 0)
            {
                int curr = queue.Dequeue();
                int cx = curr % width;
                int cy = curr / width;

                int offset = cy * stride + (cx * 4);
                byte b = srcBytes[offset];
                byte g = srcBytes[offset + 1];
                byte r = srcBytes[offset + 2];

                int diffRG = Math.Abs(r - g);
                int diffGB = Math.Abs(g - b);
                int diffRB = Math.Abs(r - b);
                int maxDiff = Math.Max(diffRG, Math.Max(diffGB, diffRB));

                // The checkerboard pattern is pure grayscale (neutral)
                // In JPEG, neutral gray has maxDiff <= 6
                // Real shirts under warm outdoor lighting have warm color cast (r > b by at least 8-15)
                bool isChecker = false;

                if (cx < 540)
                {
                    // Left side is definitely background
                    isChecker = (r > 175 && g > 175 && b > 175 && maxDiff <= 9);
                }
                else
                {
                    // Right side: strictly pure grayscale checkerboard only
                    isChecker = (r > 180 && g > 180 && b > 180 && maxDiff <= 5);
                }

                if (isChecker)
                {
                    dstBytes[offset + 3] = 0; // Alpha = 0 (Transparent)
                    dstBytes[offset + 2] = 0;
                    dstBytes[offset + 1] = 0;
                    dstBytes[offset] = 0;

                    // 4 Neighbors
                    if (cx > 0) { int n = curr - 1; if (!visited[n]) { visited[n] = true; queue.Enqueue(n); } }
                    if (cx < width - 1) { int n = curr + 1; if (!visited[n]) { visited[n] = true; queue.Enqueue(n); } }
                    if (cy > 0) { int n = curr - width; if (!visited[n]) { visited[n] = true; queue.Enqueue(n); } }
                    if (cy < height - 1) { int n = curr + width; if (!visited[n]) { visited[n] = true; queue.Enqueue(n); } }
                }
            }

            // Defringe: soften any jagged edge by 1 pixel
            for (int y = 1; y < height - 1; y++)
            {
                for (int x = 1; x < width - 1; x++)
                {
                    int offset = y * stride + (x * 4);
                    if (dstBytes[offset + 3] == 255)
                    {
                        byte b = dstBytes[offset];
                        byte g = dstBytes[offset + 1];
                        byte r = dstBytes[offset + 2];

                        byte aL = dstBytes[offset - 4 + 3];
                        byte aR = dstBytes[offset + 4 + 3];
                        byte aT = dstBytes[offset - stride + 3];
                        byte aB = dstBytes[offset + stride + 3];

                        if (aL == 0 || aR == 0 || aT == 0 || aB == 0)
                        {
                            int diffRG = Math.Abs(r - g);
                            int diffGB = Math.Abs(g - b);
                            if (r > 170 && diffRG < 8 && diffGB < 8)
                            {
                                dstBytes[offset + 3] = 0; // Remove edge halo
                            }
                        }
                    }
                }
            }

            Marshal.Copy(dstBytes, 0, dstData.Scan0, byteCount);
            bmp.UnlockBits(srcData);
            result.UnlockBits(dstData);

            result.Save(dstPath, ImageFormat.Png);
            result.Dispose();
        }
    }
}
"@

Add-Type -TypeDefinition $sourceCode -ReferencedAssemblies "System.Drawing.dll"

$src = "C:\Users\HP\.gemini\antigravity\brain\2a400687-1c82-4d1c-a695-30d4fe924692\hassan_cutout_1788494815416.jpg"
$dest = "d:\projects\hassan_portfolio\assets\images\hassan-hero-cutout.png"

Write-Output "Running improved cutout extraction..."
$sw = [System.Diagnostics.Stopwatch]::StartNew()
[FastCutout]::Process($src, $dest)
$sw.Stop()
Write-Output "Completed in $($sw.ElapsedMilliseconds) ms!"
