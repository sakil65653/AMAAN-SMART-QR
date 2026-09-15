$log = "C:\Users\AAYAT\.gemini\antigravity\brain\a140ffcb-43c7-4bad-ba14-06e9fe8cf4fc\.system_generated\logs\transcript_full.jsonl"
$line = (Get-Content $log -TotalCount 6320)[-1]
$json = $line | ConvertFrom-Json
Write-Output "Line 6320 content length: $($json.content.Length)"
[System.IO.File]::WriteAllText("services_viewed_6320.txt", $json.content, [System.Text.Encoding]::UTF8)
Write-Output "Saved to services_viewed_6320.txt"
