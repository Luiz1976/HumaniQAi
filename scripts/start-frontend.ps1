#requires -version 5.1
<#!
Script: start-frontend.ps1
Objetivo: Garantir que o frontend sempre inicie exclusivamente na porta 5000.
Ações:
 1) Verifica processos em execução nas portas 5000, 5001 e 5002..5010
 2) Encerra qualquer processo do frontend encontrado nessas portas
 3) Inicia o frontend garantindo uso exclusivo da porta 5000 (vite strictPort)
 4) Tratamento de erros para portas ocupadas, falhas ao encerrar e permissões

Uso:
  - powershell -ExecutionPolicy Bypass -File scripts/start-frontend.ps1
  - npm run dev:strict
!#>

param(
  [string]$ProjectRoot = (Resolve-Path ".").Path,
  [int[]]$CheckPorts = @(5000,5001,5002,5003,5004,5005,5006,5007,5008,5009,5010)
)

$ErrorActionPreference = 'Stop'

function Get-PidsByPort([int[]]$ports) {
  $pids = @()
  try {
    foreach ($p in $ports) {
      $conns = Get-NetTCPConnection -State Listen -LocalPort $p -ErrorAction SilentlyContinue
      if ($conns) {
        $pids += ($conns | Select-Object -ExpandProperty OwningProcess)
      }
    }
  } catch {
    # Fallback via netstat
    foreach ($p in $ports) {
      $lines = (netstat -ano | Select-String ":$p")
      foreach ($line in $lines) {
        # formato típico: TCP    0.0.0.0:5001     0.0.0.0:0      LISTENING       12345
        $parts = ($line.ToString() -split "\s+") | Where-Object { $_ -ne '' }
        if ($parts.Length -ge 5) {
          $portPid = [int]$parts[$parts.Length-1]
          $pids += $portPid
        }
      }
    }
  }
  return ($pids | Sort-Object -Unique)
}

function TryStopProcess([int]$procId) {
  try {
    $proc = Get-Process -Id $procId -ErrorAction SilentlyContinue
    if ($proc) {
      # Obter comando para identificar vite/node
      $cim = Get-CimInstance Win32_Process -Filter "ProcessId=$procId" -ErrorAction SilentlyContinue
      $cmd = $cim.CommandLine
      $name = $proc.Name
      Write-Host ("Encerrando PID {0} ({1}) cmd='{2}'" -f $procId, $name, $cmd) -ForegroundColor Yellow
      Stop-Process -Id $procId -Force -ErrorAction Stop
    }
  } catch {
    Write-Warning ("Falha ao encerrar PID {0}: {1}" -f $procId, $_.Exception.Message)
  }
}

function EnsurePortFree([int]$port) {
  $pids = Get-PidsByPort @($port)
  if ($pids.Count -eq 0) { return }
  foreach ($procId in $pids) { TryStopProcess $procId }
  Start-Sleep -Milliseconds 300
  $pidsAfter = Get-PidsByPort @($port)
  if ($pidsAfter.Count -gt 0) {
    throw ("Porta {0} continua ocupada por PIDs: {1}. Verifique permissões ou serviços externos." -f $port, ($pidsAfter -join ', '))
  }
}

try {
  Write-Host ("➊ Verificando e encerrando processos nas portas: {0}" -f ($CheckPorts -join ', ')) -ForegroundColor Cyan
  $pids = Get-PidsByPort $CheckPorts
  foreach ($procId in $pids) { TryStopProcess $procId }

  Write-Host "➋ Garantindo exclusividade da porta 5000" -ForegroundColor Cyan
  EnsurePortFree 5000

  Write-Host "➌ Iniciando frontend em 5000 (strictPort)" -ForegroundColor Cyan
  Set-Location $ProjectRoot
  # Garante porta 5000 via vite.config.ts (strictPort:true) e script dev
  $env:PORT = 5000
  npm run dev:strict
} catch {
  Write-Error ("❌ Erro ao iniciar frontend: {0}" -f $_.Exception.Message)
  Write-Host "💡 Dicas:"
  Write-Host " - Execute PowerShell como Administrador se houver falhas de permissão"
  Write-Host " - Verifique serviços externos ocupando porta 5000 (IIS, WSL, Docker)"
  Write-Host " - Se o Vite reportar porta ocupada, o script aborta (strictPort)"
  exit 1
}