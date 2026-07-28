param(
    [int[]]$OnlyProductId = @(),
    [int]$MaxCount = 0
)

$ErrorActionPreference = 'Stop'

$workspace = 'C:\Users\rober\Nimbus'
$uploadManifestPath = Join-Path $workspace 'nuvemshop\assets\product-lifestyle\2026-07-16\uploads\upload-manifest.json'
$catalogManifestPath = Join-Path $workspace 'nuvemshop\assets\product-lifestyle\2026-07-16\catalog\nuvemshop-products.json'
$logPath = Join-Path $workspace 'nuvemshop\assets\product-lifestyle\2026-07-16\uploads\upload-log.json'
$evidenceDirectory = Join-Path $workspace 'nuvemshop\previews\lifestyle-upload-batch'

New-Item -ItemType Directory -Path $evidenceDirectory -Force | Out-Null

Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes

Add-Type @'
using System;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Text;

public static class NimbusBatchWindow
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
    public static extern void mouse_event(
        uint dwFlags,
        uint dx,
        uint dy,
        uint dwData,
        UIntPtr dwExtraInfo
    );

    [DllImport("user32.dll")]
    private static extern bool EnumWindows(EnumWindowsProc callback, IntPtr lParam);

    [DllImport("user32.dll")]
    private static extern bool IsWindowVisible(IntPtr hWnd);

    [DllImport("user32.dll")]
    private static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint processId);

    [DllImport("user32.dll", CharSet = CharSet.Unicode)]
    private static extern int GetClassName(IntPtr hWnd, StringBuilder className, int maxCount);

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
}
'@

function Get-ChromeWindow {
    $handle = [NimbusBatchWindow]::FindChromeWindow()
    if ($handle -eq [IntPtr]::Zero) {
        throw 'A janela autenticada do Chrome não foi encontrada.'
    }

    [NimbusBatchWindow]::ShowWindowAsync($handle, 3) | Out-Null
    [NimbusBatchWindow]::SetForegroundWindow($handle) | Out-Null
    Start-Sleep -Milliseconds 450

    $rect = New-Object NimbusBatchWindow+Rect
    if (-not [NimbusBatchWindow]::GetWindowRect($handle, [ref]$rect)) {
        throw 'Não foi possível obter os limites da janela do Chrome.'
    }

    [pscustomobject]@{
        Handle = $handle
        Rect = $rect
    }
}

function Invoke-RelativeClick {
    param(
        [Parameter(Mandatory = $true)]$Window,
        [Parameter(Mandatory = $true)][int]$X,
        [Parameter(Mandatory = $true)][int]$Y
    )

    [NimbusBatchWindow]::ShowWindowAsync($Window.Handle, 3) | Out-Null
    [NimbusBatchWindow]::SetForegroundWindow($Window.Handle) | Out-Null
    Start-Sleep -Milliseconds 250
    [NimbusBatchWindow]::SetCursorPos($Window.Rect.Left + $X, $Window.Rect.Top + $Y) | Out-Null
    Start-Sleep -Milliseconds 150
    [NimbusBatchWindow]::mouse_event(0x0002, 0, 0, 0, [UIntPtr]::Zero)
    [NimbusBatchWindow]::mouse_event(0x0004, 0, 0, 0, [UIntPtr]::Zero)
    Start-Sleep -Milliseconds 400
}

function Invoke-RelativeDrag {
    param(
        [Parameter(Mandatory = $true)]$Window,
        [Parameter(Mandatory = $true)][int]$X,
        [Parameter(Mandatory = $true)][int]$Y,
        [Parameter(Mandatory = $true)][int]$X2,
        [Parameter(Mandatory = $true)][int]$Y2
    )

    [NimbusBatchWindow]::ShowWindowAsync($Window.Handle, 3) | Out-Null
    [NimbusBatchWindow]::SetForegroundWindow($Window.Handle) | Out-Null
    Start-Sleep -Milliseconds 250

    $startX = $Window.Rect.Left + $X
    $startY = $Window.Rect.Top + $Y
    $endX = $Window.Rect.Left + $X2
    $endY = $Window.Rect.Top + $Y2

    [NimbusBatchWindow]::SetCursorPos($startX, $startY) | Out-Null
    Start-Sleep -Milliseconds 300
    [NimbusBatchWindow]::mouse_event(0x0002, 0, 0, 0, [UIntPtr]::Zero)
    Start-Sleep -Milliseconds 250

    for ($step = 1; $step -le 24; $step++) {
        $nextX = [int]($startX + (($endX - $startX) * $step / 24))
        $nextY = [int]($startY + (($endY - $startY) * $step / 24))
        [NimbusBatchWindow]::SetCursorPos($nextX, $nextY) | Out-Null
        Start-Sleep -Milliseconds 35
    }

    Start-Sleep -Milliseconds 300
    [NimbusBatchWindow]::mouse_event(0x0004, 0, 0, 0, [UIntPtr]::Zero)
    Start-Sleep -Milliseconds 700
}

function Send-ChromeKeys {
    param(
        [Parameter(Mandatory = $true)]$Window,
        [Parameter(Mandatory = $true)][string]$Keys
    )

    [NimbusBatchWindow]::SetForegroundWindow($Window.Handle) | Out-Null
    Start-Sleep -Milliseconds 250
    [System.Windows.Forms.SendKeys]::SendWait($Keys)
    Start-Sleep -Milliseconds 500
}

function Open-ChromeUrl {
    param(
        [Parameter(Mandatory = $true)]$Window,
        [Parameter(Mandatory = $true)][string]$Url
    )

    Set-Clipboard -Value $Url
    Send-ChromeKeys -Window $Window -Keys '^l'
    Send-ChromeKeys -Window $Window -Keys '^v{ENTER}'
    Start-Sleep -Seconds 7
}

function Set-UploadFile {
    param(
        [Parameter(Mandatory = $true)][string]$Path
    )

    if (-not (Test-Path -LiteralPath $Path)) {
        throw "Arquivo de upload não encontrado: $Path"
    }

    Set-Clipboard -Value $Path
    [NimbusBatchWindow]::SetCursorPos(700, 838) | Out-Null
    Start-Sleep -Milliseconds 250
    [NimbusBatchWindow]::mouse_event(0x0002, 0, 0, 0, [UIntPtr]::Zero)
    [NimbusBatchWindow]::mouse_event(0x0004, 0, 0, 0, [UIntPtr]::Zero)
    Start-Sleep -Milliseconds 300
    [System.Windows.Forms.SendKeys]::SendWait('^v')
    Start-Sleep -Milliseconds 300
    [System.Windows.Forms.SendKeys]::SendWait('{ENTER}')
}

function Test-AutomationName {
    param(
        [Parameter(Mandatory = $true)]$Window,
        [Parameter(Mandatory = $true)][string]$Name
    )

    $root = [System.Windows.Automation.AutomationElement]::FromHandle($Window.Handle)
    $condition = New-Object System.Windows.Automation.PropertyCondition(
        [System.Windows.Automation.AutomationElement]::NameProperty,
        $Name
    )
    return $null -ne $root.FindFirst(
        [System.Windows.Automation.TreeScope]::Descendants,
        $condition
    )
}

function Test-AutomationNameContains {
    param(
        [Parameter(Mandatory = $true)]$Window,
        [Parameter(Mandatory = $true)][string]$Text
    )

    $root = [System.Windows.Automation.AutomationElement]::FromHandle($Window.Handle)
    $elements = $root.FindAll(
        [System.Windows.Automation.TreeScope]::Descendants,
        [System.Windows.Automation.Condition]::TrueCondition
    )

    for ($index = 0; $index -lt $elements.Count; $index++) {
        if ($elements.Item($index).Current.Name -like "*$Text*") {
            return $true
        }
    }

    return $false
}

function Wait-AutomationName {
    param(
        [Parameter(Mandatory = $true)]$Window,
        [Parameter(Mandatory = $true)][string]$Name,
        [int]$TimeoutSeconds = 12
    )

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    do {
        if (Test-AutomationName -Window $Window -Name $Name) {
            return $true
        }
        Start-Sleep -Milliseconds 500
    } while ((Get-Date) -lt $deadline)

    return $false
}

function Wait-AutomationNameContains {
    param(
        [Parameter(Mandatory = $true)]$Window,
        [Parameter(Mandatory = $true)][string]$Text,
        [int]$TimeoutSeconds = 12
    )

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    do {
        if (Test-AutomationNameContains -Window $Window -Text $Text) {
            return $true
        }
        Start-Sleep -Milliseconds 500
    } while ((Get-Date) -lt $deadline)

    return $false
}

function Save-ChromeScreenshot {
    param(
        [Parameter(Mandatory = $true)]$Window,
        [Parameter(Mandatory = $true)][string]$Path
    )

    $width = $Window.Rect.Right - $Window.Rect.Left
    $height = $Window.Rect.Bottom - $Window.Rect.Top
    $bitmap = New-Object System.Drawing.Bitmap $width, $height
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)

    try {
        $graphics.CopyFromScreen(
            $Window.Rect.Left,
            $Window.Rect.Top,
            0,
            0,
            (New-Object System.Drawing.Size $width, $height)
        )
        $bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
    }
    finally {
        $graphics.Dispose()
        $bitmap.Dispose()
    }
}

function Write-UploadLog {
    param([Parameter(Mandatory = $true)]$Entries)

    [pscustomobject]@{
        updatedAt = (Get-Date).ToString('o')
        completed = @($Entries | Where-Object status -eq 'completed').Count
        failed = @($Entries | Where-Object status -eq 'failed').Count
        entries = @($Entries)
    } |
        ConvertTo-Json -Depth 8 |
        Set-Content -LiteralPath $logPath -Encoding utf8
}

$uploadManifest = Get-Content -LiteralPath $uploadManifestPath -Raw | ConvertFrom-Json
$catalogProducts = (
    Get-Content -LiteralPath $catalogManifestPath -Raw |
        ConvertFrom-Json
).products

$catalogById = @{}
foreach ($product in $catalogProducts) {
    $catalogById[[string]$product.productId] = $product
}

$alreadyCompletedIds = @(352725749, 352722510)
$items = @(
    foreach ($upload in $uploadManifest) {
        $productId = [int]$upload.productId
        if ($alreadyCompletedIds -contains $productId) {
            continue
        }
        if ($OnlyProductId.Count -gt 0 -and $OnlyProductId -notcontains $productId) {
            continue
        }

        $catalog = $catalogById[[string]$productId]
        if ($null -eq $catalog) {
            throw "Produto $productId não encontrado no catálogo de referência."
        }

        [pscustomobject]@{
            productId = $productId
            title = [string]$upload.title
            collection = [string]$upload.collection
            adminUrl = [string]$upload.adminUrl
            upload = [string]$upload.upload
            existingGalleryCount = @($catalog.gallery).Count
        }
    }
)

if ($MaxCount -gt 0) {
    $items = @($items | Select-Object -First $MaxCount)
}

$logEntries = @()
if (Test-Path -LiteralPath $logPath) {
    try {
        $existingLog = Get-Content -LiteralPath $logPath -Raw | ConvertFrom-Json
        $logEntries = @($existingLog.entries)
    }
    catch {
        $logEntries = @()
    }
}

$window = Get-ChromeWindow
$drawerX = @(1483, 1658, 1830)
$drawerFirstY = 355
$drawerRowGap = 172

Write-Host "Produtos selecionados para o lote: $($items.Count)"

foreach ($item in $items) {
    $existingCompletion = @(
        $logEntries |
            Where-Object {
                [int]$_.productId -eq $item.productId -and
                $_.status -eq 'completed'
            }
    )
    if ($existingCompletion.Count -gt 0) {
        Write-Host "Ignorando $($item.productId): já concluído no log."
        continue
    }

    $startedAt = Get-Date
    Write-Host "[$($item.productId)] $($item.title)"

    try {
        Open-ChromeUrl -Window $window -Url $item.adminUrl

        if (-not (Wait-AutomationNameContains -Window $window -Text 'Fotos e v' -TimeoutSeconds 8)) {
            throw 'A seção Fotos e vídeos não ficou disponível.'
        }

        Invoke-RelativeClick -Window $window -X 1095 -Y 941
        Start-Sleep -Seconds 2
        Set-UploadFile -Path $item.upload
        Start-Sleep -Seconds 11

        # O primeiro lápis abre o editor. Voltar uma vez leva ao gerenciador
        # completo, onde a Nuvemshop permite ordenar toda a galeria.
        Invoke-RelativeClick -Window $window -X 832 -Y 1020
        if (-not (Wait-AutomationName -Window $window -Name 'Editar foto' -TimeoutSeconds 8)) {
            Invoke-RelativeClick -Window $window -X 832 -Y 1020
            if (-not (Wait-AutomationName -Window $window -Name 'Editar foto' -TimeoutSeconds 6)) {
                throw 'O editor da primeira foto não abriu.'
            }
        }

        Invoke-RelativeClick -Window $window -X 1418 -Y 122
        if (-not (Wait-AutomationNameContains -Window $window -Text 'Apagar v' -TimeoutSeconds 8)) {
            throw 'O gerenciador completo da galeria não abriu.'
        }

        $newIndex = [int]$item.existingGalleryCount
        $column = $newIndex % 3
        $row = [Math]::Floor($newIndex / 3)
        $sourceX = $drawerX[$column]
        $sourceY = $drawerFirstY + ($drawerRowGap * $row)

        Invoke-RelativeDrag `
            -Window $window `
            -X $sourceX `
            -Y $sourceY `
            -X2 $drawerX[0] `
            -Y2 $drawerFirstY

        Invoke-RelativeClick -Window $window -X 1418 -Y 122
        Start-Sleep -Seconds 1
        Invoke-RelativeClick -Window $window -X 1425 -Y 189

        if (-not (Wait-AutomationName -Window $window -Name 'Produto salvo' -TimeoutSeconds 15)) {
            throw 'A Nuvemshop não confirmou Produto salvo.'
        }

        $completedAt = Get-Date
        $logEntries += [pscustomobject]@{
            productId = $item.productId
            title = $item.title
            collection = $item.collection
            status = 'completed'
            existingGalleryCount = $item.existingGalleryCount
            startedAt = $startedAt.ToString('o')
            completedAt = $completedAt.ToString('o')
            elapsedSeconds = [Math]::Round(($completedAt - $startedAt).TotalSeconds, 1)
        }
        Write-UploadLog -Entries $logEntries

        if (@($logEntries | Where-Object status -eq 'completed').Count % 10 -eq 0) {
            $evidencePath = Join-Path $evidenceDirectory "$($item.productId)-saved.png"
            Save-ChromeScreenshot -Window $window -Path $evidencePath
        }

        Write-Host "  concluído e salvo."
    }
    catch {
        $failedAt = Get-Date
        $evidencePath = Join-Path $evidenceDirectory "$($item.productId)-failed.png"
        Save-ChromeScreenshot -Window $window -Path $evidencePath

        $logEntries += [pscustomobject]@{
            productId = $item.productId
            title = $item.title
            collection = $item.collection
            status = 'failed'
            existingGalleryCount = $item.existingGalleryCount
            startedAt = $startedAt.ToString('o')
            failedAt = $failedAt.ToString('o')
            elapsedSeconds = [Math]::Round(($failedAt - $startedAt).TotalSeconds, 1)
            error = $_.Exception.Message
            evidence = $evidencePath
        }
        Write-UploadLog -Entries $logEntries
        throw
    }
}

$completedCount = @($logEntries | Where-Object status -eq 'completed').Count
Write-Host "Lote finalizado. Concluídos registrados: $completedCount"
Write-Host "Log: $logPath"
