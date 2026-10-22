# CHU libertarian 1-year playtest: load latest FIN 2002 save, tag CHU, Oreshnikov, run ~1 year, pause+save
$ErrorActionPreference = 'Continue'
$docs = "$env:USERPROFILE\Documents\Paradox Interactive\Hearts of Iron IV"
$logDir = "$docs\logs"
$runLog = 'c:\git\decolonizaciya\playtest_run.log'
$saveName = 'DEC_CHU_libertarian_year'
$hoi = 'C:\Program Files (x86)\Steam\steamapps\common\Hearts of Iron IV\hoi4.exe'

Add-Type -TypeDefinition @'
using System; using System.Runtime.InteropServices;
public static class HoiUi {
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int n);
  [DllImport("user32.dll")] public static extern bool BringWindowToTop(IntPtr h);
  [DllImport("user32.dll")] public static extern bool PostMessage(IntPtr h, uint Msg, IntPtr w, IntPtr l);
  [DllImport("user32.dll")] public static extern bool PrintWindow(IntPtr h, IntPtr hdc, int flags);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern void keybd_event(byte v, byte s, uint f, UIntPtr e);
  [DllImport("user32.dll")] public static extern IntPtr LoadKeyboardLayout(string k, uint f);
  [DllImport("user32.dll")] public static extern IntPtr ActivateKeyboardLayout(IntPtr h, uint f);
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int L,T,R,B; }
  public static void Click(IntPtr h, int x, int y) {
    IntPtr lp = (IntPtr)((y << 16) | (x & 0xFFFF));
    PostMessage(h, 0x0200, IntPtr.Zero, lp);
    System.Threading.Thread.Sleep(50);
    PostMessage(h, 0x0201, (IntPtr)1, lp);
    System.Threading.Thread.Sleep(60);
    PostMessage(h, 0x0202, IntPtr.Zero, lp);
  }
  public static void Tap(byte vk) {
    keybd_event(vk, 0, 0, UIntPtr.Zero);
    System.Threading.Thread.Sleep(40);
    keybd_event(vk, 0, 2, UIntPtr.Zero);
  }
  public static void En() { ActivateKeyboardLayout(LoadKeyboardLayout("00000409", 1), 0); }
}
'@
Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Windows.Forms

function Log($m) {
  $line = "$(Get-Date -Format HH:mm:ss) $m"
  Write-Host $line
  Add-Content $runLog $line -Encoding UTF8
}
function Get-Hoi {
  Get-Process hoi4 -EA SilentlyContinue |
    Where-Object { $_.WorkingSet64 -gt 400MB } |
    Sort-Object WorkingSet64 -Descending |
    Select-Object -First 1
}
function Focus-Hoi {
  $p = Get-Hoi; if (-not $p) { return $null }
  [HoiUi]::ShowWindow($p.MainWindowHandle, 9) | Out-Null
  [HoiUi]::BringWindowToTop($p.MainWindowHandle) | Out-Null
  [HoiUi]::SetForegroundWindow($p.MainWindowHandle) | Out-Null
  return $p
}
function Shot($name) {
  $p = Get-Hoi; if (-not $p) { return }
  $r = New-Object HoiUi+RECT
  [HoiUi]::GetWindowRect($p.MainWindowHandle, [ref]$r) | Out-Null
  $w = [Math]::Max(1, $r.R - $r.L); $h = [Math]::Max(1, $r.B - $r.T)
  $bmp = New-Object System.Drawing.Bitmap $w, $h
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $hdc = $g.GetHdc()
  [HoiUi]::PrintWindow($p.MainWindowHandle, $hdc, 2) | Out-Null
  $g.ReleaseHdc($hdc); $g.Dispose()
  $bmp.Save("c:\git\decolonizaciya\$name", [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
}
function Console-Paste([string]$text) {
  $p = Focus-Hoi; if (-not $p) { return }
  [HoiUi]::En()
  Start-Sleep -Milliseconds 250
  [HoiUi]::Tap(0xC0)
  Start-Sleep -Milliseconds 400
  Set-Clipboard -Value $text
  $w = New-Object -ComObject WScript.Shell
  $w.SendKeys('^v')
  Start-Sleep -Milliseconds 200
  $w.SendKeys('{ENTER}')
  Start-Sleep -Milliseconds 500
  [HoiUi]::Tap(0xC0)
  Log "console: $text"
}
function Game-Dates {
  $path = "$logDir\game.log"
  if (-not (Test-Path $path)) { return @() }
  $gl = Get-Content $path -Raw -EA SilentlyContinue
  if (-not $gl) { return @() }
  return [regex]::Matches($gl, '\[(20\d{2}\.\d{2}\.\d{2})') | ForEach-Object { $_.Groups[1].Value } | Select-Object -Unique
}

# --- boot ---
Log '=== PLAYTEST START ==='
Get-Process | Where-Object { $_.ProcessName -match 'Paradox Launcher' } | Stop-Process -Force -EA SilentlyContinue
if (-not (Get-Hoi)) {
  $utf8 = New-Object System.Text.UTF8Encoding $false
  $json = "{`n`t`"title`":`t`"Финляндия 2002.5.25.18`",`n`t`"desc`":`t`"`",`n`t`"date`":`t`"Sat Sep 12 01:28:12 2026\n`",`n`t`"filename`":`t`"DEC_FIN_2002.hoi4`",`n`t`"is_remote`":`tfalse`n}`n"
  [System.IO.File]::WriteAllText("$docs\continue_game.json", $json, $utf8)
  [System.IO.File]::WriteAllText("$docs\dlc_load.json", '{"enabled_mods":["mod/ugc_2777392649.mod","mod/decolonizaciya.mod"],"disabled_dlcs":[]}', $utf8)
  Remove-Item "$logDir\game.log","$logDir\error.log" -Force -EA SilentlyContinue
  Start-Process $hoi -WorkingDirectory (Split-Path $hoi)
  Log 'launched hoi4.exe'
}

$deadline = (Get-Date).AddMinutes(8)
$atMenu = $false
while ((Get-Date) -lt $deadline) {
  $p = Get-Hoi
  if (-not $p) { Start-Sleep 4; continue }
  $ws = [math]::Round($p.WorkingSet64/1MB)
  $reset = $false
  if (Test-Path "$logDir\game.log") { $reset = [bool](Select-String -Path "$logDir\game.log" -Pattern 'Resetting' -Quiet -EA SilentlyContinue) }
  Log "boot WS=$ws reset=$reset"
  if ($reset) { Start-Sleep 50; $atMenu = $true; break }
  Start-Sleep 6
}
if (-not $atMenu) { Log 'FAIL: never reached menu'; exit 2 }

Get-Process | Where-Object { $_.ProcessName -match 'Paradox Launcher' } | Stop-Process -Force -EA SilentlyContinue
Get-Process | Where-Object { $_.ProcessName -match '^steam$' -and $_.MainWindowHandle -ne [IntPtr]::Zero } | ForEach-Object { [HoiUi]::ShowWindow($_.MainWindowHandle, 6) }

function Test-ContinueScreen {
  $path = 'c:\git\decolonizaciya\playtest_sp.png'
  if (-not (Test-Path $path)) { return $false }
  $b = [System.Drawing.Bitmap]::FromFile($path)
  $n = 0
  for ($y = 355; $y -le 362; $y++) {
    for ($x = 700; $x -le 850; $x++) {
      $c = $b.GetPixel($x, $y)
      $l = [int](0.3 * $c.R + 0.59 * $c.G + 0.11 * $c.B)
      if ($l -gt 130) { $n++ }
    }
  }
  $b.Dispose()
  return ($n -gt 80)
}

$p = Focus-Hoi
Start-Sleep 2
Shot 'playtest_menu.png'

$openedSp = $false
foreach ($try in 1..4) {
  $p = Focus-Hoi
  Log "click Single Player 768,270 try=$try"
  [HoiUi]::Click($p.MainWindowHandle, 768, 270)
  Start-Sleep 4
  Shot 'playtest_sp.png'
  if (Test-ContinueScreen) { $openedSp = $true; Log 'SP submenu confirmed (Continue visible)'; break }
  Log 'SP submenu not confirmed — retry'
  Start-Sleep 1
}
if (-not $openedSp) { Log 'FAIL: could not open Single Player submenu'; exit 2 }

Log 'click Continue 768,358'
$p = Focus-Hoi
[HoiUi]::Click($p.MainWindowHandle, 768, 358)

$loaded = $false
$deadline = (Get-Date).AddMinutes(10)
while ((Get-Date) -lt $deadline) {
  $p = Get-Hoi
  if (-not $p) { Log 'CTD during save load'; exit 3 }
  $ws = [math]::Round($p.WorkingSet64/1MB)
  $dates = Game-Dates
  $ds = ($dates -join ',')
  Log "loadwait WS=$ws dates=$ds"
  if ($ds -match '2002') { $loaded = $true; break }
  Start-Sleep 8
}
if (-not $loaded) { Log 'FAIL: 2002 save not in log'; exit 4 }

Start-Sleep 20
Shot 'playtest_ingame_fin.png'
Log '2002 save loaded — tagging CHU'

Console-Paste 'tag CHU'
Start-Sleep 2
Console-Paste 'set_ruling_party neutrality'
Start-Sleep 1
Console-Paste 'effect = { create_country_leader = { name = "Mishshi Oreshnikov" picture = "gfx/leaders/DEC/mishshi_oreshnikov.dds" ideology = Neutral_Libertarian } set_variable = { party_pop_array^16 = 0.55 } set_politics = { ruling_party = neutrality elections_allowed = yes } }'
Start-Sleep 2
Shot 'playtest_chu_setup.png'

Console-Paste 'FastForward'
$p = Focus-Hoi
$w = New-Object -ComObject WScript.Shell
$w.SendKeys('5')
Start-Sleep -Milliseconds 200
$w.SendKeys(' ')
Log 'Running speed 5 — wait ~1 in-game year (budget 45 min)'

$start = Get-Date
$budgetMin = 45
while (((Get-Date) - $start).TotalMinutes -lt $budgetMin) {
  $p = Get-Hoi
  if (-not $p) {
    Log 'CRASH during year'
    if (Test-Path "$logDir\error.log") {
      Select-String -Path "$logDir\error.log" -Pattern 'DEC_|Error' -EA SilentlyContinue | Select-Object -Last 25 | ForEach-Object { Log $_.Line }
    }
    exit 5
  }
  $elapsed = [int](((Get-Date) - $start).TotalMinutes)
  $ws = [math]::Round($p.WorkingSet64/1MB)
  $dates = Game-Dates
  if ($elapsed -gt 0 -and ($elapsed % 5 -eq 0)) {
    Log "alive ${elapsed}min WS=$ws dates=$($dates -join ',')"
    Shot "playtest_alive_${elapsed}m.png"
  }
  # If game.log already shows 2003.05+ we can stop early
  if (($dates -join ',') -match '2003\.0[5-9]|2003\.1|2004') {
    Log "in-game year reached via log dates=$($dates -join ',')"
    break
  }
  Start-Sleep 60
}

$p = Focus-Hoi
$w = New-Object -ComObject WScript.Shell
$w.SendKeys(' ')
Start-Sleep 2
Log 'paused'
Shot 'playtest_paused.png'
Console-Paste "save $saveName"
Start-Sleep 8

$savePath = Get-ChildItem "$docs\save games" -Filter "*$saveName*" -EA SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1
$newest = Get-ChildItem "$docs\save games" | Sort-Object LastWriteTime -Descending | Select-Object -First 5
if ($savePath) {
  Log "SUCCESS save: $($savePath.FullName) $($savePath.LastWriteTime)"
  exit 0
} else {
  Log 'WARN named save missing; newest saves:'
  $newest | ForEach-Object { Log ("  {0} {1}" -f $_.Name, $_.LastWriteTime) }
  exit 6
}
