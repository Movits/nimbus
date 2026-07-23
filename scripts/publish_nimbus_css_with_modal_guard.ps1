param(
    [string]$CssPath = "C:\Users\rober\Nimbus\nuvemshop\css-nimbus-correcoes-2026-07-20.css",
    [string]$StoreUrl = "https://loja.nimbuswear.com.br",
    [int]$WaitMs = 900,
    [int]$LiveCheckCount = 12,
    [int]$LiveCheckWaitMs = 8000
)

$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes

Add-Type -TypeDefinition @"
using System;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Text;

public static class NimbusChrome
{
    private delegate bool EnumWindowsProc(IntPtr hwnd, IntPtr lParam);
    [StructLayout(LayoutKind.Sequential)]
    public struct Rect { public int Left; public int Top; public int Right; public int Bottom; }

    [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);
    [DllImport("user32.dll")] public static extern bool ShowWindowAsync(IntPtr hWnd, int nCmdShow);
    [DllImport("user32.dll")] private static extern bool EnumWindows(EnumWindowsProc cb, IntPtr lParam);
    [DllImport("user32.dll")] private static extern bool IsWindowVisible(IntPtr hWnd);
    [DllImport("user32.dll")] private static extern bool GetWindowRect(IntPtr hWnd, out Rect r);
    [DllImport("user32.dll")] private static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint pid);
    [DllImport("user32.dll", CharSet = CharSet.Unicode)] private static extern int GetClassName(IntPtr hWnd, StringBuilder sb, int maxCount);
    [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);
    [DllImport("user32.dll")] public static extern void mouse_event(uint dwFlags, uint dx, uint dy, uint dwData, UIntPtr dwExtraInfo);

    public static IntPtr FindChromeWindow(string preferredTitle = null)
    {
        IntPtr best = IntPtr.Zero;
        long bestArea = 0;
        IntPtr preferred = IntPtr.Zero;
        string preferredLower = string.IsNullOrWhiteSpace(preferredTitle) ? "" : preferredTitle.ToLowerInvariant();

        EnumWindows((hwnd, lp) =>
        {
            if (!IsWindowVisible(hwnd)) return true;

            uint pid = 0;
            GetWindowThreadProcessId(hwnd, out pid);
            try
            {
                if (!string.Equals(Process.GetProcessById((int)pid).ProcessName, "chrome", StringComparison.OrdinalIgnoreCase))
                    return true;
            }
            catch { return true; }

            var cls = new StringBuilder(128);
            GetClassName(hwnd, cls, cls.Capacity);
            if (cls.ToString() != "Chrome_WidgetWin_1") return true;

            Rect r;
            if (!GetWindowRect(hwnd, out r)) return true;
            int width = r.Right - r.Left;
            int height = r.Bottom - r.Top;
            if (width < 900 || height < 620) return true;

            if (!string.IsNullOrWhiteSpace(preferredLower))
            {
                string title = string.Empty;
                try { title = Process.GetProcessById((int)pid).MainWindowTitle ?? string.Empty; } catch {}
                if (title.ToLowerInvariant().Contains(preferredLower))
                {
                    preferred = hwnd;
                    return false;
                }
            }

            long area = (long)width * (long)height;
            if (area > bestArea)
            {
                bestArea = area;
                best = hwnd;
            }
            return true;
        }, IntPtr.Zero);

        if (preferred != IntPtr.Zero) return preferred;
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

function Normalize-Text {
    param([string]$Text)
    if ([string]::IsNullOrWhiteSpace($Text)) { return "" }
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
        [string[]]$Names = @(),
        [string[]]$NormalizedNames = @(),
        [string[]]$ControlTypes = @(),
        [string]$ClassName = ""
    )

    $all = $Root.FindAll([System.Windows.Automation.TreeScope]::Descendants, [System.Windows.Automation.Condition]::TrueCondition)
    foreach ($el in $all)
    {
        if (-not $el.Current.IsEnabled) { continue }
        $name = ($el.Current.Name -as [string])
        if ([string]::IsNullOrWhiteSpace($name)) { continue }

        if ($ClassName -and $el.Current.ClassName -ne $ClassName) { continue }
        if ($ControlTypes.Count -gt 0 -and $ControlTypes -notcontains $el.Current.ControlType.ProgrammaticName) { continue }

        $match = $false
        foreach ($needle in $Names)
        {
            if ([string]::IsNullOrWhiteSpace($needle)) { continue }
            if ($name -like "*$needle*") { $match = $true; break }
        }

        if (-not $match -and $NormalizedNames.Count -gt 0)
        {
            $norm = Normalize-Text -Text $name
            foreach ($needleNorm in $NormalizedNames)
            {
                if ([string]::IsNullOrWhiteSpace($needleNorm)) { continue }
                if ($norm -like "*$needleNorm*") { $match = $true; break }
            }
        }

        if ($match) { return $el }
    }
    return $null
}

function Click-Element {
    param([System.Windows.Automation.AutomationElement]$Element)
    if ($null -eq $Element) { throw "Elemento nulo." }
    $pattern = $null
    if ($Element.TryGetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern, [ref]$pattern))
    {
        [System.Windows.Automation.InvokePattern]$pattern.Invoke()
        return
    }

    $r = $Element.Current.BoundingRectangle
    $x = [int][Math]::Round(($r.Left + $r.Right) / 2.0)
    $y = [int][Math]::Round(($r.Top + $r.Bottom) / 2.0)
    [NimbusChrome]::ClickAt($x, $y)
}

function Set-EditorText {
    param([string]$Text, [System.Windows.Automation.AutomationElement]$Editor)
    if ($null -eq $Editor) { throw "Editor não encontrado." }

    $r = $Editor.Current.BoundingRectangle
    $x = [int][Math]::Round(($r.Left + $r.Right) / 2.0)
    $y = [int][Math]::Round(($r.Top + $r.Bottom) / 2.0)
    [NimbusChrome]::ClickAt($x, $y)
    Start-Sleep -Milliseconds 120

    [System.Windows.Forms.SendKeys]::SendWait('^a')
    Start-Sleep -Milliseconds 150
    Set-Clipboard -Value " "
    Start-Sleep -Milliseconds 90
    [System.Windows.Forms.SendKeys]::SendWait('^v')
    Start-Sleep -Milliseconds 140

    $chunk = 2500
    for ($i = 0; $i -lt $Text.Length; $i += $chunk)
    {
        $len = [Math]::Min($chunk, $Text.Length - $i)
        Set-Clipboard -Value $Text.Substring($i, $len)
        Start-Sleep -Milliseconds 90
        [System.Windows.Forms.SendKeys]::SendWait('^v')
        Start-Sleep -Milliseconds 100
    }
}

function Read-EditorText {
    param([System.Windows.Automation.AutomationElement]$Editor)
    if ($null -eq $Editor) { throw "Editor não encontrado." }

    $r = $Editor.Current.BoundingRectangle
    $x = [int][Math]::Round(($r.Left + $r.Right) / 2.0)
    $y = [int][Math]::Round(($r.Top + $r.Bottom) / 2.0)
    [NimbusChrome]::ClickAt($x, $y)
    Start-Sleep -Milliseconds 120
    [System.Windows.Forms.SendKeys]::SendWait('^a')
    Start-Sleep -Milliseconds 90
    [System.Windows.Forms.SendKeys]::SendWait('^c')
    Start-Sleep -Milliseconds 260
    return (Get-Clipboard -Raw)
}

function Find-Editor {
    param([System.Windows.Automation.AutomationElement]$Root)
    $all = $Root.FindAll([System.Windows.Automation.TreeScope]::Descendants, [System.Windows.Automation.Condition]::TrueCondition)
    $candidates = @()
    foreach ($el in $all)
    {
        if ($el.Current.ClassName -ne 'form-control') { continue }
        if (-not $el.Current.IsEnabled) { continue }
        if (-not $el.Current.IsKeyboardFocusable) { continue }

        $r = $el.Current.BoundingRectangle
        if (
            [double]::IsNaN($r.Left) -or [double]::IsNaN($r.Top) -or
            [double]::IsNaN($r.Right) -or [double]::IsNaN($r.Bottom) -or
            [double]::IsInfinity($r.Left) -or [double]::IsInfinity($r.Top) -or
            [double]::IsInfinity($r.Right) -or [double]::IsInfinity($r.Bottom)
        ) { continue }
        if ($r.Width -lt 220 -or $r.Height -lt 120) { continue }
        $area = [Math]::Abs(($r.Right - $r.Left) * ($r.Bottom - $r.Top))
        $candidates += [PSCustomObject]@{ Element = $el; Area = $area }
    }
    if ($candidates.Count -eq 0) { return $null }
    return ($candidates | Sort-Object -Property Area -Descending | Select-Object -First 1).Element
}

function Extract-LiveChecksFromCss {
    param([string]$CssText)
    $required = @(
        '.js-product-item-image-container-private.secondary-images-disabled',
        '.item-image-secondary.js-product-item-secondary-image-private[data-srcset*="/file_name-"',
        '.item-image-secondary.js-product-item-secondary-image-private[srcset*="/file_name-"',
        '.item:hover .item-image-secondary.js-product-item-secondary-image-private[data-srcset*="/file_name-"',
        '.item:hover .js-item-product .item-image-secondary.js-product-item-secondary-image-private[data-srcset*="/file_name-"',
        '.nimbus-project-modal__close:hover'
    )

    $ids = [regex]::Matches($CssText, '\[data-product-id=\"(\d+)\"\]\s*\.item-image-secondary') |
        ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique
    foreach ($id in $ids) { $required += "[data-product-id=""$id""] .item-image-secondary" }
    return $required | Sort-Object -Unique
}

function Check-LiveCss {
    param([string[]]$Checks)
    try
    {
        $resp = Invoke-WebRequest -UseBasicParsing -Uri $StoreUrl -TimeoutSec 60
        $html = $resp.Content
    }
    catch
    {
        return [pscustomobject]@{ ok = $false; matchCount = 0; checksCount = $Checks.Count; report = @('request_failed') }
    }

    $style = ""
    [regex]::Matches($html, '<style[^>]*>(.*?)</style>', [System.Text.RegularExpressions.RegexOptions]::Singleline) |
        ForEach-Object { $style += $_.Groups[1].Value + "`n" }

    $ok = 0
    $report = @()
    foreach ($c in $Checks)
    {
        if ($style.Contains($c)) { $ok++ } else { $report += "missing:$c" }
    }
    foreach ($bad in @("chunk", "encheu", "la de x", "lá de x"))
    {
        if ($style.ToLowerInvariant().Contains($bad)) { $report += "bad:$bad" }
    }
    return [pscustomobject]@{
        ok = ($ok -eq $Checks.Count -and $report.Count -eq 0)
        matchCount = $ok
        checksCount = $Checks.Count
        report = $report
    }
}

function Resolve-VersionModal {
    param([System.IntPtr]$WindowHandle, [int]$Retries = 16)
    for ($i = 1; $i -le $Retries; $i++)
    {
        $root = [System.Windows.Automation.AutomationElement]::FromHandle($WindowHandle)
        $btn = Find-UiElement -Root $root `
            -Names @('Salvar essa versão', 'Salvar essa versao', 'Salvar esta versão', 'Salvar esta versao', 'Salvar alterações', 'Salvar alteracoes', 'Guardar alterações', 'Guardar') `
            -NormalizedNames @('salvar essa versao', 'salvar esta versao', 'salvar alteracoes', 'salvar') `
            -ControlTypes @('ControlType.Button', 'ControlType.Hyperlink')

        if ($null -ne $btn)
        {
            Write-Output ("version-modal-save_found:" + $btn.Current.Name)
            Click-Element -Element $btn
            Start-Sleep -Milliseconds 1400
            return $true
        }

        # fallback to close/cancel style button if it appears first in a modal stack
        $btn2 = Find-UiElement -Root $root `
            -Names @('Continuar editando', 'Continuar') `
            -NormalizedNames @('continuar editando', 'continuar') `
            -ControlTypes @('ControlType.Button', 'ControlType.Hyperlink')
        if ($null -ne $btn2)
        {
            Write-Output ("version-modal-alternative_found:" + $btn2.Current.Name)
            Click-Element -Element $btn2
            Start-Sleep -Milliseconds 1400
            return $true
        }

        Start-Sleep -Milliseconds 600
    }
    return $false
}

if (-not (Test-Path -LiteralPath $CssPath)) { throw "Arquivo CSS não encontrado: $CssPath" }
$css = Get-Content -LiteralPath $CssPath -Raw -Encoding UTF8
if ($css.Length -lt 2000) { throw "Arquivo CSS vazio ou muito pequeno." }

$checks = Extract-LiveChecksFromCss -CssText $css
Write-Output ("checks_total=" + $checks.Count)

$handle = [NimbusChrome]::FindChromeWindow('Personalizar')
if ($handle -eq [IntPtr]::Zero) { $handle = [NimbusChrome]::FindChromeWindow('Nuvem') }
if ($handle -eq [IntPtr]::Zero) { $handle = [NimbusChrome]::FindChromeWindow('Nimbus') }
if ($handle -eq [IntPtr]::Zero) { $handle = [NimbusChrome]::FindChromeWindow() }
if ($handle -eq [IntPtr]::Zero) { throw 'Janela do Chrome do Nuvemshop não encontrada.' }

[void][NimbusChrome]::ShowWindowAsync($handle, 3)
[void][NimbusChrome]::SetForegroundWindow($handle)
Start-Sleep -Milliseconds (2 * $WaitMs)
$handleProc = Get-Process | Where-Object { $_.MainWindowHandle -eq $handle } | Select-Object -First 1
Write-Output ('selected_handle=' + $handle)
if ($handleProc) { Write-Output ('selected_title=' + $handleProc.MainWindowTitle) }

$root = [System.Windows.Automation.AutomationElement]::FromHandle($handle)
$editor = Find-Editor -Root $root
if ($null -ne $editor)
{
    Write-Output 'editor_already_open'
}
else
{
$menu = Find-UiElement -Root $root -Names @('Loja online') -NormalizedNames @('loja online') -ControlTypes @('ControlType.Button','ControlType.Hyperlink')
if ($null -ne $menu)
{
    Click-Element -Element $menu
    Start-Sleep -Milliseconds (2 * $WaitMs)
    $root = [System.Windows.Automation.AutomationElement]::FromHandle($handle)
    $layout = Find-UiElement -Root $root -Names @('Editar layout atual', 'Editar layout', 'Layout atual') -NormalizedNames @('editar layout atual', 'editar layout', 'layout atual') -ControlTypes @('ControlType.Button','ControlType.Hyperlink')
    if ($null -ne $layout)
    {
        Click-Element -Element $layout
        Start-Sleep -Milliseconds (2 * $WaitMs)
    }
}
$cssLink = Find-UiElement -Root $root `
    -Names @('Edição de css avançada', 'Edição de CSS avançada', 'Como editar o código da minha loja?') `
    -NormalizedNames @('edicao de css avancada', 'edicao css avancada', 'codigo da minha loja', 'editar css')
if ($null -eq $cssLink)
{
    $cssLink = Find-UiElement -Root $root `
        -Names @('css') `
        -NormalizedNames @('css avancada', 'edicao css')
}
if ($null -eq $cssLink) { throw 'Link de edição de CSS não encontrado.' }
Click-Element -Element $cssLink
Start-Sleep -Milliseconds (2 * $WaitMs)
}

if ($null -eq $editor)
{
    for ($attempt = 0; $attempt -lt 10; $attempt++)
    {
        $root = [System.Windows.Automation.AutomationElement]::FromHandle($handle)
        $editor = Find-Editor -Root $root
        if ($null -ne $editor) { break }
        Start-Sleep -Milliseconds (2 * $WaitMs)
    }
}
if ($null -eq $editor) { throw 'Editor de CSS não encontrado.' }

Set-EditorText -Text $css -Editor $editor
Start-Sleep -Milliseconds (2 * $WaitMs)
$probe = Read-EditorText -Editor $editor
Write-Output ("editor_len=" + $probe.Length)

$testBtn = Find-UiElement -Root ([System.Windows.Automation.AutomationElement]::FromHandle($handle)) `
    -Names @('Testar CSS') -NormalizedNames @('testar css') -ControlTypes @('ControlType.Button','ControlType.Hyperlink')
if ($testBtn) { Click-Element -Element $testBtn; Start-Sleep -Milliseconds (2 * $WaitMs) }
else { Write-Output 'test-css_not_found' }

$root = [System.Windows.Automation.AutomationElement]::FromHandle($handle)
$pubBtn = Find-UiElement -Root $root -Names @('Publicar alterações', 'Publicar') -NormalizedNames @('publicar alteracoes', 'publicar') -ControlTypes @('ControlType.Button')
if ($null -eq $pubBtn) { throw 'Botão Publicar alterações não encontrado.' }
Click-Element -Element $pubBtn
Write-Output 'publish_clicked'
Start-Sleep -Milliseconds 3600

$modalHandled = Resolve-VersionModal -WindowHandle $handle
if ($modalHandled) { Write-Output 'version_modal_handled' } else { Write-Output 'version_modal_not_detected' }

$success = $false
for ($cycle = 1; $cycle -le $LiveCheckCount; $cycle++)
{
    $result = Check-LiveCss -Checks $checks
    Write-Output ("live-cycle={0} ok={1} matched={2}/{3}" -f $cycle, $result.ok, $result.matchCount, $result.checksCount)
    if ($result.ok)
    {
        $success = $true
        break
    }
    if ($result.report.Count -gt 0) { Write-Output ("live-report=" + ($result.report -join '; ')) }
    Start-Sleep -Milliseconds $LiveCheckWaitMs
}

if (-not $success)
{
    throw 'Validação ao vivo falhou. Refaça publicação e confira visualmente.'
}

Write-Output 'DONE'
