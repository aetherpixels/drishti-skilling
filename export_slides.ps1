$pptPath = (Resolve-Path 'presentation\Drishti_Skilling_SIH2024_Presentation.pptx').Path
$outDir = Join-Path (Get-Location).Path 'presentation\slides_preview'
if (-not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir -Force | Out-Null
}
$ppt = New-Object -ComObject PowerPoint.Application
$pres = $ppt.Presentations.Open($pptPath, 2, 0, 0)
$idx = 1
foreach ($slide in $pres.Slides) {
    $slideFile = Join-Path $outDir ("slide_" + $idx + ".png")
    $slide.Export($slideFile, "PNG", 1920, 1080)
    $idx++
}
$pres.Close()
Write-Host "Export complete!"
