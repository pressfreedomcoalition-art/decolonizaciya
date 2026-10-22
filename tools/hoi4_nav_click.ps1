param(
  [int]$X = 768,
  [int]$Y = 350,
  [int]$DelaySec = 3,
  [string]$Shot = 'c:\git\decolonizaciya\playtest_nav_pw.png'
)
Start-Sleep $DelaySec
Add-Type -TypeDefinition @'
using System; using System.Runtime.InteropServices;
public static class Nav2 {
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int n);
  [DllImport("user32.dll")] public static extern bool BringWindowToTop(IntPtr h);
  [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);
  [DllImport("user32.dll")] public static extern void mouse_event(uint f, uint dx, uint dy, uint d, UIntPtr e);
  [DllImport("user32.dll")] public static extern bool PrintWindow(IntPtr h, IntPtr hdc, int flags);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr h, out uint pid);
  [DllImport("kernel32.dll")] public static extern uint GetCurrentThreadId();
  [DllImport("user32.dll")] public static extern bool AttachThreadInput(uint a, uint b, bool f);
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int L,T,R,B; }
  public static void Focus(IntPtr h) {
    uint pid; uint wt = GetWindowThreadProcessId(h, out pid);
    uint ct = GetCurrentThreadId();
    AttachThreadInput(ct, wt, true);
    ShowWindow(h, 9); BringWindowToTop(h); SetForegroundWindow(h);
    AttachThreadInput(ct, wt, false);
  }
  public static void Click(int x, int y) {
    SetCursorPos(x, y); System.Threading.Thread.Sleep(80);
    mouse_event(0x0002, 0, 0, 0, UIntPtr.Zero); System.Threading.Thread.Sleep(70);
    mouse_event(0x0004, 0, 0, 0, UIntPtr.Zero);
  }
}
'@
Add-Type -AssemblyName System.Drawing
# Minimize steam
Get-Process | Where-Object { $_.ProcessName -match 'steam' -and $_.MainWindowHandle -ne [IntPtr]::Zero } | ForEach-Object {
  [Nav2]::ShowWindow($_.MainWindowHandle, 6)
}
$p = Get-Process hoi4 | Select-Object -First 1
[Nav2]::Focus($p.MainWindowHandle)
Start-Sleep -Milliseconds 500
[Nav2]::Click($X, $Y)
Start-Sleep -Milliseconds 300
[Nav2]::Click($X, $Y) # double
Start-Sleep 2
$r = New-Object Nav2+RECT
[Nav2]::GetWindowRect($p.MainWindowHandle, [ref]$r) | Out-Null
$bmp = New-Object System.Drawing.Bitmap ($r.R-$r.L), ($r.B-$r.T)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$hdc = $g.GetHdc()
[Nav2]::PrintWindow($p.MainWindowHandle, $hdc, 2) | Out-Null
$g.ReleaseHdc($hdc); $g.Dispose()
$bmp.Save($Shot, [System.Drawing.Imaging.ImageFormat]::Png); $bmp.Dispose()
"clicked $X,$Y (dbl) shot=$Shot $(Get-Date -Format HH:mm:ss)" | Set-Content c:\git\decolonizaciya\playtest_nav.log
