param(
    [string]$CssPath = "C:\Users\rober\Nimbus\nuvemshop\css-nimbus-correcoes-2026-07-20.css",
    [int]$StepDelayMs = 1000,
    [int]$ExtraWaitMs = 1500
)

$ErrorActionPreference = "Stop"

Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
Add-Type -AssemblyName System.Windows.Forms

Add-Type -TypeDefinition @"
using System;
using System.Text;
using System.Diagnostics;
using System.Runtime.InteropServices;

public static class NimbusLayoutAutomation
{
    private delegate bool EnumWindowsProc(IntPtr hwnd, IntPtr lParam);
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
    private static extern bool EnumWindows(EnumWindowsProc cb, IntPtr lParam);

    [DllImport("user32.dll")]
    private static extern bool IsWindowVisible(IntPtr hWnd);

    [DllImport("user32.dll")]
    private static extern bool GetWindowRect(IntPtr hWnd, out Rect r);

    [DllImport("user32.dll")]
    private static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint processId);

    [DllImport("user32.dll", CharSet = CharSet.Unicode)]
    private static extern int GetClassName(IntPtr hWnd, StringBuilder sb, int max);

    public static IntPtr FindChromeWindow(string titleHint = null)
    {
        IntPtr best = IntPtr.Zero;
        long bestArea = 0;
        string titleNormalized = string.IsNullOrWhiteSpace(titleHint)
            ? string.Empty
            : titleHint.ToLowerInvariant();

        EnumWindows((hwnd, lParam) =>
        {
            if (!IsWindowVisible(hwnd))
            {
                return true;
            }

            uint pid = 0;
            GetWindowThreadProcessId(hwnd, out pid);
            try
            {
                if (!string.Equals(Process.GetProcessById((int)pid).ProcessName, "chrome", StringComparison.OrdinalIgnoreCase))
                {
                    return true;
                }
            }
            catch
            {
                return true;
            }

            var cls = new StringBuilder(128);
            GetClassName(hwnd, cls, cls.Capacity);
            if (cls.ToString() != "Chrome_WidgetWin_1")
            {
                return true;
            }

            Rect rect;
            if (!GetWindowRect(hwnd, out rect))
            {
                return true;
            }
            long width = rect.Right - rect.Left;
            long height = rect.Bottom - rect.Top;
            if (width < 700 || height < 500)
            {
                return true;
            }

            if (!string.IsNullOrWhiteSpace(titleNormalized))
            {
            try
            {
                var title = Process.GetProcessById((int)pid).MainWindowTitle;
                if (string.IsNullOrWhiteSpace(title)) title = string.Empty;
                if (title.ToLowerInvariant().Contains(titleNormalized))
                {
                    best = hwnd;
                    return false;
                    }
                }
                catch
                {
                }
            }

            long area = width * height;
            if (area > bestArea)
            {
                best = hwnd;
                bestArea = area;
            }
            return true;
        }, IntPtr.Zero);

        return best;
    }

    public static string Normalize(string text)
    {
        if (string.IsNullOrWhiteSpace(text))
        {
            return "";
        }
        var decomposed = text.Normalize(System.Text.NormalizationForm.FormD);
        var sb = new StringBuilder();
        foreach (var ch in decomposed.ToCharArray())
        {
            if (System.Globalization.CharUnicodeInfo.GetUnicodeCategory(ch) != System.Globalization.UnicodeCategory.NonSpacingMark)
            {
                sb.Append(ch);
            }
        }
        return sb.ToString().ToLowerInvariant();
    }
}
"@

function Get-NuvemshopRoot {
    param([System.IntPtr]$Handle)
    return [System.Windows.Automation.AutomationElement]::FromHandle($Handle)
}

function Find-FirstElement {
    param(
        [System.Windows.Automation.AutomationElement]$Root,
        [string[]]$Names,
        [string[]]$NormalizedNames = @(),
        [string[]]$ControlTypeNames = @(),
        [string]$NameExact = $false
    )

    $all = $Root.FindAll([System.Windows.Automation.TreeScope]::Descendants, [System.Windows.Automation.Condition]::TrueCondition)
    foreach ($el in $all)
    {
        if (-not $el.Current.IsEnabled)
        {
            continue
        }

    if ($null -eq $el.Current.Name) { $name = "" } else { $name = ($el.Current.Name -as [string]) }
        if ([string]::IsNullOrWhiteSpace($name))
        {
            continue
        }

        $matched = $false
        foreach ($n in $Names)
        {
            if ([string]::IsNullOrWhiteSpace($n))
            {
                continue
            }
            if ($NameExact)
            {
                if ($name -eq $n)
                {
                    $matched = $true
                    break
                }
            }
            elseif ($name -like "*$n*")
            {
                $matched = $true
                break
            }
        }

        if (-not $matched -and $NormalizedNames.Count -gt 0)
        {
            $norm = [NimbusLayoutAutomation]::Normalize($name)
            foreach ($nn in $NormalizedNames)
            {
                if ([string]::IsNullOrWhiteSpace($nn))
                {
                    continue
                }
                if ($norm -like "*$nn*")
                {
                    $matched = $true
                    break
                }
            }
        }

        if (-not $matched)
        {
            continue
        }

        if ($ControlTypeNames.Count -gt 0)
        {
            if ($ControlTypeNames -notcontains $el.Current.ControlType.ProgrammaticName)
            {
                continue
            }
        }

        return $el
    }
    return $null
}

function Invoke-UiElement {
    param([System.Windows.Automation.AutomationElement]$Element)

    if ($null -eq $Element)
    {
        return
    }

    $pattern = $null
    if ($Element.TryGetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern, [ref]$pattern))
    {
        ([System.Windows.Automation.InvokePattern]$pattern).Invoke() | Out-Null
        return
    }

    if ($Element.TryGetCurrentPattern([System.Windows.Automation.SelectionItemPattern]::Pattern, [ref]$pattern))
    {
        ([System.Windows.Automation.SelectionItemPattern]$pattern).Select() | Out-Null
        return
    }

    $rect = $Element.Current.BoundingRectangle
    $x = [int][Math]::Round(($rect.Left + $rect.Right) / 2.0)
    $y = [int][Math]::Round(($rect.Top + $rect.Bottom) / 2.0)
    [System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point($x, $y)
    Start-Sleep -Milliseconds 80
    [System.Windows.Forms.SendKeys]::SendWait("{ENTER}")
}

function Click-Flow {
    param([string[]]$Candidates, [string[]]$NormalizedCandidates, [int]$DelayMs)
    $root = Get-NuvemshopRoot -Handle $handle
    $el = Find-FirstElement -Root $root -Names $Candidates -NormalizedNames $NormalizedCandidates
    if ($null -eq $el)
    {
        return $false
    }
    Write-Output ("clicking: " + $el.Current.Name + " (" + $el.Current.ControlType.ProgrammaticName + ")")
    Invoke-UiElement -Element $el
    Start-Sleep -Milliseconds $DelayMs
    return $true
}

if (-not (Test-Path -LiteralPath $CssPath))
{
    throw "CSS path not found: $CssPath"
}

$css = Get-Content -LiteralPath $CssPath -Raw -Encoding utf8
if ([string]::IsNullOrWhiteSpace($css))
{
    throw "CSS file is empty."
}

$handle = [NimbusLayoutAutomation]::FindChromeWindow('Nimbus')
if ($handle -eq [IntPtr]::Zero)
{
    $handle = [NimbusLayoutAutomation]::FindChromeWindow()
}
if ($handle -eq [IntPtr]::Zero)
{
    throw "Naver Chrome não encontrado."
}

[NimbusLayoutAutomation]::ShowWindowAsync($handle, 3) | Out-Null
[NimbusLayoutAutomation]::SetForegroundWindow($handle) | Out-Null
Start-Sleep -Milliseconds $StepDelayMs

Write-Output "Navegando para Loja online > Editar layout atual"
if (-not (Click-Flow -Candidates @("Loja online") -NormalizedCandidates @("loja online") -DelayMs $StepDelayMs))
{
    throw "Não achei 'Loja online'."
}
if (-not (Click-Flow -Candidates @("Editar layout atual", "Editar layout", "Layout") -NormalizedCandidates @("editar layout atual", "editar layout", "layout atual") -DelayMs $StepDelayMs))
{
    throw "Não achei 'Editar layout atual'."
}
if (-not (Click-Flow -Candidates @("Edição de css avançada", "Edição de CSS avançada", "Como editar o código CSS da minha loja?") -NormalizedCandidates @("edicao de css avancada", "edicao css avancada", "codigo css da minha loja") -DelayMs $StepDelayMs))
{
    throw "Não achei 'Edição de css avançada'."
}

Start-Sleep -Milliseconds $ExtraWaitMs
$root = Get-NuvemshopRoot -Handle $handle
$all = $root.FindAll([System.Windows.Automation.TreeScope]::Descendants, [System.Windows.Automation.Condition]::TrueCondition)
$editor = $null
foreach ($el in $all)
{
    if ($el.Current.ControlType.ProgrammaticName -ne "ControlType.Edit")
    {
        continue
    }
    if ($el.Current.Name -eq "/* CSS */")
    {
        $editor = $el
        break
    }
}
if ($null -eq $editor)
{
    throw "Editor de CSS não encontrado."
}

$valuePattern = $null
if (-not $editor.TryGetCurrentPattern([System.Windows.Automation.ValuePattern]::Pattern, [ref]$valuePattern))
{
    throw "Editor sem ValuePattern, impossível atualizar de forma estável."
}

$vp = [System.Windows.Automation.ValuePattern]$valuePattern
$vp.SetValue($css)
Start-Sleep -Milliseconds 1200

$valueNow = ""
try
{
    $valueNow = $vp.Current.Value
}
catch
{
    $valueNow = ""
}
if ($valueNow.Length -lt 200)
{
    Write-Output "Warning: não confirmei leitura do texto no editor após colar (length=$($valueNow.Length)). Continuando."
}
else
{
    Write-Output "Editor atualizado com sucesso."
}

if (-not (Click-Flow -Candidates @("Testar CSS") -NormalizedCandidates @("testar css") -DelayMs $StepDelayMs))
{
    Write-Output "Botão Testar CSS não encontrado; seguindo sem validação."
}

if (-not (Click-Flow -Candidates @("Publicar alterações") -NormalizedCandidates @("publicar alteracoes", "publicar") -DelayMs $StepDelayMs))
{
    throw "Botão 'Publicar alterações' não encontrado."
}

Start-Sleep -Seconds 6
Write-Output "Publicação enviada. Aguarde e rode verificação em loop no site."
