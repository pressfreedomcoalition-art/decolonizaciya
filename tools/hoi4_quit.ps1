Start-Sleep 2
Add-Type -TypeDefinition @"
using System; using System.Runtime.InteropServices;
public static class Q {
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int n);
  [DllImport("user32.dll")] public static extern void keybd_event(byte v, byte s, uint f, UIntPtr e);
  public static void AltF4() {
    keybd_event(0x12,0,0,UIntPtr.Zero); // Alt
    keybd_event(0x73,0,0,UIntPtr.Zero); // F4
    keybd_event(0x73,0,2,UIntPtr.Zero);
    keybd_event(0x12,0,2,UIntPtr.Zero);
  }
}
"@
$p=Get-Process hoi4 -EA SilentlyContinue|Select-Object -First 1
if ($p) { [Q]::ShowWindow($p.MainWindowHandle,9); [Q]::SetForegroundWindow($p.MainWindowHandle); Start-Sleep -Milliseconds 300; [Q]::AltF4() }
Start-Sleep 2
if (Get-Process hoi4 -EA SilentlyContinue) { Stop-Process -Name hoi4 -Force }
