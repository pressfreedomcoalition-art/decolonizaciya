# HOI4 playtest helper: focus window + send console lines
param(
  [string[]]$Commands = @('tag CHU'),
  [int]$LoadWaitSec = 240
)

$ErrorActionPreference = 'Stop'
Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
using System.Text;
public static class Win {
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
  [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll")] public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr extra);
  public const uint KEYUP = 0x0002;
  public static void Tap(byte vk) {
    keybd_event(vk, 0, 0, UIntPtr.Zero);
    keybd_event(vk, 0, KEYUP, UIntPtr.Zero);
  }
}
'@

function Focus-Hoi4 {
  $p = Get-Process hoi4 -EA SilentlyContinue | Select-Object -First 1
  if (-not $p) { throw 'hoi4 not running' }
  [Win]::ShowWindow($p.MainWindowHandle, 9) | Out-Null
  [Win]::SetForegroundWindow($p.MainWindowHandle) | Out-Null
  Start-Sleep -Milliseconds 400
  return $p
}

function Send-Console([string]$line) {
  Focus-Hoi4 | Out-Null
  # Oem3 / tilde = VK 0xC0
  [Win]::Tap(0xC0)
  Start-Sleep -Milliseconds 250
  $wshell = New-Object -ComObject WScript.Shell
  $wshell.SendKeys($line)
  Start-Sleep -Milliseconds 150
  $wshell.SendKeys('{ENTER}')
  Start-Sleep -Milliseconds 200
  [Win]::Tap(0xC0) # close console
  Start-Sleep -Milliseconds 200
}

function Wait-Hoi4Loaded([int]$sec) {
  $deadline = (Get-Date).AddSeconds($sec)
  while ((Get-Date) -lt $deadline) {
    $p = Get-Process hoi4 -EA SilentlyContinue
    if (-not $p) { Start-Sleep 2; continue }
    $ws = [math]::Round($p.WorkingSet64/1MB)
    $log = "$env:USERPROFILE\Documents\Paradox Interactive\Hearts of Iron IV\logs\game.log"
    $hist = $false
    if (Test-Path $log) {
      $hist = Select-String -Path $log -Pattern 'Executing History' -Quiet -EA SilentlyContinue
    }
    Write-Host ("hoi4 WS={0}MB hist={1}" -f $ws, $hist)
    if ($ws -gt 1800 -and $hist) { return $true }
    Start-Sleep 5
  }
  return $false
}

Export-ModuleMember -Function * -EA SilentlyContinue
# If run directly:
if ($MyInvocation.InvocationName -ne '.') {
  Write-Host 'Waiting for load...'
  if (-not (Wait-Hoi4Loaded $LoadWaitSec)) { Write-Host 'WARN: load wait timed out' }
  foreach ($c in $Commands) {
    Write-Host "CONSOLE: $c"
    Send-Console $c
    Start-Sleep 1
  }
}
