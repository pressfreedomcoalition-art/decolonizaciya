$ErrorActionPreference = 'Stop'
$root = 'C:\git\decolonizaciya\common\national_focus'
$files = Get-ChildItem $root -Filter *.txt -File
$blocks = @{}

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
      absx = $null; absy = $null
    }
  }
}
foreach ($f in $files) { Parse-File $f.FullName }

function Resolve([string]$id, $stack) {
  if (-not $blocks.ContainsKey($id)) { return $null }
  $b = $blocks[$id]
  if ($null -ne $b.absx) { return $b }
  if ($stack.Contains($id)) { throw "cycle $id" }
  [void]$stack.Add($id)
  if ($b.rel) {
    $p = Resolve $b.rel $stack
    if ($null -eq $p) { $b.absx = $b.x; $b.absy = $b.y }
    else { $b.absx = $p.absx + $b.x; $b.absy = $p.absy + $b.y }
  } else { $b.absx = $b.x; $b.absy = $b.y }
  [void]$stack.Remove($id)
  return $b
}
foreach ($id in @($blocks.Keys)) { [void](Resolve $id (New-Object 'System.Collections.Generic.HashSet[string]')) }

function Collect-Descendants([string]$rootId) {
  $set = New-Object System.Collections.Generic.HashSet[string]
  [void]$set.Add($rootId)
  $changed = $true
  while ($changed) {
    $changed = $false
    foreach ($id in @($blocks.Keys)) {
      $b = $blocks[$id]
      if ($b.rel -and $set.Contains($b.rel) -and -not $set.Contains($id)) {
        [void]$set.Add($id); $changed = $true
      }
    }
  }
  return $set
}

$shares = @(
  'DEC_CHU_pol_root','DEC_CHU_vbg_restore','DEC_CHU_lib_bc','DEC_CHU_lib_coin','DEC_CHU_war_in',
  'DEC_VOL_tatar_uprising','DEC_VOL_erzya_uprising','DEC_CAU_chechnya_uprising','DEC_COA_machine_uprising',
  'DEC_RST_state_restoration','DEC_NOR_bjarmia_uprising','DEC_TUR_call_of_turan','DEC_MON_kalmyk_uprising',
  'DEC_URA_komi_uprising','DEC_SIB_central_uprising','DEC_FE_chukotka_uprising','DEC_CSK_kuban_uprising',
  'DEC_VOL_local_council'
)
$ids = New-Object System.Collections.Generic.HashSet[string]
foreach ($s in $shares) {
  if ($blocks.ContainsKey($s)) {
    foreach ($d in Collect-Descendants $s) { [void]$ids.Add($d) }
  }
}
# local council
[void]$ids.Add('DEC_VOL_local_council')

$byCell = @{}
foreach ($id in $ids) {
  if (-not $blocks.ContainsKey($id)) { continue }
  $b = $blocks[$id]
  $key = "$($b.absx),$($b.absy)"
  if (-not $byCell.ContainsKey($key)) { $byCell[$key] = New-Object System.Collections.Generic.List[string] }
  $byCell[$key].Add($id)
}
$hits = $byCell.GetEnumerator() | Where-Object { $_.Value.Count -gt 1 }
if (-not $hits) { Write-Host 'NO COLLISIONS' }
else {
  foreach ($h in $hits) {
    Write-Host ("({0}): {1}" -f $h.Key, ($h.Value -join ', '))
  }
}
