param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('focus', 'capture', 'click', 'drag', 'move', 'send')]
    [string]$Action,

    [int]$X = 0,
    [int]$Y = 0,
    [int]$X2 = 0,
    [int]$Y2 = 0,
    [string]$Keys = '',
    [string]$OutputPath = 'C:\Users\rober\Nimbus\nuvemshop\previews\chrome-current.png'
)

$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Windows.Forms

Add-Type @'
using System;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Text;

public static class NimbusWindowControl
{
    private delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);
    [StructLayout(LayoutKind.Sequential)]
    public struct Rect
    {
        public int Left;
        public int Top;
        public int Right;
        public int Bottom;
    }

    [DllImport("user32.dll")]
    public static extern bool SetForegroundWindow(IntPtr hWnd);

    [DllImport("user32.dll")]
    public static extern bool ShowWindowAsync(IntPtr hWnd, int nCmdShow);

    [DllImport("user32.dll")]
    public static extern bool GetWindowRect(IntPtr hWnd, out Rect rect);

    [DllImport("user32.dll")]
    public static extern bool SetCursorPos(int x, int y);

    [DllImport("user32.dll")]
    private static extern bool EnumWindows(EnumWindowsProc callback, IntPtr lParam);

    [DllImport("user32.dll")]
    private static extern bool IsWindowVisible(IntPtr hWnd);

    [DllImport("user32.dll", CharSet = CharSet.Unicode)]
    private static extern int GetClassName(IntPtr hWnd, StringBuilder className, int maxCount);

    [DllImport("user32.dll")]
    private static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint processId);

    [DllImport("user32.dll")]
    public static extern void mouse_event(
        uint dwFlags,
        uint dx,
        uint dy,
        uint dwData,
        UIntPtr dwExtraInfo
    );

    public static IntPtr FindChromeWindow()
    {
        IntPtr bestWindow = IntPtr.Zero;
        long bestArea = 0;

        EnumWindows(delegate (IntPtr hWnd, IntPtr lParam)
        {
            if (!IsWindowVisible(hWnd))
            {
                return true;
            }

            uint processId;
            GetWindowThreadProcessId(hWnd, out processId);
            try
            {
                if (!string.Equals(
                    Process.GetProcessById((int)processId).ProcessName,
                    "chrome",
                    StringComparison.OrdinalIgnoreCase
                ))
                {
                    return true;
                }
            }
            catch
            {
                return true;
            }

            StringBuilder className = new StringBuilder(256);
            GetClassName(hWnd, className, className.Capacity);
            if (!string.Equals(className.ToString(), "Chrome_WidgetWin_1", StringComparison.Ordinal))
            {
                return true;
            }

            Rect candidate;
            if (!GetWindowRect(hWnd, out candidate))
            {
                return true;
            }

            long width = candidate.Right - candidate.Left;
            long height = candidate.Bottom - candidate.Top;
            long area = width * height;
            if (width >= 600 && height >= 400 && area > bestArea)
            {
                bestWindow = hWnd;
                bestArea = area;
            }

            return true;
        }, IntPtr.Zero);

        return bestWindow;
    }

    public static uint GetProcessId(IntPtr hWnd)
    {
        uint processId;
        GetWindowThreadProcessId(hWnd, out processId);
        return processId;
    }
}
'@

$handle = [NimbusWindowControl]::FindChromeWindow()
if ($handle -eq [IntPtr]::Zero) {
    throw 'A janela autenticada da administração Nuvemshop não foi encontrada.'
}

$processId = [NimbusWindowControl]::GetProcessId($handle)
$chrome = Get-Process -Id $processId -ErrorAction Stop
if ($handle -eq [IntPtr]::Zero) {
    throw 'A janela do Chrome não possui um identificador utilizável.'
}

[NimbusWindowControl]::ShowWindowAsync($handle, 3) | Out-Null
[NimbusWindowControl]::SetForegroundWindow($handle) | Out-Null
Start-Sleep -Milliseconds 500

$rect = New-Object NimbusWindowControl+Rect
if (-not [NimbusWindowControl]::GetWindowRect($handle, [ref]$rect)) {
    throw 'Não foi possível obter os limites da janela do Chrome.'
}

switch ($Action) {
    'focus' {
        [pscustomobject]@{
            ProcessId = $chrome.Id
            Title = $chrome.MainWindowTitle
            Left = $rect.Left
            Top = $rect.Top
            Width = $rect.Right - $rect.Left
            Height = $rect.Bottom - $rect.Top
        }
    }

    'capture' {
        $width = $rect.Right - $rect.Left
        $height = $rect.Bottom - $rect.Top
        $bitmap = New-Object System.Drawing.Bitmap $width, $height
        $graphics = [System.Drawing.Graphics]::FromImage($bitmap)

        try {
            $graphics.CopyFromScreen(
                $rect.Left,
                $rect.Top,
                0,
                0,
                (New-Object System.Drawing.Size $width, $height)
            )
            $bitmap.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
        }
        finally {
            $graphics.Dispose()
            $bitmap.Dispose()
        }

        Get-Item -LiteralPath $OutputPath |
            Select-Object FullName, Length, LastWriteTime
    }

    'click' {
        $absoluteX = $rect.Left + $X
        $absoluteY = $rect.Top + $Y
        [NimbusWindowControl]::SetCursorPos($absoluteX, $absoluteY) | Out-Null
        Start-Sleep -Milliseconds 150
        [NimbusWindowControl]::mouse_event(0x0002, 0, 0, 0, [UIntPtr]::Zero)
        [NimbusWindowControl]::mouse_event(0x0004, 0, 0, 0, [UIntPtr]::Zero)
        Start-Sleep -Milliseconds 500
    }

    'move' {
        $absoluteX = $rect.Left + $X
        $absoluteY = $rect.Top + $Y
        [NimbusWindowControl]::SetCursorPos($absoluteX, $absoluteY) | Out-Null
        Start-Sleep -Milliseconds 500
    }

    'drag' {
        $startX = $rect.Left + $X
        $startY = $rect.Top + $Y
        $endX = $rect.Left + $X2
        $endY = $rect.Top + $Y2
        [NimbusWindowControl]::SetCursorPos($startX, $startY) | Out-Null
        Start-Sleep -Milliseconds 250
        [NimbusWindowControl]::mouse_event(0x0002, 0, 0, 0, [UIntPtr]::Zero)

        $steps = 18
        for ($step = 1; $step -le $steps; $step++) {
            $nextX = [int]($startX + (($endX - $startX) * $step / $steps))
            $nextY = [int]($startY + (($endY - $startY) * $step / $steps))
            [NimbusWindowControl]::SetCursorPos($nextX, $nextY) | Out-Null
            Start-Sleep -Milliseconds 35
        }

        Start-Sleep -Milliseconds 250
        [NimbusWindowControl]::mouse_event(0x0004, 0, 0, 0, [UIntPtr]::Zero)
        Start-Sleep -Milliseconds 700
    }

    'send' {
        if ([string]::IsNullOrWhiteSpace($Keys)) {
            throw 'Informe as teclas no parâmetro -Keys.'
        }

        [System.Windows.Forms.SendKeys]::SendWait($Keys)
        Start-Sleep -Milliseconds 700
    }
}
