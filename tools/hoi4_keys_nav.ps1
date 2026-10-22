param([int]$DelaySec = 4, [string]$Shot = 'c:\git\decolonizaciya\playtest_keys.png')
Start-Sleep $DelaySec
Add-Type -TypeDefinition @'
using System; using System.Runtime.InteropServices;
public static class KeysNav {
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int n);
  [DllImport("user32.dll")] public static extern bool BringWindowToTop(IntPtr h);
  [DllImport("user32.dll")] public static extern void keybd_event(byte vk, byte scan, uint flags, UIntPtr extra);
  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr h, out uint pid);
  [DllImport("kernel32.dll")] public static extern uint GetCurrentThreadId();
  [DllImport("user32.dll")] public static extern bool AttachThreadInput(uint a, uint b, bool f);
  [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);
  [DllImport("user32.dll")] public static extern void mouse_event(uint f, uint dx, uint dy, uint d, UIntPtr e);
  public static void Focus(IntPtr h) {
    uint pid; uint wt = GetWindowThreadProcessId(h, out pid);
    uint ct = GetCurrentThreadId();
    AttachThreadInput(ct, wt, true);
    ShowWindow(h, 9); BringWindowToTop(h); SetForegroundWindow(h);
    AttachThreadInput(ct, wt, false);
  }
  public static void Tap(byte vk) {
    keybd_event(vk, 0, 0, UIntPtr.Zero);
    System.Threading.Thread.Sleep(40);
    keybd_event(vk, 0, 2, UIntPtr.Zero);
  }
  public static void Click(int x, int y) {
    SetCursorPos(x,y); System.Threading.Thread.Sleep(50);
    mouse_event(0x0002,0,0,0,UIntPtr.Zero); System.Threading.Thread.Sleep(40);
    mouse_event(0x0004,0,0,0,UIntPtr.Zero);
  }
}
'@
Add-Type -AssemblyName System.Drawing
$p = Get-Process hoi4 | Select-Object -First 1
[KeysNav]::Focus($p.MainWindowHandle)
Start-Sleep -Milliseconds 500
# If on MP, try click Back at several spots ABOVE taskbar zone and in bright zone
foreach ($pt in @(@(150,900),@(200,905),@(250,910),@(100,900),@(420,928),@(130,928))) {
  [KeysNav]::Click($pt[0], $pt[1])
  Start-Sleep -Milliseconds 200
}
Start-Sleep 1
# Esc
1..2 | ForEach-Object { [KeysNav]::Tap(0x1B); Start-Sleep -Milliseconds 300 }
Start-Sleep 1
# Click main menu dead zone then use keyboard: assume SP is default highlight, Enter
[KeysNav]::Click(768, 200)  # click logo area to focus menu
Start-Sleep -Milliseconds 300
# Home / Up many times to top of menu, Enter for Single Player
[KeysNav]::Tap(0x24) # Home
Start-Sleep -Milliseconds 200
1..10 | ForEach-Object { [KeysNav]::Tap(0x26); Start-Sleep -Milliseconds 80 } # Up
Start-Sleep -Milliseconds 200
[KeysNav]::Tap(0x0D) # Enter
Start-Sleep 2
$b = New-Object System.Drawing.Bitmap 1536, 960
$g = [System.Drawing.Graphics]::FromImage($b)
$g.CopyFromScreen(0, 0, 0, 0, (New-Object System.Drawing.Size(1536, 960)))
$g.Dispose(); $b.Save($Shot, [System.Drawing.Imaging.ImageFormat]::Png); $b.Dispose()
"keys nav done $(Get-Date -Format HH:mm:ss)" | Set-Content c:\git\decolonizaciya\playtest_keys.log
