$sourceCode = @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Collections.Generic;
using System.Runtime.InteropServices;

public class CheckerDetector
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

            // Step 1: Determine which 16x16 tiles are true checkerboard tiles
            int tilesX = (width + 15) / 16;
            int tilesY = (height + 15) / 16;
            bool[,] isCheckerTile = new bool[tilesX, tilesY];

            for (int ty = 0; ty < tilesY; ty++)
            {
                for (int tx = 0; tx < tilesX; tx++)
                {
                    int sampleX = Math.Min(width - 1, tx * 16 + 8);
                    int sampleY = Math.Min(height - 1, ty * 16 + 8);
                    int offset = sampleY * stride + (sampleX * 4);

                    byte b = srcBytes[offset];
                    byte g = srcBytes[offset + 1];
                    byte r = srcBytes[offset + 2];

                    int diff = Math.Max(Math.Abs(r - g), Math.Max(Math.Abs(g - b), Math.Abs(r - b)));

                    bool expectedGray = ((tx + ty) % 2 == 1);

                    if (expectedGray)
                    {
                        // Gray tile in background is around 190-205, neutral
                        if (r >= 180 && r <= 218 && diff <= 10)
                        {
                            isCheckerTile[tx, ty] = true;
                        }
                    }
                    else
                    {
                        // White tile in background is >= 250, neutral
                        if (r >= 248 && g >= 248 && b >= 248 && diff <= 8)
                        {
                            isCheckerTile[tx, ty] = true;
                        }
                    }
                }
            }

            // Step 2: Flood fill on the tiles starting from outside borders
            bool[,] reachableBgTile = new bool[tilesX, tilesY];
            Queue<Point> tileQueue = new Queue<Point>();

            // Seed from top row, bottom row, left col, right col
            for (int tx = 0; tx < tilesX; tx++)
            {
                if (isCheckerTile[tx, 0]) { reachableBgTile[tx, 0] = true; tileQueue.Enqueue(new Point(tx, 0)); }
                if (isCheckerTile[tx, tilesY - 1]) { reachableBgTile[tx, tilesY - 1] = true; tileQueue.Enqueue(new Point(tx, tilesY - 1)); }
            }
            for (int ty = 0; ty < tilesY; ty++)
            {
                if (isCheckerTile[0, ty] && !reachableBgTile[0, ty]) { reachableBgTile[0, ty] = true; tileQueue.Enqueue(new Point(0, ty)); }
                if (isCheckerTile[tilesX - 1, ty] && !reachableBgTile[tilesX - 1, ty]) { reachableBgTile[tilesX - 1, ty] = true; tileQueue.Enqueue(new Point(tilesX - 1, ty)); }
            }

            while (tileQueue.Count > 0)
            {
                Point p = tileQueue.Dequeue();
                int[] dx = { -1, 1, 0, 0 };
                int[] dy = { 0, 0, -1, 1 };

                for (int i = 0; i < 4; i++)
                {
                    int nx = p.X + dx[i];
                    int ny = p.Y + dy[i];

                    if (nx >= 0 && nx < tilesX && ny >= 0 && ny < tilesY)
                    {
                        if (!reachableBgTile[nx, ny] && isCheckerTile[nx, ny])
                        {
                            reachableBgTile[nx, ny] = true;
                            tileQueue.Enqueue(new Point(nx, ny));
                        }
                    }
                }
            }

            // Step 3: Now clear pixels that belong to reachable background tiles
            for (int y = 0; y < height; y++)
            {
                int ty = y / 16;
                for (int x = 0; x < width; x++)
                {
                    int tx = x / 16;
                    int offset = y * stride + (x * 4);

                    if (reachableBgTile[tx, ty])
                    {
                        byte b = srcBytes[offset];
                        byte g = srcBytes[offset + 1];
                        byte r = srcBytes[offset + 2];
                        int diff = Math.Max(Math.Abs(r - g), Math.Max(Math.Abs(g - b), Math.Abs(r - b)));

                        // Only clear if pixel itself is neutral gray or white
                        if ((r >= 170 && diff <= 12) || (r >= 245 && diff <= 10))
                        {
                            dstBytes[offset + 3] = 0; // Alpha = 0
                            dstBytes[offset + 2] = 0;
                            dstBytes[offset + 1] = 0;
                            dstBytes[offset] = 0;
                        }
                    }
                }
            }

            // Step 4: Feather boundary by 1px to remove any fringe
            for (int y = 1; y < height - 1; y++)
            {
                for (int x = 1; x < width - 1; x++)
                {
                    int offset = y * stride + (x * 4);
                    if (dstBytes[offset + 3] > 0)
                    {
                        byte aL = dstBytes[offset - 4 + 3];
                        byte aR = dstBytes[offset + 4 + 3];
                        byte aT = dstBytes[offset - stride + 3];
                        byte aB = dstBytes[offset + stride + 3];

                        if (aL == 0 || aR == 0 || aT == 0 || aB == 0)
                        {
                            byte r = dstBytes[offset + 2];
                            byte g = dstBytes[offset + 1];
                            byte b = dstBytes[offset];
                            int diff = Math.Max(Math.Abs(r - g), Math.Max(Math.Abs(g - b), Math.Abs(r - b)));

                            if (r > 175 && diff <= 8)
                            {
                                dstBytes[offset + 3] = 0; // Boundary antialiasing
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

Write-Output "Running tile-based checkerboard extraction..."
$sw = [System.Diagnostics.Stopwatch]::StartNew()
[CheckerDetector]::Process($src, $dest)
$sw.Stop()
Write-Output "Done in $($sw.ElapsedMilliseconds) ms!"
