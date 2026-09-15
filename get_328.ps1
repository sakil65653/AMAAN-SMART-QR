$log = "C:\Users\AAYAT\.gemini\antigravity\brain\a140ffcb-43c7-4bad-ba14-06e9fe8cf4fc\.system_generated\logs\transcript_full.jsonl"
$line = (Get-Content $log -TotalCount 328)[-1]
$json = $line | ConvertFrom-Json
$rc = $json.tool_calls[0].args.ReplacementContent
if (!$rc) { $rc = $json.tool_calls[0].args.CodeContent }
[System.IO.File]::WriteAllText("services_part_328.js", $rc, [System.Text.Encoding]::UTF8)
Write-Output "Written services_part_328.js, length: $($rc.Length)"
