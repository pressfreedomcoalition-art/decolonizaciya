# Disabled content (NOT loaded by HOI4)

These folders were moved out of history/states/ because:
1) Blockchain enclaves (states 1260-1284) caused CTD after province load when UKR parent overrides had stale victory_points on moved provinces.
2) HOI4 may still parse files in subfolders of history/states — keep disabled assets outside that tree.

To re-enable blockchain safely:
- Restore UKR overrides from _disabled_ukr_overrides (VPs for moved provinces are commented out)
- Move enclave files back into history/states/
- Add those victory_points into the matching enclave state history blocks instead
