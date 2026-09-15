$log = "C:\Users\AAYAT\.gemini\antigravity\brain\a140ffcb-43c7-4bad-ba14-06e9fe8cf4fc\.system_generated\logs\transcript_full.jsonl"
$line = (Get-Content $log -TotalCount 2406)[-1]
$json = $line | ConvertFrom-Json
$tc = $json.tool_calls[0]
if ($tc.args.CodeContent) {
    [System.IO.File]::WriteAllText("check_2406.ps1", $tc.args.CodeContent, [System.Text.Encoding]::UTF8)
    Write-Output "Saved check_2406.ps1, length: $($tc.args.CodeContent.Length)"
}
