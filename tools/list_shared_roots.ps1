$ErrorActionPreference = 'Stop'
$files = Get-ChildItem 'c:\git\decolonizaciya\common\national_focus\DEC_*.txt'
$roots = @()
foreach ($f in $files) {
  $c = Get-Content $f.FullName -Raw
  $matches = [regex]::Matches($c, 'shared_focus\s*=\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}', [System.Text.RegularExpressions.RegexOptions]::Singleline)
  foreach ($m in $matches) {
    $b = $m.Groups[1].Value
    if ($b -match 'relative_position_id') { continue }
    if ($b -notmatch 'id\s*=\s*(\S+)') { continue }
    $id = $Matches[1]
    $x = $null; $y = $null
    if ($b -match '(?m)^\s*x\s*=\s*(-?\d+)') { $x = [int]$Matches[1] }
    if ($b -match '(?m)^\s*y\s*=\s*(-?\d+)') { $y = [int]$Matches[1] }
    if ($null -ne $x) {
      $roots += [pscustomobject]@{ File = $f.Name; Id = $id; X = $x; Y = $y }
    }
  }
}
$roots | Sort-Object X, Y, Id | Format-Table -AutoSize
Write-Host "---"
Write-Host "Count:" $roots.Count
