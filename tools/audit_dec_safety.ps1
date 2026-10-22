# Decolonizaciya safety audit
# Run: powershell -File tools/audit_dec_safety.ps1
# Exit 1 if any hard failure.

$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
if (-not (Test-Path (Join-Path $root 'descriptor.mod'))) {
  $root = 'C:\git\decolonizaciya'
}

$fail = 0
function Fail($msg) { $script:fail++; Write-Host "FAIL: $msg" -ForegroundColor Red }
function Warn($msg) { Write-Host "WARN: $msg" -ForegroundColor Yellow }
function Ok($msg) { Write-Host "OK: $msg" -ForegroundColor Green }

Write-Host "Auditing $root"

# 1) always=yes on decisions (ignore comments)
Get-ChildItem "$root\common\decisions" -Filter *.txt -Recurse -EA SilentlyContinue | ForEach-Object {
  $lines = Get-Content $_.FullName | Where-Object { $_ -notmatch '^\s*#' }
  $n = (@($lines | Select-String -Pattern 'allowed\s*=\s*\{\s*always\s*=\s*yes\s*\}')).Count
  if ($n -gt 0) { Fail ("{0} has allowed={{always=yes}} x{1}" -f $_.Name, $n) }
}

# 2) braces
$dirs = @('common\decisions','common\decisions\categories','common\national_focus','common\scripted_effects','common\scripted_triggers','events','history\countries','history\states')
foreach ($d in $dirs) {
  $p = Join-Path $root $d
  if (-not (Test-Path $p)) { continue }
  Get-ChildItem $p -Filter *.txt -File -EA SilentlyContinue | ForEach-Object {
    $t = [IO.File]::ReadAllText($_.FullName)
    $o = ([regex]::Matches($t,'\{')).Count; $c = ([regex]::Matches($t,'\}')).Count
    if ($o -ne $c) { Fail ("braces {0}: {1}/{2}" -f $_.Name, $o, $c) }
  }
}

# 3) multi mega on one focus_tree (file may contain several trees)
Get-ChildItem "$root\common\national_focus" -Filter *.txt -EA SilentlyContinue | ForEach-Object {
  $t = [IO.File]::ReadAllText($_.FullName)
  $parts = [regex]::Split($t, '(?=focus_tree\s*=\s*\{)')
  $i = 0
  foreach ($part in $parts) {
    if ($part -notmatch 'focus_tree\s*=') { continue }
    $i++
    $hits = [regex]::Matches($part, 'shared_focus = DEC_(WHT_white_revival|BAW_black_awakening|IND_indigenous_awakening|ASI_asian_awakening|HND_hindu_awakening|CAL_world_caliphate)')
    $ids = @($hits | ForEach-Object { $_.Value }) | Select-Object -Unique
    if ($ids.Count -ge 2) {
      Fail ("{0} tree#{1} attaches {2} megas: {3}" -f $_.Name, $i, $ids.Count, ($ids -join ', '))
    }
  }
}

# 4) country/uprising focus regression
$left = @(Select-String -Path "$root\common\national_focus\*.txt" -Pattern 'id = DEC_\w+_(country_|uprising_)' -EA SilentlyContinue)
if ($left.Count -gt 0) { Fail ("reintroduced country/uprising focuses: {0}" -f $left.Count) }

# 5) blockchain / disabled under history
if (Get-ChildItem "$root\history\states" -Filter '*Blockchain*' -EA SilentlyContinue) {
  Fail 'Blockchain states present under history/states (use disabled_content/)'
}
Get-ChildItem "$root\history" -Recurse -Directory -EA SilentlyContinue | Where-Object { $_.Name -match 'disabled|_disabled' } | ForEach-Object {
  Fail ("disabled folder under history: {0}" -f $_.FullName.Replace($root + '\', ''))
}

# 6) vanilla ideas
$vanilla = 'volunteer_only|free_trade|civilian_economy|limited_conscription|disarmed_nation|partial_economic_mobilisation'
Select-String -Path "$root\history\countries\*.txt" -Pattern "\b($vanilla)\b" -EA SilentlyContinue | ForEach-Object {
  Fail ("vanilla idea in {0}:{1} -> {2}" -f $_.Filename, $_.LineNumber, $_.Line.Trim())
}

# 7) BOM on txt
Get-ChildItem "$root\common","$root\events","$root\history" -Recurse -Filter *.txt -EA SilentlyContinue | ForEach-Object {
  $b = [IO.File]::ReadAllBytes($_.FullName)
  if ($b.Length -ge 3 -and $b[0]-eq 0xEF -and $b[1]-eq 0xBB -and $b[2]-eq 0xBF) {
    Fail ("UTF-8 BOM on script txt: {0}" -f $_.Name)
  }
}

# 8) loc BOM required
Get-ChildItem "$root\localisation" -Recurse -Filter 'DEC_*.yml' -EA SilentlyContinue | ForEach-Object {
  $b = [IO.File]::ReadAllBytes($_.FullName)
  $bom = ($b.Length -ge 3 -and $b[0]-eq 0xEF -and $b[1]-eq 0xBB -and $b[2]-eq 0xBF)
  if (-not $bom) { Fail ("localisation missing BOM: {0}" -f $_.Name) }
}

# 9) portraits
Get-ChildItem "$root\history\countries" -Filter *.txt -EA SilentlyContinue | ForEach-Object {
  $txt = [IO.File]::ReadAllText($_.FullName)
  foreach ($m in [regex]::Matches($txt, '(?s)create_country_leader\s*=\s*\{(.*?)\}')) {
    if ($m.Groups[1].Value -notmatch 'picture\s*=') {
      Fail ("leader without picture: {0}" -f $_.Name)
      break
    }
  }
}

# 10) known bad spark allowed names
$sparks = Join-Path $root 'common\decisions\DEC_mega_sparks.txt'
if (Test-Path $sparks) {
  if (Select-String -Path $sparks -Pattern 'DEC_is_asian_sphere_nation' -Quiet -EA SilentlyContinue) {
    Fail 'DEC_mega_sparks references missing DEC_is_asian_sphere_nation (use DEC_is_asian_nation)'
  }
}

if ($fail -eq 0) { Ok 'all checks passed'; exit 0 }
Write-Host "`n$fail failure(s)" -ForegroundColor Red
exit 1
