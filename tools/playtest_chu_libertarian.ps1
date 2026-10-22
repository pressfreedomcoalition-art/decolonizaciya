# DEC playtest: load FIN save, tag CHU, Oreshnikov libertarian, run 1 year, save
$ErrorActionPreference = 'Stop'
$docs = Join-Path $env:USERPROFILE 'Documents\Paradox Interactive\Hearts of Iron IV'
$shotDir = 'C:\git\decolonizaciya\tools'
$hoi4exe = Join-Path ${env:ProgramFiles(x86)} 'Steam\steamapps\common\Hearts of Iron IV\hoi4.exe'

if (-not ('DecPlayUi' -as [type])) {
  Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public static class DecPlayUi {
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
  [DllImport("user32.dll")] public static extern bool SetCursorPos(int X, int Y);
  [DllImport("user32.dll")] public static extern void mouse_event(uint dwFlags, uint dx, uint dy, uint dwData, UIntPtr dwExtraInfo);
  [DllImport("user32.dll")] public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr extra);
  [DllImport("user32.dll")] public static extern short GetAsyncKeyState(int vKey);
  public const uint LEFTDOWN = 0x0002, LEFTUP = 0x0004, KEYUP = 0x0002;
  public static void Click(int x, int y) {
    SetCursorPos(x, y);
    System.Threading.Thread.Sleep(40);
    mouse_event(LEFTDOWN, 0, 0, 0, UIntPtr.Zero);
    System.Threading.Thread.Sleep(40);
    mouse_event(LEFTUP, 0, 0, 0, UIntPtr.Zero);
  }
  public static void Tap(byte vk) {
    keybd_event(vk, 0, 0, UIntPtr.Zero);
    keybd_event(vk, 0, KEYUP, UIntPtr.Zero);
  }
}
'@
}
Add-Type -AssemblyName System.Drawing

function Write-Log([string]$m) { Write-Host ("[{0}] {1}" -f (Get-Date -Format 'HH:mm:ss'), $m) }

function Get-Hoi4 {
  Get-Process hoi4 -EA SilentlyContinue | Sort-Object StartTime -Descending | Select-Object -First 1
}

function Focus-Hoi4 {
  $p = Get-Hoi4
  if (-not $p) { throw 'hoi4 not running' }
  [DecPlayUi]::ShowWindow($p.MainWindowHandle, 9) | Out-Null
  [DecPlayUi]::SetForegroundWindow($p.MainWindowHandle) | Out-Null
  Start-Sleep -Milliseconds 350
  return $p
}

function Save-Shot([string]$name) {
  Focus-Hoi4 | Out-Null
  $bmp = New-Object System.Drawing.Bitmap 1536, 960
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.CopyFromScreen(0, 0, 0, 0, $bmp.Size)
  $path = Join-Path $shotDir "_hoi4_$name.png"
  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose()
  Write-Log "shot $path"
  return $path
}

function Send-ConsoleLine([string]$line) {
  Focus-Hoi4 | Out-Null
  [DecPlayUi]::Tap(0xC0) # Oem3 / Ё
  Start-Sleep -Milliseconds 280
  $w = New-Object -ComObject WScript.Shell
  # SendKeys: escape special chars + ^ % ( ) { } ~
  $escaped = $line.Replace('{','{{}').Replace('}','{}}').Replace('+','{+}').Replace('^','{^}').Replace('%','{%}').Replace('~','{~}').Replace('(','{(}').Replace(')','{)}')
  $w.SendKeys($escaped)
  Start-Sleep -Milliseconds 120
  $w.SendKeys('{ENTER}')
  Start-Sleep -Milliseconds 220
  [DecPlayUi]::Tap(0xC0)
  Start-Sleep -Milliseconds 180
  Write-Log "console: $line"
}

function Ensure-Mods {
  $json = '{"enabled_mods":["mod/ugc_2777392649.mod","mod/decolonizaciya.mod"],"disabled_dlcs":[]}'
  [System.IO.File]::WriteAllText((Join-Path $docs 'dlc_load.json'), $json)
  $continue = @"
{
	"title":	"FIN 2002.5.25.18",
	"desc":	"",
	"date":	"Sat Sep 12 01:28:12 2026\n",
	"filename":	"FIN_2002_05_25_18.hoi4",
	"is_remote":	false
}
"@
  [System.IO.File]::WriteAllText((Join-Path $docs 'continue_game.json'), $continue)
}

function Wait-Frontend([int]$sec = 180) {
  $deadline = (Get-Date).AddSeconds($sec)
  while ((Get-Date) -lt $deadline) {
    $p = Get-Hoi4
    if (-not $p) { Start-Sleep 3; continue }
    $ws = [math]::Round($p.WorkingSet64 / 1MB)
    $setup = Join-Path $docs 'logs\setup.log'
    $ready = $false
    if (Test-Path $setup) {
      $ready = Select-String -Path $setup -Pattern 'Startup time' -Quiet -EA SilentlyContinue
    }
    Write-Log ("wait frontend WS={0}MB ready={1}" -f $ws, $ready)
    if ($ws -gt 3000 -and $ready) { return $true }
    if ($ws -gt 3500 -and ((Get-Date) - $p.StartTime).TotalSeconds -gt 110) { return $true }
    Start-Sleep 6
  }
  return $false
}

function Wait-InGameDate([string]$prefix, [int]$sec = 300) {
  $deadline = (Get-Date).AddSeconds($sec)
  $gameLog = Join-Path $docs 'logs\game.log'
  while ((Get-Date) -lt $deadline) {
    $p = Get-Hoi4
    if (-not $p) { return $false }
    $ws = [math]::Round($p.WorkingSet64 / 1MB)
    $dates = @()
    if (Test-Path $gameLog) {
      $txt = Get-Content $gameLog -Raw -EA SilentlyContinue
      $dates = [regex]::Matches($txt, '\[(20\d{2}\.\d{2}\.\d{2})') | ForEach-Object { $_.Groups[1].Value } | Select-Object -Unique
    }
    Write-Log ("wait ingame WS={0} dates={1}" -f $ws, ($dates -join ','))
    if ($dates | Where-Object { $_ -like "$prefix*" }) { return $true }
    Start-Sleep 8
  }
  return $false
}

function Get-LatestGameDate {
  $gameLog = Join-Path $docs 'logs\game.log'
  if (-not (Test-Path $gameLog)) { return $null }
  $txt = Get-Content $gameLog -Raw -EA SilentlyContinue
  $m = [regex]::Matches($txt, '\[(20\d{2}\.\d{2}\.\d{2}(?:\.\d+)?)\]')
  if ($m.Count -eq 0) { return $null }
  return $m[$m.Count - 1].Groups[1].Value
}

# --- main ---
$phase = $args[0]
if (-not $phase) { $phase = 'navigate' }
Write-Log "phase=$phase"
Ensure-Mods

if ($phase -eq 'restart') {
  Get-Process hoi4 -EA SilentlyContinue | Stop-Process -Force
  Start-Sleep 3
  Start-Process -FilePath $hoi4exe -WorkingDirectory (Split-Path $hoi4exe)
  if (-not (Wait-Frontend 200)) { throw 'frontend timeout' }
  Save-Shot 'menu'
  exit 0
}

if ($phase -eq 'back') {
  Focus-Hoi4 | Out-Null
  [DecPlayUi]::Tap(0x1B); Start-Sleep -Milliseconds 500
  foreach ($pt in @( @(420,860), @(450,870), @(380,880), @(500,890), @(400,900) )) {
    Write-Log "click back $($pt[0]),$($pt[1])"
    [DecPlayUi]::Click($pt[0], $pt[1])
    Start-Sleep -Milliseconds 400
  }
  Save-Shot 'after_back'
  exit 0
}

if ($phase -eq 'esc') {
  Focus-Hoi4 | Out-Null
  for ($i=0; $i -lt 5; $i++) {
    [DecPlayUi]::Tap(0x1B)
    Start-Sleep -Milliseconds 400
  }
  Save-Shot 'after_esc'
  exit 0
}

if ($phase -eq 'click') {
  Focus-Hoi4 | Out-Null
  $x = [int]$args[1]; $y = [int]$args[2]
  Write-Log "click $x,$y"
  [DecPlayUi]::Click($x, $y)
  Start-Sleep 1.2
  Save-Shot ("at_${x}_${y}")
  exit 0
}

if ($phase -eq 'console_load') {
  Focus-Hoi4 | Out-Null
  # Open console via Russian ё / Oem3, then load save
  $w = New-Object -ComObject WScript.Shell
  [DecPlayUi]::Tap(0xC0)
  Start-Sleep -Milliseconds 400
  # Also try typing ё
  $w.SendKeys('ё')
  Start-Sleep -Milliseconds 300
  [DecPlayUi]::Tap(0xC0)
  Start-Sleep -Milliseconds 300
  $w.SendKeys('load FIN_2002_05_25_18')
  Start-Sleep -Milliseconds 200
  $w.SendKeys('{ENTER}')
  Start-Sleep 1
  Save-Shot 'after_console_load'
  Write-Log 'sent load'
  exit 0
}

if ($phase -eq 'click_continue') {
  Focus-Hoi4 | Out-Null
  # Singleplayer submenu: Continue usually top item
  foreach ($pt in @( @(650,330), @(650,350), @(650,370), @(650,390), @(650,410), @(650,430) )) {
    Write-Log "click continue/load candidate $($pt[0]),$($pt[1])"
    [DecPlayUi]::Click($pt[0], $pt[1])
    Start-Sleep 1.5
    Save-Shot ("sub_" + $pt[1])
    if (Wait-InGameDate '2002' 20) {
      Write-Log 'LOADED 2002 save'
      exit 0
    }
  }
  exit 1
}

if ($phase -eq 'setup_chu') {
  # Ensure not observe; tag CHU; install leader; politics; speed 5; unpause
  $cmds = @(
    'observe', # toggle off observe if on - running twice may be needed; skip if harmful
    'tag CHU',
    'effect create_country_leader = { name = "Mishshi Oreshnikov" picture = "gfx/leaders/DEC/mishshi_oreshnikov.dds" ideology = Neutral_Libertarian }',
    'effect set_variable = { party_pop_array^16 = 0.55 }',
    'effect set_variable = { ruling_party = 16 }',
    'effect set_politics = { ruling_party = neutrality elections_allowed = yes }',
    'effect recalculate_party = yes',
    'set_var ruling_party 16'
  )
  # First: if CHU may not exist, release from SOV
  Send-ConsoleLine 'tag SOV'
  Start-Sleep 1
  Send-ConsoleLine 'release CHU'
  Start-Sleep 2
  Send-ConsoleLine 'tag CHU'
  Start-Sleep 1
  foreach ($c in @(
    'effect create_country_leader = { name = "Mishshi Oreshnikov" picture = "gfx/leaders/DEC/mishshi_oreshnikov.dds" ideology = Neutral_Libertarian }',
    'effect set_variable = { party_pop_array^16 = 0.55 }',
    'effect set_variable = { ruling_party = 16 }',
    'effect set_politics = { ruling_party = neutrality elections_allowed = yes }',
    'effect recalculate_party = yes'
  )) {
    Send-ConsoleLine $c
    Start-Sleep 1
  }
  # Max speed: press + or 5 key for speed? HOI4 uses +/= or numpad / keys 1-5. Try Ctrl+5 or just send speed via console if exists.
  # Console: no direct speed cmd in all versions; use keyboard +++++
  Focus-Hoi4 | Out-Null
  $w = New-Object -ComObject WScript.Shell
  # Pause toggle SPACE then increase speed with + five times then unpause
  $w.SendKeys(' ')
  Start-Sleep -Milliseconds 300
  for ($i = 0; $i -lt 6; $i++) { $w.SendKeys('{+}'); Start-Sleep -Milliseconds 120 }
  $w.SendKeys(' ') # unpause
  Write-Log 'speed up + unpause done'
  Save-Shot 'chu_setup'
  exit 0
}

if ($phase -eq 'run_year') {
  $start = Get-LatestGameDate
  Write-Log "start date=$start"
  $targetYear = 2003
  if ($start -match '^(\d{4})') {
    $targetYear = [int]$Matches[1] + 1
  }
  Write-Log "target year prefix=$targetYear"
  $deadline = (Get-Date).AddMinutes(90)
  $last = $start
  while ((Get-Date) -lt $deadline) {
    if (-not (Get-Hoi4)) {
      Write-Log 'CTD detected'
      exit 2
    }
    $d = Get-LatestGameDate
    if ($d) { $last = $d }
    Write-Log "date=$last WS=$([math]::Round((Get-Hoi4).WorkingSet64/1MB))MB"
    if ($last -like "$targetYear*") {
      Write-Log 'year elapsed'
      # pause
      Focus-Hoi4 | Out-Null
      $w = New-Object -ComObject WScript.Shell
      $w.SendKeys(' ')
      Start-Sleep 1
      Send-ConsoleLine 'save DEC_CHU_libertarian_2003'
      Start-Sleep 5
      $savePath = Join-Path $docs 'save games\DEC_CHU_libertarian_2003.hoi4'
      if (Test-Path $savePath) { Write-Log "SAVED $savePath"; exit 0 }
      # alternate extension / name
      $alt = Get-ChildItem (Join-Path $docs 'save games') -Filter '*DEC_CHU_libertarian*' -EA SilentlyContinue | Select-Object -First 1
      if ($alt) { Write-Log "SAVED $($alt.FullName)"; exit 0 }
      Write-Log 'save command sent but file not found yet'
      exit 3
    }
    # keep focus occasionally; dismiss pause popups with enter
    if ((Get-Random) -lt 10) {
      Focus-Hoi4 | Out-Null
      $w = New-Object -ComObject WScript.Shell
      $w.SendKeys('{ENTER}')
    }
    Start-Sleep 20
  }
  Write-Log "timeout last=$last"
  exit 4
}

Write-Log "unknown phase $phase"
exit 9
