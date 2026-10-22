param([int]$DelaySec = 3, [string]$Shot = 'c:\git\decolonizaciya\playtest_esc2.png')
Start-Sleep $DelaySec
Add-Type -TypeDefinition @'
using System; using System.Runtime.InteropServices;
public static class Esc {
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int n);
  [DllImport("user32.dll")] public static extern bool BringWindowToTop(IntPtr h);
  [DllImport("user32.dll")] public static extern void keybd_event(byte vk, byte scan, uint flags, UIntPtr extra);
  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr h, out uint pid);
  [DllImport("kernel32.dll")] public static extern uint GetCurrentThreadId();
  [DllImport("user32.dll")] public static extern bool AttachThreadInput(uint a, uint b, bool f);
  public static void Focus(IntPtr h) {
    uint pid; uint wt = GetWindowThreadProcessId(h, out pid);
    uint ct = GetCurrentThreadId();
    AttachThreadInput(ct, wt, true);
    ShowWindow(h, 9); BringWindowToTop(h); SetForegroundWindow(h);
    AttachThreadInput(ct, wt, false);
  }
  public static void Tap(byte vk) {
    keybd_event(vk, 0, 0, UIntPtr.Zero);
    System.Threading.Thread.Sleep(50);
    keybd_event(vk, 0, 2, UIntPtr.Zero);
  }
}
'@
Add-Type -AssemblyName System.Drawing
$p = Get-Process hoi4 | Select-Object -First 1
[Esc]::Focus($p.MainWindowHandle)
Start-Sleep -Milliseconds 400
1..3 | ForEach-Object { [Esc]::Tap(0x1B); Start-Sleep -Milliseconds 400 }
Start-Sleep 1
$b = New-Object System.Drawing.Bitmap 1536, 960
$g = [System.Drawing.Graphics]::FromImage($b)
$g.CopyFromScreen(0, 0, 0, 0, (New-Object System.Drawing.Size(1536, 960)))
$g.Dispose(); $b.Save($Shot, [System.Drawing.Imaging.ImageFormat]::Png); $b.Dispose()
"esc done $(Get-Date -Format HH:mm:ss)" | Set-Content c:\git\decolonizaciya\playtest_esc2.log
