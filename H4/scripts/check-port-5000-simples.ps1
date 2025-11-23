# Script simples para verificar e liberar porta 5000
param([string]$Action = "check")

function Check-Port5000 {
    $listener = [System.Net.Sockets.TcpClient]::new()
    try {
        $listener.Connect("127.0.0.1", 5000)
        $listener.Close()
        return $false  # Porta está ocupada
    } catch {
        return $true   # Porta está livre
    }
}

function Get-ProcessOnPort5000 {
    $connections = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
    $processes = @()
    foreach ($conn in $connections) {
        $process = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
        if ($process) {
            $processes += [PSCustomObject]@{
                ProcessName = $process.ProcessName
                PID = $process.Id
                StartTime = $process.StartTime
            }
        }
    }
    return $processes
}

function Stop-ProcessOnPort5000 {
    $processes = Get-ProcessOnPort5000
    if ($processes.Count -eq 0) {
        Write-Host "✅ Nenhum processo na porta 5000" -ForegroundColor Green
        return
    }
    
    Write-Host "🔍 Processos encontrados:" -ForegroundColor Yellow
    $processes | Format-Table -AutoSize
    
    foreach ($proc in $processes) {
        try {
            Stop-Process -Id $proc.PID -Force
            Write-Host "✅ Processo $($proc.ProcessName) encerrado" -ForegroundColor Green
        } catch {
            Write-Host "❌ Erro ao encerrar $($proc.ProcessName): $_" -ForegroundColor Red
        }
    }
    
    Start-Sleep -Seconds 2
}

# Executar ação
switch ($Action) {
    "check" {
        if (Check-Port5000) {
            Write-Host "✅ Porta 5000 está disponível" -ForegroundColor Green
        } else {
            Write-Host "❌ Porta 5000 está ocupada" -ForegroundColor Red
            $processes = Get-ProcessOnPort5000
            if ($processes.Count -gt 0) {
                Write-Host "Processos:" -ForegroundColor Yellow
                $processes | Format-Table -AutoSize
            }
        }
    }
    "stop" {
        Stop-ProcessOnPort5000
    }
    "prepare" {
        Stop-ProcessOnPort5000
        if (Check-Port5000) {
            Write-Host "✅ Porta 5000 preparada com sucesso" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Porta 5000 ainda ocupada" -ForegroundColor Yellow
        }
    }
    default {
        Write-Host "Uso: .\check-port-5000-simples.ps1 [check|stop|prepare]"
    }
}