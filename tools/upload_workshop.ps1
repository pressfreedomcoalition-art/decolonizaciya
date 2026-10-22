# Interactive Steam Workshop upload — type password/Guard in the SteamCMD window
$ErrorActionPreference = 'Stop'
$sc = 'C:\git\decolonizaciya\tools\steamcmd\steamcmd.exe'
$vdf = 'C:\git\decolonizaciya\steam\workshop.vdf'
$log = 'C:\git\decolonizaciya\steam\last_upload.log'

if (-not (Test-Path 'C:\git\decolonizaciya\dist\workshop\descriptor.mod')) {
  & 'C:\git\decolonizaciya\tools\pack_workshop.ps1'
}

Write-Host 'Starting SteamCMD in a new window. Enter Steam password (and Guard code if asked).'
$arg = "+login alexanderthedark88 +workshop_build_item `"$vdf`" +quit"
$p = Start-Process -FilePath $sc -ArgumentList $arg -WorkingDirectory (Split-Path $sc) -Wait -PassThru -NoNewWindow:$false
Write-Host "steamcmd exit $($p.ExitCode)"
Get-Content $vdf
$m = Select-String -Path $vdf -Pattern 'publishedfileid"\s+"(\d+)"'
if ($m -and $m.Matches[0].Groups[1].Value -ne '0') {
  $id = $m.Matches[0].Groups[1].Value
  Write-Host "OK Workshop URL: https://steamcommunity.com/sharedfiles/filedetails/?id=$id"
  $id | Set-Content 'C:\git\decolonizaciya\steam\publishedfileid.txt'
} else {
  Write-Host 'FAIL: publishedfileid still 0 — login or upload failed'
  exit 1
}
