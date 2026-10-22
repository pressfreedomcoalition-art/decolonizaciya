param([int]$DelaySec = 3)
Start-Sleep $DelaySec
Add-Type -TypeDefinition @'
using System; using System.Runtime.InteropServices;
public static class Con2 {
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int n);
  [DllImport("user32.dll")] public static extern bool BringWindowToTop(IntPtr h);
  [DllImport("user32.dll")] public static extern void keybd_event(byte v, byte s, uint f, UIntPtr e);
  [DllImport("user32.dll")] public static extern IntPtr LoadKeyboardLayout(string pwszKLID, uint Flags);
  [DllImport("user32.dll")] public static extern IntPtr ActivateKeyboardLayout(IntPtr hkl, uint Flags);
  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr h, out uint pid);
  [DllImport("kernel32.dll")] public static extern uint GetCurrentThreadId();
  [DllImport("user32.dll")] public static extern bool AttachThreadInput(uint a, uint b, bool f);
  [DllImport("user32.dll")] public static extern bool PostMessage(IntPtr h, uint Msg, IntPtr w, IntPtr l);
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
  public static void SwitchToEn() {
    var hkl = LoadKeyboardLayout("00000409", 1); // US English
    ActivateKeyboardLayout(hkl, 0);
  }
}
'@
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
$p = Get-Process hoi4 | Select-Object -First 1
[Con2]::SwitchToEn()
[Con2]::Focus($p.MainWindowHandle)
Start-Sleep -Milliseconds 400
# Escape a few times to clear filter focus / close dialogs
1..3 | ForEach-Object { [Con2]::Tap(0x1B); Start-Sleep -Milliseconds 250 }
Start-Sleep -Milliseconds 300
# Open console
[Con2]::Tap(0xC0)
Start-Sleep -Milliseconds 400
Set-Clipboard -Value 'load FIN_2002_05_25_18'
$w = New-Object -ComObject WScript.Shell
$w.SendKeys('^v')
Start-Sleep -Milliseconds 250
$w.SendKeys('{ENTER}')
Start-Sleep -Milliseconds 800
[Con2]::Tap(0xC0)
"EN console load sent $(Get-Date -Format HH:mm:ss)" | Set-Content c:\git\decolonizaciya\playtest_console.log
Start-Sleep 2
$b = New-Object System.Drawing.Bitmap 1536, 960
$g = [System.Drawing.Graphics]::FromImage($b)
$g.CopyFromScreen(0, 0, 0, 0, (New-Object System.Drawing.Size(1536, 960)))
$g.Dispose(); $b.Save('c:\git\decolonizaciya\playtest_enload.png', [System.Drawing.Imaging.ImageFormat]::Png); $b.Dispose()
