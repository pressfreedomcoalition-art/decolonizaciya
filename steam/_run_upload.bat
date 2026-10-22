@echo off
chcp 65001 >nul
echo.
echo === Steam Workshop upload: WW3 Russian Invasion (Alpha) ===
echo Enter Steam password when asked. Enter Guard code if prompted.
echo.
"C:\git\decolonizaciya\tools\steamcmd\steamcmd.exe" +login alexanderthedark88 +workshop_build_item "C:\git\decolonizaciya\steam\workshop.vdf" +quit
echo.
echo Exit code: %ERRORLEVEL%
echo.
pause
