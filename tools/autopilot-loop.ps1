<#
  Repeats an AI agent command on a timer for the ClassPulse autopilot (see docs/partner-ai-brief.md section 7).
  Example:  .\tools\autopilot-loop.ps1 -AgentCommand "codex exec --full-auto"
  The prompt (tools/autopilot-b-prompt.txt, one line, no double quotes) is passed as the LAST argument.
  Stops at -StopAt, or when the file autopilot/STOP exists.
#>
param(
  [Parameter(Mandatory = $true)][string]$AgentCommand,
  [double]$IntervalMinutes = 20,
  [string]$PromptFile = "tools/autopilot-b-prompt.txt",
  [datetime]$StopAt = [datetime]"2026-11-08 23:59"
)

if (-not (Test-Path $PromptFile)) { throw "Prompt file not found: $PromptFile (run from the repository root)" }
New-Item -ItemType Directory -Force autopilot | Out-Null
$parts = @($AgentCommand -split '\s+' | Where-Object { $_ })
$exe = $parts[0]
$agentArgs = @()
if ($parts.Count -gt 1) { $agentArgs = $parts[1..($parts.Count - 1)] }
$gates = "autopilot/gates.md"
$lastGates = if (Test-Path $gates) { (Get-Item $gates).LastWriteTime } else { [datetime]::MinValue }

while ((Get-Date) -lt $StopAt) {
  if (Test-Path "autopilot/STOP") { Write-Host "autopilot/STOP found, stopping."; break }
  $prompt = (Get-Content $PromptFile -Raw).Trim()
  $log = "autopilot/run-$(Get-Date -Format 'yyyyMMdd-HHmm').log"
  Write-Host "[$(Get-Date -Format 'HH:mm')] running agent, log: $log"
  try { & $exe @agentArgs $prompt 2>&1 | Tee-Object -FilePath $log }
  catch { "ERROR: $_" | Tee-Object -FilePath $log -Append }
  if ((Test-Path $gates) -and ((Get-Item $gates).LastWriteTime -gt $lastGates)) {
    $lastGates = (Get-Item $gates).LastWriteTime
    [console]::Beep(880, 300)
    Write-Host ">>> $gates changed: something needs your decision. Read it; to approve add a line to autopilot/approvals.txt"
  }
  if ((Get-Date).AddMinutes($IntervalMinutes) -ge $StopAt) { break }
  Start-Sleep -Seconds ([int]($IntervalMinutes * 60))
}
Write-Host "autopilot loop finished."
