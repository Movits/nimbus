param(
    [string]$TailCssPath = "C:\Users\rober\Nimbus\nuvemshop\css-hover-tail-2026-07-17.css",
    [int]$WaitMs = 500
)

$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
Add-Type -AssemblyName System.Windows.Forms

Add-Type -TypeDefinition @"
using System;
using System.Text;
using System.Runtime.InteropServices;
using System.Diagnostics;

public static class NimbusCtrl
{
    private delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);

    [StructLayout(LayoutKind.Sequential)]
    public struct Rect { public int Left; public int Top; public int Right; public int Bottom; }

    [DllImport("user32.dll")] private static extern bool EnumWindows(EnumWindowsProc cb, IntPtr lp);
    [DllImport("user32.dll")] private static extern bool IsWindowVisible(IntPtr hWnd);
    [DllImport("user32.dll")] private static extern bool GetWindowRect(IntPtr hWnd, out Rect r);
    [DllImport("user32.dll")] private static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint pid);
    [DllImport("user32.dll", CharSet = CharSet.Unicode)]
    private static extern int GetClassName(IntPtr hWnd, StringBuilder sb, int max);
    [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);
    [DllImport("user32.dll")] public static extern bool ShowWindowAsync(IntPtr hWnd, int cmd);
    [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);
    [DllImport("user32.dll")] public static extern void mouse_event(uint flags, uint dx, uint dy, uint data, UIntPtr extra);

    public static IntPtr FindChromeWindow(string preferredTitle)
    {
        IntPtr best = IntPtr.Zero;
        long bestArea = 0;
        EnumWindows((hwnd, lp) =>
        {
            if (!IsWindowVisible(hwnd)) return true;

            uint pid = 0;
            GetWindowThreadProcessId(hwnd, out pid);
            try
            {
                if (Process.GetProcessById((int)pid).ProcessName != "chrome")
                    return true;
            }
            catch
            {
                return true;
            }

            var cls = new StringBuilder(256);
            GetClassName(hwnd, cls, cls.Capacity);
            if (cls.ToString() != "Chrome_WidgetWin_1") return true;

            Rect r;
            if (!GetWindowRect(hwnd, out r)) return true;
            int w = r.Right - r.Left;
            int h = r.Bottom - r.Top;
            if (w < 700 || h < 400) return true;

            string title = string.Empty;
            try { title = Process.GetProcessById((int)pid).MainWindowTitle ?? string.Empty; }
            catch { title = string.Empty; }

            if (!string.IsNullOrWhiteSpace(preferredTitle) && title.Contains(preferredTitle))
            {
                best = hwnd;
                return false;
            }

            long area = (long)w * (long)h;
            if (area > bestArea)
            {
                bestArea = area;
                best = hwnd;
            }
            return true;
        }, IntPtr.Zero);
        return best;
    }

    public static void ClickAt(int x, int y)
    {
        SetCursorPos(x, y);
        System.Threading.Thread.Sleep(70);
        mouse_event(0x0002, 0, 0, 0, UIntPtr.Zero);
        mouse_event(0x0004, 0, 0, 0, UIntPtr.Zero);
    }
}
"@

function Normalize-Text([string]$Text)
{
    if ([string]::IsNullOrEmpty($Text)) { return '' }
    $decomposed = $Text.Normalize([Text.NormalizationForm]::FormD)
    $sb = New-Object System.Text.StringBuilder
    foreach ($ch in $decomposed.ToCharArray())
    {
        if ([System.Globalization.CharUnicodeInfo]::GetUnicodeCategory($ch) -ne [System.Globalization.UnicodeCategory]::NonSpacingMark)
        {
            [void]$sb.Append($ch)
        }
    }
    return $sb.ToString().ToLowerInvariant()
}

function Find-UiElement {
    param(
        [System.Windows.Automation.AutomationElement]$Root,
        [string[]]$Names,
        [string[]]$NormalizedNames = @(),
        [string]$ClassName = "",
        [string[]]$ControlTypes = @()
    )

    $all = $Root.FindAll([System.Windows.Automation.TreeScope]::Descendants, [System.Windows.Automation.Condition]::TrueCondition)
    foreach ($el in $all) {
        $name = $el.Current.Name

        $nameMatch = $false
        foreach ($needle in $Names) {
            if ($name -like "*$needle*") { $nameMatch = $true; break }
        }

        if (-not $nameMatch -and $NormalizedNames.Count -gt 0) {
            $nameNorm = Normalize-Text -Text $name
            foreach ($needleNorm in $NormalizedNames) {
                if (-not [string]::IsNullOrWhiteSpace($needleNorm) -and $nameNorm -like "*$needleNorm*")
                {
                    $nameMatch = $true
                    break
                }
            }
        }

        if (-not $nameMatch) { continue }
        if ($ClassName -and $el.Current.ClassName -ne $ClassName) { continue }
        if ($ControlTypes.Count -gt 0) {
            if ($ControlTypes -notcontains $el.Current.ControlType.ProgrammaticName) { continue }
        }
        if ($el.Current.IsEnabled) { return $el }
    }
    return $null
}

function Invoke-UiClick {
    param([System.Windows.Automation.AutomationElement]$Element)
    if ($null -eq $Element) { throw 'Elemento nulo' }
    $pattern = $null
    if ($Element.TryGetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern, [ref]$pattern)) {
        [System.Windows.Automation.InvokePattern]$pattern.Invoke()
        return
    }

    $rect = $Element.Current.BoundingRectangle
    [NimbusCtrl]::ClickAt([int][Math]::Round(($rect.Left + $rect.Right)/2), [int][Math]::Round(($rect.Top + $rect.Bottom)/2)) | Out-Null
}

function Read-EditorText {
    param([System.Windows.Automation.AutomationElement]$Editor)

    $rect = $Editor.Current.BoundingRectangle
    [NimbusCtrl]::ClickAt([int][Math]::Round(($rect.Left + $rect.Right)/2), [int][Math]::Round(($rect.Top + $rect.Bottom)/2)) | Out-Null
    Start-Sleep -Milliseconds 150

    Set-Clipboard -Value ' '
    [System.Windows.Forms.SendKeys]::SendWait('^a')
    Start-Sleep -Milliseconds 100
    [System.Windows.Forms.SendKeys]::SendWait('^c')
    Start-Sleep -Milliseconds 300
    $txt = Get-Clipboard -Raw
    if ($null -eq $txt) { return '' }
    return $txt
}

$handle = [NimbusCtrl]::FindChromeWindow('Personalizar')
if ($handle -eq [IntPtr]::Zero) { throw 'Janela do Chrome de personalização não encontrada' }
[NimbusCtrl]::ShowWindowAsync($handle, 3) | Out-Null
[NimbusCtrl]::SetForegroundWindow($handle) | Out-Null
Start-Sleep -Milliseconds $WaitMs
$root = [System.Windows.Automation.AutomationElement]::FromHandle($handle)

$cssLink = Find-UiElement -Root $root -Names @('Edição de css avançada','Edição de CSS avançada') -NormalizedNames @('edicao de css avancada','edicao css avancada') -ControlTypes @('ControlType.Hyperlink')
if ($null -eq $cssLink) {
    $cssLink = Find-UiElement -Root $root -Names @('css') -NormalizedNames @('css avancada') -ControlTypes @('ControlType.Hyperlink','ControlType.Text')
}
if ($null -eq $cssLink) { throw 'Botão/Link de Edição de CSS não encontrado' }
Invoke-UiClick -Element $cssLink
Start-Sleep -Milliseconds (2 * $WaitMs)

$root = [System.Windows.Automation.AutomationElement]::FromHandle($handle)
$edits = $root.FindAll([System.Windows.Automation.TreeScope]::Descendants, (New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::ClassNameProperty, 'form-control')))
if ($edits.Count -eq 0) { throw 'Campo do editor (form-control) não encontrado' }
$editor = $edits[0]

$current = Read-EditorText -Editor $editor
$required = @(
    '.item-image-secondary.js-product-item-secondary-image-private[data-srcset*="/file_name-"]',
    '[data-product-id="352728451"] .item-image-secondary',
    '.nimbus-project-modal__close:hover'
)

$tail = Get-Content -LiteralPath $TailCssPath -Raw -Encoding UTF8
$missing = @()
foreach ($r in $required) { if (-not $current.Contains($r)) { $missing += $r } }

Write-Output ("current_len=" + $current.Length)
Write-Output ("missing_rules=" + ($missing -join ', '))

if ($missing.Count -eq 0) {
    Write-Output 'hover_tail_already_present'
    exit 0
}

# append patch
$rect = $editor.Current.BoundingRectangle
[NimbusCtrl]::ClickAt([int][Math]::Round(($rect.Left + $rect.Right)/2), [int][Math]::Round(($rect.Top + $rect.Bottom)/2)) | Out-Null
Start-Sleep -Milliseconds 120
[System.Windows.Forms.SendKeys]::SendWait('^{END}')
Start-Sleep -Milliseconds 120

if (($current.Length -gt 0) -and (-not $current.EndsWith("`r")) -and (-not $current.EndsWith("`n"))) {
    Set-Clipboard -Value "`r`n"
} else {
    Set-Clipboard -Value "``n"
}
[System.Windows.Forms.SendKeys]::SendWait('^v')
Start-Sleep -Milliseconds 120

Set-Clipboard -Value $tail
Start-Sleep -Milliseconds 120
[System.Windows.Forms.SendKeys]::SendWait('^v')
Start-Sleep -Milliseconds 500

$after = Read-EditorText -Editor $editor
Write-Output ('after_len=' + $after.Length)
$allOk = $true
foreach ($r in $required) {
    $ok = $after.Contains($r)
    Write-Output ($r + '|' + $ok)
    if (-not $ok) { $allOk = $false }
}
if (-not $allOk) { throw 'Não foi possível injetar todas as regras no editor' }

# test css
$root = [System.Windows.Automation.AutomationElement]::FromHandle($handle)
$testBtn = Find-UiElement -Root $root -Names @('Testar CSS') -ControlTypes @('ControlType.Hyperlink')
if ($null -eq $testBtn) { throw 'Botão Testar CSS não encontrado' }
Invoke-UiClick -Element $testBtn
Start-Sleep -Milliseconds (2 * $WaitMs)

$root = [System.Windows.Automation.AutomationElement]::FromHandle($handle)
$pubBtn = Find-UiElement -Root $root -Names @('Publicar alterações') -ControlTypes @('ControlType.Button')
if ($null -eq $pubBtn) {
    $pubBtn = Find-UiElement -Root $root -Names @('Publicar') -ControlTypes @('ControlType.Button')
}
if ($null -eq $pubBtn) { throw 'Botão Publicar não encontrado' }
Invoke-UiClick -Element $pubBtn
Write-Output 'published_ok'
Start-Sleep -Seconds 6
