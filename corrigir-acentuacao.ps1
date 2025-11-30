# Script de Correção de Acentuação PT-BR - cursosData.ts
# Versão com encoding UTF-8 BOM correto

$arquivo = "c:\Users\ALICEBELLA\Desktop\H6\H5\H4\src\data\cursosData.ts"
$backup = "c:\Users\ALICEBELLA\Desktop\H6\H5\H4\src\data\cursosData.ts.backup2"

Write-Host "Criando backup..." -ForegroundColor Yellow
Copy-Item $arquivo $backup -Force

Write-Host "Lendo arquivo com UTF-8..." -ForegroundColor Yellow
$conteudo = [System.IO.File]::ReadAllText($arquivo, [System.Text.Encoding]::UTF8)

$total = 0

# Padrões de substituição
$substituicoes = @(
    @{De = '\bnao\b'; Para = 'não' },
    @{De = '\bvoce\b'; Para = 'você' },
    @{De = '\bvoces\b'; Para = 'vocês' },
    @{De = '\besta\b(?=\s+(sendo|acontecendo|causando|gerando|fazendo))'; Para = 'está' },
    @{De = '\bestao\b'; Para = 'estão' },
    @{De = '\bsao\b'; Para = 'são' },
    @{De = '\btem\b(?=\s+(que|como|sido|uma|um|o|a|mais|menos))'; Para = 'têm' },
    @{De = 'emocoes\b'; Para = 'emoções' },
    @{De = 'emocao\b'; Para = 'emoção' },
    @{De = 'decisoes\b'; Para = 'decisões' },
    @{De = 'decisao\b'; Para = 'decisão' },
    @{De = 'situacoes\b'; Para = 'situações' },
    @{De = 'situacao\b'; Para = 'situação' },
    @{De = 'acoes\b'; Para = 'ações' },
    @{De = 'acao\b'; Para = 'ação' },
    @{De = 'informacoes\b'; Para = 'informações' },
    @{De = 'informacao\b'; Para = 'informação' },
    @{De = 'solucoes\b'; Para = 'soluções' },
    @{De = 'solucao\b'; Para = 'solução' },
    @{De = 'relacoes\b'; Para = 'relações' },
    @{De = 'relacao\b'; Para = 'relação' },
    @{De = 'funcoes\b'; Para = 'funções' },
    @{De = 'funcao\b'; Para = 'função' },
    @{De = 'atencao\b'; Para = 'atenção' },
    @{De = 'prevencao\b'; Para = 'prevenção' },
    @{De = 'comunicacao\b'; Para = 'comunicação' },
    @{De = 'organizacao\b'; Para = 'organização' },
    @{De = 'avaliacao\b'; Para = 'avaliação' },
    @{De = 'capacitacao\b'; Para = 'capacitação' },
    @{De = 'pratico\b'; Para = 'prático' },
    @{De = 'praticos\b'; Para = 'práticos' },
    @{De = 'pratica\b'; Para = 'prática' },
    @{De = 'praticas\b'; Para = 'práticas' },
    @{De = 'tecnico\b'; Para = 'técnico' },
    @{De = 'tecnicos\b'; Para = 'técnicos' },
    @{De = 'tecnica\b'; Para = 'técnica' },
    @{De = 'tecnicas\b'; Para = 'técnicas' },
    @{De = 'especifico\b'; Para = 'específico' },
    @{De = 'especifica\b'; Para = 'específica' },
    @{De = 'especificos\b'; Para = 'específicos' },
    @{De = 'especificas\b'; Para = 'específicas' },
    @{De = 'critico\b'; Para = 'crítico' },
    @{De = 'critica\b'; Para = 'crítica' },
    @{De = 'criticos\b'; Para = 'críticos' },
    @{De = 'criticas\b'; Para = 'críticas' },
    @{De = 'conclusao\b'; Para = 'conclusão' },
    @{De = 'introducao\b'; Para = 'introdução' },
    @{De = 'pressao\b'; Para = 'pressão' },
    @{De = 'tensao\b'; Para = 'tensão' },
    @{De = '\bproximo\b'; Para = 'próximo' },
    @{De = '\bproxima\b'; Para = 'próxima' },
    @{De = '\bproximos\b'; Para = 'próximos' },
    @{De = '\bproximas\b'; Para = 'próximas' },
    @{De = 'tambem\b'; Para = 'também' },
    @{De = 'porem\b'; Para = 'porém' },
    @{De = 'alem\b'; Para = 'além' },
    @{De = 'atraves\b'; Para = 'através' },
    @{De = 'ate\b'; Para = 'até' },
    @{De = '\bja\b'; Para = 'já' },
    @{De = '\bla\b'; Para = 'lá' },
    @{De = '\bha\b(?=\s+(uma|um|muitos|muitas|varios))'; Para = 'há' },
    @{De = 'exercicio\b'; Para = 'exercício' },
    @{De = 'exercicios\b'; Para = 'exercícios' },
    @{De = 'modulo\b'; Para = 'módulo' },
    @{De = 'modulos\b'; Para = 'módulos' },
    @{De = 'lider\b'; Para = 'líder' },
    @{De = 'lideres\b'; Para = 'líderes' },
    @{De = 'lideranca\b'; Para = 'liderança' },
    @{De = 'experiencia\b'; Para = 'experiência' },
    @{De = 'experiencias\b'; Para = 'experiências' },
    @{De = 'influencia\b'; Para = 'influência' },
    @{De = 'importancia\b'; Para = 'importância' },
    @{De = 'resiliencia\b'; Para = 'resiliência' },
    @{De = 'confianca\b'; Para = 'confiança' },
    @{De = 'diferenca\b'; Para = 'diferença' },
    @{De = 'diferencas\b'; Para = 'diferenças' },
    @{De = 'inteligencia\b'; Para = 'inteligência' },
    @{De = 'saude\b'; Para = 'saúde' },
    @{De = 'possivel\b'; Para = 'possível' },
    @{De = 'impossiveis\b'; Para = 'impossíveis' },
    @{De = 'impossivel\b'; Para = 'impossível' },
    @{De = 'nivel\b'; Para = 'nível' },
    @{De = 'niveis\b'; Para = 'níveis' },
    @{De = 'facil\b'; Para = 'fácil' },
    @{De = 'dificil\b'; Para = 'difícil' },
    @{De = 'util\b'; Para = 'útil' },
    @{De = 'inutil\b'; Para = 'inútil' },
    @{De = 'responsavel\b'; Para = 'responsável' },
    @{De = 'responsaveis\b'; Para = 'responsáveis' },
    @{De = 'disponivel\b'; Para = 'disponível' },
    @{De = 'disponiveis\b'; Para = 'disponíveis' },
    @{De = 'saudavel\b'; Para = 'saudável' },
    @{De = 'saudaveis\b'; Para = 'saudáveis' },
    @{De = 'agradavel\b'; Para = 'agradável' },
    @{De = 'agradaveis\b'; Para = 'agradáveis' },
    @{De = 'incrivel\b'; Para = 'incrível' },
    @{De = 'incriveis\b'; Para = 'incríveis' },
    @{De = 'flexivel\b'; Para = 'flexível' },
    @{De = 'flexiveis\b'; Para = 'flexíveis' },
    @{De = 'variavel\b'; Para = 'variável' },
    @{De = 'variaveis\b'; Para = 'variáveis' },
    @{De = 'notavel\b'; Para = 'notável' },
    @{De = 'notaveis\b'; Para = 'notáveis' },
    @{De = 'favoravel\b'; Para = 'favorável' },
    @{De = 'favoraveis\b'; Para = 'favoráveis' },
    @{De = 'vulneravel\b'; Para = 'vulnerável' },
    @{De = 'vulneraveis\b'; Para = 'vulneráveis' }
)

Write-Host "`nAplicando correções..." -ForegroundColor Green

foreach ($sub in $substituicoes) {
    $antes = $conteudo
    $conteudo = $conteudo -replace $sub.De, $sub.Para
    if ($antes -ne $conteudo) {
        $count = ([regex]::Matches($antes, $sub.De)).Count
        $total += $count
        Write-Host "  $($sub.De) -> $($sub.Para) ($count)" -ForegroundColor Cyan
    }
}

Write-Host "`nSalvando com UTF-8..." -ForegroundColor Yellow
$utf8 = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($arquivo, $conteudo, $utf8)

Write-Host "`n✅ Concluído!" -ForegroundColor Green
Write-Host "Total de substituições: $total" -ForegroundColor White
Write-Host "Backup salvo em: $backup" -ForegroundColor Gray
