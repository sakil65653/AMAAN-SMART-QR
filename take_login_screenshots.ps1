$edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if (-not (Test-Path $edgePath)) { $edgePath = "C:\Program Files\Microsoft\Edge\Application\msedge.exe" }
$port = 9399
$tempDir = Join-Path $env:TEMP ("edge_shots_" + [Guid]::NewGuid().ToString().Substring(0,8))
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
$proc = Start-Process -FilePath $edgePath -ArgumentList @("--headless=new", "--remote-debugging-port=$port", "--user-data-dir=$tempDir", "--window-size=1440,900", "about:blank") -PassThru
Start-Sleep -Seconds 2

try {
    $targets = Invoke-RestMethod -Uri "http://127.0.0.1:$port/json/list"
    $pageTarget = $targets | Where-Object { $_.type -eq "page" } | Select-Object -First 1
    $ws = New-Object System.Net.WebSockets.ClientWebSocket
    $ct = New-Object System.Threading.CancellationToken
    $ws.ConnectAsync([Uri]$pageTarget.webSocketDebuggerUrl, $ct).Wait()

    function Send-Cdp($method, $params) {
        $id = [int](Get-Random -Minimum 1000 -Maximum 9999)
        $payload = @{ id = $id; method = $method; params = $params } | ConvertTo-Json -Compress -Depth 10
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($payload)
        $seg = New-Object System.ArraySegment[byte] -ArgumentList @(,$bytes)
        $ws.SendAsync($seg, [System.Net.WebSockets.WebSocketMessageType]::Text, $true, $ct).Wait()
        $ms = New-Object System.IO.MemoryStream
        $buf = New-Object byte[] 65536
        $recSeg = New-Object System.ArraySegment[byte] -ArgumentList @(,$buf)
        $timeout = (Get-Date).AddSeconds(10)
        while ((Get-Date) -lt $timeout) {
            $ms.SetLength(0)
            do {
                $task = $ws.ReceiveAsync($recSeg, $ct); $task.Wait()
                $ms.Write($buf, 0, $task.Result.Count)
            } while (-not $task.Result.EndOfMessage)
            $text = [System.Text.Encoding]::UTF8.GetString($ms.ToArray())
            $obj = $text | ConvertFrom-Json
            if ($obj.id -eq $id) { return $obj }
        }
        return $null
    }

    $null = Send-Cdp "Runtime.enable" @{}

    # 1. Billing Login Screen Screenshot
    Send-Cdp "Page.navigate" @{ url = "http://localhost:5050/billing.html" } | Out-Null
    Start-Sleep -Seconds 2
    Send-Cdp "Runtime.evaluate" @{ expression = "localStorage.clear(); sessionStorage.clear(); showLoginScreen(); fillLogin('admin', '9078');" } | Out-Null
    Start-Sleep -Milliseconds 500
    $shotBilling = Send-Cdp "Page.captureScreenshot" @{ format = "png" }
    [System.IO.File]::WriteAllBytes("C:\Users\AAYAT\.gemini\antigravity\brain\a140ffcb-43c7-4bad-ba14-06e9fe8cf4fc\billing_login_screen.png", [System.Convert]::FromBase64String($shotBilling.result.data))
    Write-Host "Billing screenshot captured!"

    # 2. Admin Login Screen Screenshot
    Send-Cdp "Page.navigate" @{ url = "http://localhost:5050/admin.html" } | Out-Null
    Start-Sleep -Seconds 2
    Send-Cdp "Runtime.evaluate" @{ expression = "localStorage.clear(); showLoginScreen();" } | Out-Null
    Start-Sleep -Milliseconds 500
    $shotAdmin = Send-Cdp "Page.captureScreenshot" @{ format = "png" }
    [System.IO.File]::WriteAllBytes("C:\Users\AAYAT\.gemini\antigravity\brain\a140ffcb-43c7-4bad-ba14-06e9fe8cf4fc\admin_login_screen.png", [System.Convert]::FromBase64String($shotAdmin.result.data))
    Write-Host "Admin screenshot captured!"

    # 3. Index Login Modal Screenshot
    Send-Cdp "Page.navigate" @{ url = "http://localhost:5050/index.html" } | Out-Null
    Start-Sleep -Seconds 2
    Send-Cdp "Runtime.evaluate" @{ expression = "localStorage.clear(); updateAuthUI(); openAuthModal(); quickFillCredentials('admin');" } | Out-Null
    Start-Sleep -Milliseconds 500
    $shotIndex = Send-Cdp "Page.captureScreenshot" @{ format = "png" }
    [System.IO.File]::WriteAllBytes("C:\Users\AAYAT\.gemini\antigravity\brain\a140ffcb-43c7-4bad-ba14-06e9fe8cf4fc\index_login_modal.png", [System.Convert]::FromBase64String($shotIndex.result.data))
    Write-Host "Index modal screenshot captured!"

} finally {
    if ($ws -and $ws.State -eq "Open") { $ws.CloseAsync([System.Net.WebSockets.WebSocketCloseStatus]::NormalClosure, "done", $ct).Wait() }
    Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
    Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue
}
