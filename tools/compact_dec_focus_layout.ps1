$ErrorActionPreference = 'Stop'
$root = Join-Path (Split-Path $PSScriptRoot -Parent) 'common\national_focus'
$utf8 = New-Object System.Text.UTF8Encoding $false

$MEGA = @(
  'DEC_white_revival_shared.txt','DEC_black_awakening_shared.txt','DEC_indigenous_awakening_shared.txt',
  'DEC_asian_awakening_shared.txt','DEC_hindu_awakening_shared.txt','DEC_caliphate_shared.txt'
)

$ROOT_X = @{
  'DEC_WHT_white_revival'=32; 'DEC_BAW_black_awakening'=36; 'DEC_IND_indigenous_awakening'=36
  'DEC_ASI_asian_awakening'=36; 'DEC_HND_hindu_awakening'=36; 'DEC_CAL_world_caliphate'=28
  'DEC_VOL_tatar_uprising'=12; 'DEC_VOL_erzya_uprising'=20; 'DEC_CSK_kuban_uprising'=28
  'DEC_NOR_bjarmia_uprising'=36; 'DEC_COA_machine_uprising'=44; 'DEC_TUR_call_of_turan'=54
  'DEC_MON_kalmyk_uprising'=62; 'DEC_RST_state_restoration'=70; 'DEC_URA_komi_uprising'=78
  'DEC_SIB_central_uprising'=86; 'DEC_FE_chukotka_uprising'=94
}

$ICONS = @(
  'GFX_goal_generic_national_unity','GFX_goal_generic_major_alliance','GFX_goal_generic_territory_or_war',
  'GFX_goal_generic_political_pressure','GFX_goal_generic_construct_civ_factory','GFX_goal_generic_construct_mil_factory',
  'GFX_goal_generic_construct_infrastructure','GFX_goal_generic_position_armies','GFX_goal_generic_allies_build_infantry',
  'GFX_goal_generic_scientific_exchange','GFX_goal_generic_forceful_treaty','GFX_goal_generic_demand_territory',
  'GFX_goal_generic_more_territorial_claims','GFX_goal_generic_dangerous_deal','GFX_goal_generic_improve_relations',
  'GFX_goal_generic_propaganda','GFX_goal_generic_secret_weapon','GFX_goal_generic_alliance',
  'GFX_goal_generic_occupy_states_ongoing_war','GFX_goal_generic_major_war'
)

function Get-Field([string]$block, [string]$name) {
  $m = [regex]::Match($block, "(?m)^\t$name\s*=\s*(\S+)")
  if ($m.Success) { return $m.Groups[1].Value }
  return $null
}

function Set-Field([string]$block, [string]$name, [string]$value) {
  if ([regex]::IsMatch($block, "(?m)^\t$name\s*=")) {
    return [regex]::Replace($block, "(?m)(^\t$name\s*=\s*)\S+", "`${1}$value", 1)
  }
  return [regex]::Replace($block, "(?m)(^\tid\s*=\s*\S+\r?\n)", "`${1}`t$name = $value`n", 1)
}

function Icon-For([string]$fid, [int]$idx) {
  $fl = $fid.ToLowerInvariant()
  if ($fl -match 'crusade|jihad|wargoal') { return 'GFX_goal_generic_major_war' }
  if ($fl -match 'unite|occupy') { return 'GFX_goal_generic_occupy_states_ongoing_war' }
  if ($fl -match 'declare|call_unity') { return 'GFX_goal_generic_major_alliance' }
  if ($fl -match 'oath|bayah') { return 'GFX_goal_generic_forceful_treaty' }
  if ($fl -match 'industry|plant|civilian') { return 'GFX_goal_generic_construct_civ_factory' }
  if ($fl -match 'arms|defense|materiel') { return 'GFX_goal_generic_construct_mil_factory' }
  if ($fl -match 'rail|infra') { return 'GFX_goal_generic_construct_infrastructure' }
  if ($fl -match 'army|officer|mobil|volunteer') { return 'GFX_goal_generic_allies_build_infantry' }
  if ($fl -match 'university|survey') { return 'GFX_goal_generic_scientific_exchange' }
  if ($fl -match 'drone|blockchain') { return 'GFX_goal_generic_secret_weapon' }
  if ($fl -match 'uprising|attack') { return 'GFX_goal_generic_territory_or_war' }
  if ($fl -match 'reg_') { return $ICONS[$idx % ($ICONS.Count - 2)] }
  return $ICONS[$idx % $ICONS.Count]
}

function Split-Blocks([string]$text) {
  $rx = [regex]'(?m)^(shared_focus|focus)\s*=\s*\{'
  $ms = $rx.Matches($text)
  if ($ms.Count -eq 0) { return @{ Prefix = $text; Chunks = @() } }
  $chunks = New-Object System.Collections.Generic.List[string]
  for ($i=0; $i -lt $ms.Count; $i++) {
    $s = $ms[$i].Index
    $e = if ($i -lt $ms.Count-1) { $ms[$i+1].Index } else { $text.Length }
    $chunks.Add($text.Substring($s, $e-$s))
  }
  return @{ Prefix = $text.Substring(0, $ms[0].Index); Chunks = $chunks }
}

function Compact-Mega([string]$text) {
  $sp = Split-Blocks $text
  $xs = New-Object System.Collections.Generic.List[int]
  foreach ($ch in $sp.Chunks) {
    if (Get-Field $ch 'relative_position_id') {
      $x = Get-Field $ch 'x'
      if ($x -match '^-?\d+$') { $xs.Add([int]$x) }
    }
  }
  $uniq = @($xs | Sort-Object -Unique)
  if ($uniq.Count -eq 0) { return $text }
  $mid = ($uniq.Count - 1) / 2.0
  $map = @{}
  for ($i=0; $i -lt $uniq.Count; $i++) {
    $map[$uniq[$i]] = [int][Math]::Round(($i - $mid) * 2)
  }
  $out = $sp.Prefix
  $i = 0
  foreach ($ch in $sp.Chunks) {
    $fid = Get-Field $ch 'id'
    if ($fid -and $ROOT_X.ContainsKey($fid) -and -not (Get-Field $ch 'relative_position_id')) {
      $ch = Set-Field $ch 'x' ([string]$ROOT_X[$fid])
    }
    if (Get-Field $ch 'relative_position_id') {
      $x = Get-Field $ch 'x'
      if ($x -match '^-?\d+$') { $ch = Set-Field $ch 'x' ([string]$map[[int]$x]) }
      $y = Get-Field $ch 'y'
      if ($y -eq '5') { $ch = Set-Field $ch 'y' '3' }
      elseif ($y -eq '6') { $ch = Set-Field $ch 'y' '4' }
    }
    if ($fid) { $ch = Set-Field $ch 'icon' (Icon-For $fid $i) }
    $out += $ch
    $i++
  }
  return $out
}

function Patch-IconsRoots([string]$text) {
  $sp = Split-Blocks $text
  if ($sp.Chunks.Count -eq 0) {
    return $text.Replace('GFX_focus_generic_support_the_left_right','GFX_goal_generic_national_unity').Replace('GFX_focus_generic_self_management','GFX_goal_generic_construct_civ_factory').Replace('GFX_focus_generic_diplomatic_treaty','GFX_goal_generic_major_alliance').Replace('GFX_focus_generic_treaty','GFX_goal_generic_major_alliance').Replace('GFX_goal_tripartite_pact','GFX_goal_generic_major_alliance')
  }
  $out = $sp.Prefix
  $i = 0
  foreach ($ch in $sp.Chunks) {
    $fid = Get-Field $ch 'id'
    if ($fid -and $ROOT_X.ContainsKey($fid) -and -not (Get-Field $ch 'relative_position_id')) {
      $ch = Set-Field $ch 'x' ([string]$ROOT_X[$fid])
    }
    if ($fid) { $ch = Set-Field $ch 'icon' (Icon-For $fid $i) }
    $out += $ch
    $i++
  }
  return $out
}

function Write-Utf8NoBom($path, $text) {
  [IO.File]::WriteAllText($path, $text, $utf8)
}

foreach ($name in $MEGA) {
  $p = Join-Path $root $name
  Write-Utf8NoBom $p (Compact-Mega ([IO.File]::ReadAllText($p)))
  Write-Host "compacted $name"
}
Get-ChildItem $root -Filter 'DEC_*.txt' | ForEach-Object {
  if ($MEGA -contains $_.Name) { return }
  Write-Utf8NoBom $_.FullName (Patch-IconsRoots ([IO.File]::ReadAllText($_.FullName)))
  Write-Host "icons/roots $($_.Name)"
}
