# Pack a clean Steam Workshop folder (no git, tools, playtest dumps)
$ErrorActionPreference = 'Stop'
$root = 'C:\git\decolonizaciya'
$dst = 'C:\git\decolonizaciya\dist\workshop'
if (Test-Path $dst) { Remove-Item $dst -Recurse -Force }
New-Item -ItemType Directory -Path $dst | Out-Null

$dirs = @('common','events','gfx','history','interface','localisation')
foreach ($d in $dirs) {
  robocopy (Join-Path $root $d) (Join-Path $dst $d) /E /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null
}
Copy-Item (Join-Path $root 'descriptor.mod') (Join-Path $dst 'descriptor.mod') -Force
Copy-Item (Join-Path $root 'thumbnail.png') (Join-Path $dst 'thumbnail.png') -Force
Copy-Item (Join-Path $root 'README.md') (Join-Path $dst 'README.md') -Force

$size = [math]::Round(((Get-ChildItem $dst -Recurse -File | Measure-Object Length -Sum).Sum)/1MB, 1)
Write-Host "workshop pack $dst  ${size} MB"
