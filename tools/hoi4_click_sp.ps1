# Standalone: focus HOI4, click Single Player, then Load Game path helpers
param(
  [int]$X = 768,
  [int]$Y = 330,
  [int]$DelaySec = 3,
  [string]$Shot = 'c:\git\decolonizaciya\playtest_detached.png'
)
Start-Sleep $DelaySec
Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public static class Det {
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int n);
  [DllImport("user32.dll")] public static extern bool BringWindowToTop(IntPtr h);
  [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);
  [DllImport("user32.dll")] public static extern void mouse_event(uint f, uint dx, uint dy, uint d, UIntPtr e);
  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr h, out uint pid);
  [DllImport("kernel32.dll")] public static extern uint GetCurrentThreadId();
  [DllImport("user32.dll")] public static extern bool AttachThreadInput(uint a, uint b, bool f);
  [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
  public static void Focus(IntPtr h) {
    uint pid; uint wt = GetWindowThreadProcessId(h, out pid);
    uint ct = GetCurrentThreadId();
    AttachThreadInput(ct, wt, true);
    ShowWindow(h, 9); BringWindowToTop(h); SetForegroundWindow(h);
    AttachThreadInput(ct, wt, false);
  }
  public static void Click(int x, int y) {
    SetCursorPos(x, y);
    System.Threading.Thread.Sleep(80);
    mouse_event(0x0002, 0, 0, 0, UIntPtr.Zero);
    System.Threading.Thread.Sleep(50);
    mouse_event(0x0004, 0, 0, 0, UIntPtr.Zero);
  }
}
'@
Add-Type -AssemblyName System.Drawing
$p = Get-Process hoi4 -EA Stop | Select-Object -First 1
[Det]::Focus($p.MainWindowHandle)
Start-Sleep -Milliseconds 500
"FG before=$([Det]::GetForegroundWindow()) hoi=$($p.MainWindowHandle)" | Out-File c:\git\decolonizaciya\playtest_detached.log
# nudge click
[Det]::Click(100, 100)
Start-Sleep -Milliseconds 200
[Det]::Focus($p.MainWindowHandle)
[Det]::Click($X, $Y)
Start-Sleep -Milliseconds 1500
$b = New-Object System.Drawing.Bitmap 1536, 960
$g = [System.Drawing.Graphics]::FromImage($b)
$g.CopyFromScreen(0, 0, 0, 0, (New-Object System.Drawing.Size(1536, 960)))
$g.Dispose()
$b.Save($Shot, [System.Drawing.Imaging.ImageFormat]::Png)
$b.Dispose()
"clicked $X,$Y shot=$Shot FG after=$([Det]::GetForegroundWindow())" | Add-Content c:\git\decolonizaciya\playtest_detached.log
