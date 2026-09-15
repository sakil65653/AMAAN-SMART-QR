$text = [System.IO.File]::ReadAllText("recovered_functions_37.js", [System.Text.Encoding]::UTF8)
$lines = $text -split "`r?`n"
Write-Output "Total lines in recovered_functions_37.js: $($lines.Count)"
$headers = $lines | Select-String "^// =="
foreach ($h in $headers) { Write-Output $h.Line }
