param(
    [string]$Dir = ".nuxt",
    [int]$MaxRetries = 5,
    [int]$DelaySeconds = 2
)

if (-not (Test-Path $Dir)) {
    Write-Host "目录 $Dir 不存在，无需清理。"
    exit 0
}

for ($i = 1; $i -le $MaxRetries; $i++) {
    try {
        Remove-Item -Path $Dir -Recurse -Force -ErrorAction Stop
        Write-Host "已删除 $Dir"
        exit 0
    }
    catch {
        if ($i -lt $MaxRetries) {
            Write-Warning "删除 $Dir 失败 (EPERM?)，${DelaySeconds} 秒后重试 ($i/$MaxRetries)..."
            Start-Sleep -Seconds $DelaySeconds
        } else {
            Write-Error "$Dir 清理失败 ($MaxRetries 次重试后放弃): $_"
            exit 1
        }
    }
}
