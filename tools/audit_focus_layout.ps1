# Detect absolute (x,y) collisions among shared focuses attached to each focus_tree.
# Resolves relative_position_id chains.
$ErrorActionPreference = 'Stop'
$root = 'C:\git\decolonizaciya\common\national_focus'
$utf8 = New-Object System.Text.UTF8Encoding $false

# Load all shared_focus / focus blocks from DEC_* and 05_subject / access wrappers
$files = Get-ChildItem $root -Filter *.txt -File
$blocks = @{} # id -> @{x;y;rel;file}

function Parse-File([string]$path) {
  $text = [IO.File]::ReadAllText($path)
  $rx = [regex]'(?ms)^(shared_focus|focus)\s*=\s*\{(.*?)^\}'
  foreach ($m in $rx.Matches($text)) {
    $body = $m.Groups[2].Value
    $idm = [regex]::Match($body, '(?m)^\tid\s*=\s*(\S+)')
    if (-not $idm.Success) { continue }
    $id = $idm.Groups[1].Value
    $xm = [regex]::Match($body, '(?m)^\tx\s*=\s*(-?\d+)')
    $ym = [regex]::Match($body, '(?m)^\ty\s*=\s*(-?\d+)')
    $rm = [regex]::Match($body, '(?m)^\trelative_position_id\s*=\s*(\S+)')
    $blocks[$id] = @{
      x = if ($xm.Success) { [int]$xm.Groups[1].Value } else { 0 }
      y = if ($ym.Success) { [int]$ym.Groups[1].Value } else { 0 }
      rel = if ($rm.Success) { $rm.Groups[1].Value } else { $null }
      file = [IO.Path]::GetFileName($path)
      absx = $null
      absy = $null
    }
  }
}

foreach ($f in $files) { Parse-File $f.FullName }

function Resolve([string]$id, [System.Collections.Generic.HashSet[string]]$stack) {
  if (-not $blocks.ContainsKey($id)) { return $null }
  $b = $blocks[$id]
  if ($null -ne $b.absx) { return $b }
  if ($stack.Contains($id)) { throw "cycle $id" }
  [void]$stack.Add($id)
  if ($b.rel) {
    $p = Resolve $b.rel $stack
    if ($null -eq $p) {
      $b.absx = $b.x; $b.absy = $b.y
    } else {
      $b.absx = $p.absx + $b.x
      $b.absy = $p.absy + $b.y
    }
  } else {
    $b.absx = $b.x; $b.absy = $b.y
  }
  [void]$stack.Remove($id)
  return $b
}

foreach ($id in @($blocks.Keys)) {
  [void](Resolve $id (New-Object 'System.Collections.Generic.HashSet[string]'))
}

# Parse focus_tree shared_focus lists
$trees = @{}
foreach ($f in $files) {
  $text = [IO.File]::ReadAllText($f.FullName)
  $trx = [regex]'(?ms)^focus_tree\s*=\s*\{(.*?)(?=^focus_tree\s*=|\z)'
  foreach ($tm in $trx.Matches($text)) {
    $tbody = $tm.Groups[1].Value
    $idm = [regex]::Match($tbody, '(?m)^\tid\s*=\s*(\S+)')
    if (-not $idm.Success) { continue }
    $tid = $idm.Groups[1].Value
    $shares = [regex]::Matches($tbody, '(?m)^\tshared_focus\s*=\s*(\S+)') | ForEach-Object { $_.Groups[1].Value }
    # also collect local focus = { id = } absolute roots in this tree
    $localIds = New-Object System.Collections.Generic.List[string]
    foreach ($s in $shares) { $localIds.Add($s) }
    $frx = [regex]'(?ms)^\tfocus\s*=\s*\{(.*?)^\t\}'
    foreach ($fm in $frx.Matches($tbody)) {
      $fidm = [regex]::Match($fm.Groups[1].Value, '(?m)^\t\tid\s*=\s*(\S+)')
      if ($fidm.Success) { $localIds.Add($fidm.Groups[1].Value) }
    }
    $trees[$tid] = @{ file = [IO.Path]::GetFileName($f.FullName); roots = @($localIds) }
  }
}

# Expand shared root to all descendants that share relative chain from that root
function Collect-Descendants([string]$rootId) {
  $set = New-Object System.Collections.Generic.HashSet[string]
  [void]$set.Add($rootId)
  $changed = $true
  while ($changed) {
    $changed = $false
    foreach ($id in @($blocks.Keys)) {
      $b = $blocks[$id]
      if ($b.rel -and $set.Contains($b.rel) -and -not $set.Contains($id)) {
        [void]$set.Add($id)
        $changed = $true
      }
    }
  }
  return $set
}

$fail = 0
foreach ($tid in ($trees.Keys | Sort-Object)) {
  $t = $trees[$tid]
  $ids = New-Object System.Collections.Generic.HashSet[string]
  foreach ($r in $t.roots) {
    foreach ($d in (Collect-Descendants $r)) { [void]$ids.Add($d) }
  }
  $byPos = @{}
  foreach ($id in $ids) {
    if (-not $blocks.ContainsKey($id)) { continue }
    $b = $blocks[$id]
    if ($null -eq $b.absx) { continue }
    $key = "$($b.absx),$($b.absy)"
    if (-not $byPos.ContainsKey($key)) { $byPos[$key] = New-Object System.Collections.Generic.List[string] }
    $byPos[$key].Add($id)
  }
  $coll = @($byPos.GetEnumerator() | Where-Object { $_.Value.Count -gt 1 })
  if ($coll.Count -gt 0) {
    Write-Host "COLLIDE $tid ($($t.file))" -ForegroundColor Red
    foreach ($c in $coll) {
      Write-Host ("  ({0}): {1}" -f $c.Key, ($c.Value -join ', '))
    }
    $fail += $coll.Count
  } else {
    Write-Host "OK $tid" -ForegroundColor Green
  }

  # mega count
  $megas = @($t.roots | Where-Object { $_ -match '^DEC_(WHT_white_revival|BAW_black_awakening|IND_indigenous_awakening|ASI_asian_awakening|HND_hindu_awakening|CAL_world_caliphate)$' })
  if ($megas.Count -gt 1) {
    Write-Host "MULTI-MEGA $tid : $($megas -join ', ')" -ForegroundColor Yellow
  }
}

Write-Host "`n$total collisions cells: $fail"
if ($fail -gt 0) { exit 1 } else { exit 0 }
