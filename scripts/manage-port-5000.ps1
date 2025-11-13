# Script de gerenciamento da porta 5000 para HumaniQ
# Este script garante que o frontend rode exclusivamente na porta 5000

param(
    [Parameter(Mandatory=$false)]
    [string]$Action = "check",
    
    [Parameter(Mandatory=$false)]
    [switch]$Force
)

function Get-ProcessesOnPort5000 {
    $connections = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
    $processes = @()
    
    foreach ($conn in $connections) {
        if ($conn.OwningProcess) {
            try {
                $process = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
                if ($process) {
                    $processes += [PSCustomObject]@{
                        PID = $process.Id
                        ProcessName = $process.ProcessName
                        StartTime = $process.StartTime
                        LocalAddress = $conn.LocalAddress
                        LocalPort = $conn.LocalPort
                        State = $conn.State
                    }
                }
            }
            catch {
                Write-Warning "Não foi possível obter informações do processo $($conn.OwningProcess)"
            }
        }
    }
    
    return $processes
}

function Stop-ProcessesOnPort5000 {
    param([switch]$Force)
    
    $processes = Get-ProcessesOnPort5000
    
    if ($processes.Count -eq 0) {
        Write-Host "✅ Nenhum processo encontrado na porta 5000" -ForegroundColor Green
        return $true
    }
    
    Write-Host "🔍 Processos encontrados na porta 5000:" -ForegroundColor Yellow
    $processes | Format-Table -AutoSize
    
    if (!$Force) {
        $confirm = Read-Host "Deseja encerrar estes processos? (S/N)"
        if ($confirm -ne 'S' -and $confirm -ne 's') {
            Write-Host "❌ Operação cancelada" -ForegroundColor Red
            return $false
        }
    }
    
    foreach ($proc in $processes) {
        try {
            Stop-Process -Id $proc.PID -Force -ErrorAction Stop
            Write-Host "✅ Processo $($proc.ProcessName) (PID: $($proc.PID)) encerrado" -ForegroundColor Green
        }
        catch {
            Write-Error "❌ Erro ao encerrar processo $($proc.ProcessName) (PID: $($proc.PID)): $_"
        }
    }
    
    # Aguardar um momento para os processos serem liberados
    Start-Sleep -Seconds 2
    
    # Verificar se ainda há processos
    $remaining = Get-ProcessesOnPort5000
    if ($remaining.Count -gt 0) {
        Write-Warning "⚠️ Ainda há processos na porta 5000 após tentativa de encerramento"
        return $false
    }
    
    Write-Host "✅ Porta 5000 liberada com sucesso!" -ForegroundColor Green
    return $true
}

function Test-Port5000Availability {
    $processes = Get-ProcessesOnPort5000
    
    if ($processes.Count -eq 0) {
        Write-Host "✅ Porta 5000 está disponível" -ForegroundColor Green
        return $true
    }
    else {
        Write-Host "❌ Porta 5000 está ocupada por:" -ForegroundColor Red
        $processes | Format-Table -AutoSize
        return $false
    }
}

function Wait-ForPort5000 {
    param(
        [int]$TimeoutSeconds = 30,
        [int]$CheckInterval = 2
    )
    
    Write-Host "⏳ Aguardando porta 5000 ficar disponível..." -ForegroundColor Yellow
    
    $startTime = Get-Date
    while (((Get-Date) - $startTime).TotalSeconds -lt $TimeoutSeconds) {
        if (Test-Port5000Availability) {
            return $true
        }
        Start-Sleep -Seconds $CheckInterval
    }
    
    Write-Error "❌ Timeout: Porta 5000 não ficou disponível em $TimeoutSeconds segundos"
    return $false
}

# Log de execução
function Write-Log {
    param(
        [string]$Message,
        [string]$Level = "INFO"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    
    # Escrever no console com cores
    switch ($Level) {
        "ERROR" { Write-Host $logMessage -ForegroundColor Red }
        "WARN" { Write-Host $logMessage -ForegroundColor Yellow }
        "SUCCESS" { Write-Host $logMessage -ForegroundColor Green }
        default { Write-Host $logMessage }
    }
    
    # Escrever em arquivo de log
    $logFile = Join-Path $PSScriptRoot "..\logs\port-5000-management.log"
    $logDir = Split-Path $logFile -Parent
    
    if (!(Test-Path $logDir)) {
        New-Item -ItemType Directory -Path $logDir -Force | Out-Null
    }
    
    Add-Content -Path $logFile -Value $logMessage -ErrorAction SilentlyContinue
}

# Função principal
function Main {
    Write-Log "Iniciando script de gerenciamento da porta 5000"
    Write-Log "Ação solicitada: $Action"
    
    switch ($Action.ToLower()) {
        "check" {
            Test-Port5000Availability
        }
        "stop" {
            Stop-ProcessesOnPort5000 -Force:$Force
        }
        "force-stop" {
            Stop-ProcessesOnPort5000 -Force:$true
        }
        "wait" {
            Wait-ForPort5000
        }
        "prepare" {
            Write-Log "Preparando porta 5000 para uso..."
            $result = Stop-ProcessesOnPort5000 -Force:$true
            if ($result) {
                Start-Sleep -Seconds 3
                Test-Port5000Availability
            }
        }
        default {
            Write-Log "Ação desconhecida: $Action" "ERROR"
            Write-Host "Uso: .\manage-port-5000.ps1 [-Action check|stop|force-stop|wait|prepare] [-Force]"
            Write-Host ""
            Write-Host "Ações disponíveis:"
            Write-Host "  check    - Verifica se a porta 5000 está disponível"
            Write-Host "  stop     - Encerra processos na porta 5000 (com confirmação)"
            Write-Host "  force-stop - Encerra processos sem confirmação"
            Write-Host "  wait     - Aguarda até a porta 5000 ficar disponível"
            Write-Host "  prepare  - Prepara a porta 5000 (encerra + verifica)"
            exit 1
        }
    }
}

# Executar função principal
Main