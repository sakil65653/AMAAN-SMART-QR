$content = Get-Content 'C:\Users\AAYAT\.gemini\antigravity\brain\a140ffcb-43c7-4bad-ba14-06e9fe8cf4fc\.system_generated\logs\transcript_full.jsonl'
foreach ($line in $content) {
    if ($line.Contains("MANDATORY PREVIEW + DOWNLOAD SYSTEM")) {
        $json = $line | ConvertFrom-Json
        $json.content | Out-File -FilePath "extracted_prompt.txt" -Encoding utf8
        Write-Output "FOUND AND EXTRACTED"
        break
    }
}
