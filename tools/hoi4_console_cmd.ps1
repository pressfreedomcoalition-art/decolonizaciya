param(
  [string]$Cmd = 'load FIN_2002_05_25_18',
  [int]$DelaySec = 3,
  [string]$Shot = 'c:\git\decolonizaciya\playtest_afterload.png'
)
Start-Sleep $DelaySec
Add-Type -TypeDefinition @'
using System; using System.Runtime.InteropServices;
public static class Con {
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int n);
  [DllImport("user32.dll")] public static extern bool BringWindowToTop(IntPtr h);
  [DllImport("user32.dll")] public static extern void keybd_event(byte v, byte s, uint f, UIntPtr e);
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
}
'@
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
$p = Get-Process hoi4 | Select-Object -First 1
[Con]::Focus($p.MainWindowHandle)
Start-Sleep -Milliseconds 500
# Click center of game to ensure focus
[System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point(768, 400)
Start-Sleep -Milliseconds 100
# Open console with tilde (OEM3 = 0xC0)
[Con]::Tap(0xC0)
Start-Sleep -Milliseconds 400
# Paste command via clipboard
Set-Clipboard -Value $Cmd
Start-Sleep -Milliseconds 100
# Ctrl+V
[Con]::Tap(0x11) # this taps ctrl alone - bad
# Use SendKeys for paste
$w = New-Object -ComObject WScript.Shell
$w.SendKeys('^v')
Start-Sleep -Milliseconds 200
$w.SendKeys('{ENTER}')
Start-Sleep -Milliseconds 500
[Con]::Tap(0xC0) # close console
Start-Sleep 2
$b = New-Object System.Drawing.Bitmap 1536, 960
$g = [System.Drawing.Graphics]::FromImage($b)
$g.CopyFromScreen(0, 0, 0, 0, (New-Object System.Drawing.Size(1536, 960)))
$g.Dispose(); $b.Save($Shot, [System.Drawing.Imaging.ImageFormat]::Png); $b.Dispose()
"console cmd=$Cmd at $(Get-Date -Format HH:mm:ss)" | Set-Content c:\git\decolonizaciya\playtest_console.log
