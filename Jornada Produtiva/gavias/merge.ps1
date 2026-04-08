$base = "c:\Users\pb00003747\Desktop\ARQUIVOS E PROGRAMAS\Página PBH\Jornada Produtiva\gavias"
$html = Get-Content "$base\jornada-produtiva.html" -Raw -Encoding UTF8
$js = Get-Content "$base\jornada-produtiva.js" -Raw -Encoding UTF8
$combined = $html + "`r`n`r`n<script>`r`n" + $js + "`r`n</script>"
Set-Content -Path "$base\jornada-produtiva-completo.html" -Value $combined -Encoding UTF8
Write-Host "Arquivo combinado criado com sucesso!"
