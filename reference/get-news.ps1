<#
.SYNOPSIS
  Display latest news from multiple RSS feed sources with auto-refresh.

.DESCRIPTION
  Aggregates news from configured RSS feeds (Hacker News, BBC, CNN, NPR, DR.dk, AI sources),
  displays the latest 20 items with relative timestamps, and provides interactive menu
  for article selection and refresh control.

.PARAMETER ConfigFile
  Path to TOML configuration file. Defaults to get-news.toml in script directory.

.EXAMPLE
  .\get-news.ps1
  .\get-news.ps1 -ConfigFile custom-config.toml
#>

param(
    [string]$ConfigFile,
    [switch]$Test
)

#Requires -Version 7.0

# ============================================================================
# Configuration & Initialization
# ============================================================================

$ErrorActionPreference = 'Stop'
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$dismissedFile = Join-Path $scriptDir "get-news-dismissed.json"

if (-not $ConfigFile) {
    $ConfigFile = Join-Path $scriptDir "get-news.toml"
}

if (-not (Test-Path $ConfigFile)) {
    Write-Host "❌ Configuration file not found: $ConfigFile" -ForegroundColor Red
    Write-Host "Please create get-news.toml in the scripts directory." -ForegroundColor Yellow
    exit 1
}

# ============================================================================
# Functions
# ============================================================================

function Load-DismissedItems {
    if (Test-Path $dismissedFile) {
        try {
            $data = Get-Content $dismissedFile -Raw | ConvertFrom-Json
            # Convert to hashtable for fast lookup
            $result = @{}
            foreach ($item in $data) {
                $result[$item.Url] = [DateTime]::Parse($item.DismissedAt)
            }
            return $result
        }
        catch {
            return @{}
        }
    }
    return @{}
}

function Save-DismissedItems {
    param([hashtable]$Dismissed)

    $data = @()
    foreach ($url in $Dismissed.Keys) {
        $data += @{
            Url = $url
            DismissedAt = $Dismissed[$url].ToString("o")
        }
    }
    $data | ConvertTo-Json -Depth 2 | Set-Content $dismissedFile -Encoding UTF8
}

function Cleanup-ExpiredDismissed {
    param(
        [hashtable]$Dismissed,
        [int]$MaxAgeDays
    )

    $cutoff = (Get-Date).AddDays(-$MaxAgeDays)
    $toRemove = @()

    foreach ($url in $Dismissed.Keys) {
        if ($Dismissed[$url] -lt $cutoff) {
            $toRemove += $url
        }
    }

    foreach ($url in $toRemove) {
        $Dismissed.Remove($url)
    }

    return $toRemove.Count
}

function ConvertFrom-SimpleToml {
    param([string]$Content)

    $lines = $Content -split "`r?`n"
    $config = @{
        settings = @{}
        sources = @()
    }

    $currentSection = $null
    $currentSource = $null

    foreach ($line in $lines) {
        $line = $line.Trim()

        # Skip empty lines and comments
        if ([string]::IsNullOrWhiteSpace($line) -or $line.StartsWith('#')) {
            continue
        }

        # Section headers
        if ($line -match '^\[\[sources\]\]$') {
            # New source array item
            $currentSource = @{}
            $config.sources += $currentSource
            $currentSection = 'sources'
            continue
        }
        elseif ($line -match '^\[(.+)\]$') {
            $sectionName = $matches[1]

            if ($sectionName -eq 'settings') {
                $currentSection = 'settings'
                $currentSource = $null
            }
            continue
        }

        # Key-value pairs
        if ($line -match '^(\w+)\s*=\s*(.+)$') {
            $key = $matches[1]
            $value = $matches[2].Trim()

            # Remove quotes
            if ($value -match '^"(.+)"$') {
                $value = $matches[1]
            }

            # Parse value type
            if ($value -eq 'true') {
                $value = $true
            }
            elseif ($value -eq 'false') {
                $value = $false
            }
            elseif ($value -match '^\d+$') {
                $value = [int]$value
            }

            # Store value
            if ($currentSection -eq 'settings') {
                $config.settings[$key] = $value
            }
            elseif ($currentSection -eq 'sources' -and $null -ne $currentSource) {
                $currentSource[$key] = $value
            }
        }
    }

    return $config
}

function Get-RelativeTime {
    param([DateTime]$Date)

    $now = Get-Date
    $diff = $now - $Date

    if ($diff.TotalMinutes -lt 1) {
        return "Now"
    }
    elseif ($diff.TotalMinutes -lt 60) {
        $mins = [Math]::Floor($diff.TotalMinutes)
        return "${mins} min"
    }
    elseif ($diff.TotalHours -lt 24) {
        $hours = [Math]::Floor($diff.TotalHours)
        if ($hours -eq 1) { return "1 hour" }
        return "${hours} hours"
    }
    elseif ($diff.TotalDays -lt 2) {
        return "Yesterday"
    }
    else {
        return $Date.ToString("dddd")  # Day name (Monday, Tuesday, etc.)
    }
}

function Get-CategoryColor {
    param([string]$Category)

    switch ($Category) {
        "AI" { return "Magenta" }
        "Tech" { return "Cyan" }
        "World" { return "Yellow" }
        "Denmark" { return "Red" }
        default { return "White" }
    }
}

function Get-TerminalWidth {
    try {
        # PowerShell host aware width
        $w = $Host.UI.RawUI.WindowSize.Width
    }
    catch {
        try { $w = [console]::WindowWidth } catch { $w = 120 }
    }

    if (-not $w -or $w -lt 40) { $w = 40 }
    return [int]$w
}

function Truncate-Text {
    param(
        [string]$Text,
        [int]$MaxWidth
    )

    if (-not $Text) { return $Text }
    if ($MaxWidth -le 0) { return '' }
    if ($Text.Length -le $MaxWidth) { return $Text }
    if ($MaxWidth -le 1) { return $Text.Substring(0, $MaxWidth) }
    return $Text.Substring(0, $MaxWidth - 1) + '…'
}

function Compute-Columns {
    param([int]$Width)

    # Basic column sizes
    $keyTotal = 4 # [#] and a space
    $timeCol = 10 # relative time
    $minSource = 8
    $maxSource = 20
    $sourceCol = [int]([Math]::Max($minSource, [Math]::Min($maxSource, [Math]::Floor($Width * 0.14))))

    $reserved = $keyTotal + $timeCol + 1 + $sourceCol + 1 # key + time + sep + source + sep
    $titleCol = $Width - $reserved

    # Reduce sourceCol if title is too small
    if ($titleCol -lt 10) {
        $needed = 10 - $titleCol
        $sourceCol = [Math]::Max($minSource, $sourceCol - $needed)
        $reserved = $keyTotal + $timeCol + 1 + $sourceCol + 1
        $titleCol = $Width - $reserved
    }

    # If still too small, switch to a compact layout
    $compact = $false
    if ($titleCol -lt 8) { $compact = $true }

    return [PSCustomObject]@{
        Width = $Width
        KeyTotal = $keyTotal
        TimeCol = $timeCol
        SourceCol = $sourceCol
        TitleCol = $titleCol
        Compact = $compact
    }
}

function Get-RssFeed {
    param(
        [string]$Url,
        [string]$SourceName,
        [string]$Category
    )

    try {
        $userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        $response = Invoke-RestMethod -Uri $Url -TimeoutSec 10 -ErrorAction Stop -UserAgent $userAgent
        $items = @()

        # Invoke-RestMethod automatically parses RSS/Atom feeds
        # For RSS 2.0, it returns the items array directly if there are multiple items
        # For a single item, it returns the item object
        # For Atom feeds, it may return differently

        $feedItems = @()

        if ($response -is [array]) {
            # Multiple items returned directly (common for RSS 2.0)
            $feedItems = $response
        }
        elseif ($response.rss.channel.item) {
            # RSS 2.0 format with explicit structure
            $feedItems = $response.rss.channel.item
            if ($feedItems -isnot [array]) {
                $feedItems = @($feedItems)
            }
        }
        elseif ($response.feed.entry) {
            # Atom format
            $feedItems = $response.feed.entry
            if ($feedItems -isnot [array]) {
                $feedItems = @($feedItems)
            }
        }
        elseif ($response.channel.item) {
            # Alternative RSS format
            $feedItems = $response.channel.item
            if ($feedItems -isnot [array]) {
                $feedItems = @($feedItems)
            }
        }

        foreach ($item in $feedItems) {
            # Parse publication date
            $pubDate = $null
            try {
                if ($item.pubDate) {
                    $pubDate = [DateTime]::Parse($item.pubDate)
                }
                elseif ($item.published) {
                    $pubDate = [DateTime]::Parse($item.published)
                }
                elseif ($item.updated) {
                    $pubDate = [DateTime]::Parse($item.updated)
                }
            } catch {
                continue
            }

            if ($null -eq $pubDate) { continue }

            # Extract link
            $link = $item.link
            # Handle Atom feeds with multiple link elements (array of links)
            if ($link -is [array]) {
                # Find the main link (no rel attribute, or rel="alternate")
                $mainLink = $link | Where-Object {
                    if ($_ -is [System.Xml.XmlElement]) {
                        $rel = $_.GetAttribute('rel')
                        return [string]::IsNullOrEmpty($rel) -or $rel -eq 'alternate'
                    }
                    return $true
                } | Select-Object -First 1
                $link = if ($mainLink -is [System.Xml.XmlElement]) { $mainLink.href } else { $mainLink }
            }
            elseif ($link -is [System.Xml.XmlElement]) {
                if ($link.'#cdata-section') {
                    $link = $link.'#cdata-section'
                }
                elseif ($link.href) {
                    $link = $link.href
                }
                elseif ($link.'#text') {
                    $link = $link.'#text'
                }
                elseif ($link.InnerText) {
                    $link = $link.InnerText
                }
            }

            if ([string]::IsNullOrWhiteSpace($link)) {
                continue
            }

            # Extract title
            $title = $item.title
            if ($title -is [System.Xml.XmlElement]) {
                # Try different properties for XML elements
                if ($title.'#cdata-section') {
                    $title = $title.'#cdata-section'
                }
                elseif ($title.'#text') {
                    $title = $title.'#text'
                }
                elseif ($title.InnerText) {
                    $title = $title.InnerText
                }
                elseif ($title.InnerXml) {
                    $title = $title.InnerXml
                }
                else {
                    # Last resort: convert to string
                    $title = $title | Select-Object -ExpandProperty '#cdata-section' -ErrorAction SilentlyContinue
                    if (-not $title) {
                        $title = $title | Select-Object -ExpandProperty '#text' -ErrorAction SilentlyContinue
                    }
                    if (-not $title) {
                        $title = $item.title.ToString()
                    }
                }
            }

            # Clean up title
            if ($null -ne $title) {
                $title = $title -replace '\s+', ' '
                $title = $title.Trim()
            }

            # Skip if title is empty or just "title"
            if ([string]::IsNullOrWhiteSpace($title) -or $title -eq 'title') {
                continue
            }

            $items += [PSCustomObject]@{
                Title = $title
                Link = $link
                PubDate = $pubDate
                Source = $SourceName
                Category = $Category
            }
        }

        return [PSCustomObject]@{
            Items = $items
            Error = $null
        }
    }
    catch {
        $errMsg = $_.Exception.Message
        if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
            $errMsg = "$([int]$_.Exception.Response.StatusCode) $($_.Exception.Response.StatusCode)"
        }
        return [PSCustomObject]@{
            Items = @()
            Error = $errMsg
        }
    }
}

function Show-Header {
    param(
        [string]$Version,
        [DateTime]$LastRefresh,
        [DateTime]$NextRefresh
    )

    Clear-Host
    # Title with inline refresh info
    if ($LastRefresh -ne [DateTime]::MinValue) {
        # Title left, refresh info immediately after title
        Write-Host "📰 Get News $Version" -ForegroundColor Yellow -NoNewline
        Write-Host "  │  " -NoNewline -ForegroundColor DarkGray
        Write-Host "Last refresh: " -NoNewline -ForegroundColor Gray
        Write-Host $LastRefresh.ToString("h:mm:ss tt") -NoNewline -ForegroundColor Cyan
        Write-Host "  │  " -NoNewline -ForegroundColor DarkGray
        Write-Host "Next refresh: " -ForegroundColor Green -NoNewline
        Write-Host " $($NextRefresh.ToString('h:mm:ss tt'))" -ForegroundColor Green
    }
    else {
        Write-Host "📰 Get News $Version" -ForegroundColor Yellow
    }


}

function Show-NewsItems {
    param(
        [array]$Items,
        [int]$MaxItems
    )

    $script:displayedItems = $Items | Select-Object -First $MaxItems
    $index = 0

    $termWidth = Get-TerminalWidth
    # Show only a separator line (no "Latest News" label)
    Write-Host (("─" * $termWidth)) -ForegroundColor DarkGray

    $cols = Compute-Columns -Width $termWidth
    foreach ($item in $script:displayedItems) {
        $relTime = Get-RelativeTime -Date $item.PubDate
        $categoryColor = Get-CategoryColor -Category $item.Category

        # Generate key: 1-9 for first 9 items, a-k for items 10-20
        $key = if ($index -lt 9) {
            ($index + 1).ToString()
        } else {
            [char]([int]'a'[0] + ($index - 9))
        }

        # Format: [#] TIME | SOURCE | TITLE (with optional second line)
        if ($cols.Compact) {
            # Compact mode: two lines available for title
            $titleWidth = $cols.Width - $cols.KeyTotal - 1
            $title = $item.Title
            
            if ($title.Length -le $titleWidth) {
                # Fits on one line
                Write-Host "[$key] " -NoNewline -ForegroundColor Green
                Write-Host $title -ForegroundColor White
            }
            else {
                # Wrap to two lines
                $line1 = $title.Substring(0, $titleWidth)
                $remaining = $title.Substring($titleWidth)
                $line2 = Truncate-Text -Text $remaining -MaxWidth $titleWidth
                
                Write-Host "[$key] " -NoNewline -ForegroundColor Green
                Write-Host $line1 -ForegroundColor White
                Write-Host (" " * $cols.KeyTotal) -NoNewline
                Write-Host $line2 -ForegroundColor White
            }
        }
        else {
            # Normal mode: two lines available for title
            $titleWidth = $cols.TitleCol
            $title = $item.Title
            # Calculate prefix width (everything before title)
            $prefixWidth = $cols.KeyTotal + $cols.TimeCol + 1 + $cols.SourceCol + 1

            Write-Host "[$key]" -NoNewline -ForegroundColor Green
            Write-Host " " -NoNewline
            Write-Host $relTime.PadRight($cols.TimeCol) -NoNewline -ForegroundColor DarkGray
            Write-Host "│" -NoNewline -ForegroundColor DarkGray
            Write-Host $item.Source.PadRight($cols.SourceCol) -NoNewline -ForegroundColor $categoryColor
            Write-Host "│" -NoNewline -ForegroundColor DarkGray

            if ($title.Length -le $titleWidth) {
                # Fits on one line
                Write-Host $title -ForegroundColor White
            }
            else {
                # Wrap to two lines
                $line1 = $title.Substring(0, $titleWidth)
                $remaining = $title.Substring($titleWidth)
                $line2 = Truncate-Text -Text $remaining -MaxWidth $titleWidth
                
                Write-Host $line1 -ForegroundColor White
                Write-Host (" " * $prefixWidth) -NoNewline
                Write-Host $line2 -ForegroundColor White
            }
        }

        $index++
    }
}

function Show-Menu {
    param([int]$RefreshSeconds)

    $refreshMinutes = [Math]::Ceiling($RefreshSeconds / 60)

    $termWidth = Get-TerminalWidth
    Write-Host (("─" * $termWidth)) -ForegroundColor DarkGray
    Write-Host "Actions: " -NoNewline -ForegroundColor Cyan
    Write-Host "1-9,a-k" -NoNewline -ForegroundColor Green
    Write-Host " = Open  " -NoNewline -ForegroundColor Gray
    Write-Host "Shift+1-9,a-k" -NoNewline -ForegroundColor Green
    Write-Host " = Dismiss  " -NoNewline -ForegroundColor Gray
    Write-Host "R" -NoNewline -ForegroundColor Green
    Write-Host " = Refresh  " -NoNewline -ForegroundColor Gray
    Write-Host "Q" -NoNewline -ForegroundColor Green
    Write-Host " = Quit" -ForegroundColor Gray
    Write-Host "Auto-refresh in ${refreshMinutes}m or press a key..." -ForegroundColor DarkYellow -NoNewline
}

# ============================================================================
# Main Script
# ============================================================================

$VERSION = "v0.0.1"

# Load configuration
try {
    $configContent = Get-Content $ConfigFile -Raw
    $config = ConvertFrom-SimpleToml -Content $configContent
}
catch {
    Write-Host "❌ Failed to parse configuration file: $_" -ForegroundColor Red
    exit 1
}

# Extract settings
$refreshIntervalMinutes = $config.settings.refresh_interval_minutes
$maxItems = $config.settings.max_items
$maxAgeDays = $config.settings.max_age_days
$refreshIntervalSeconds = $refreshIntervalMinutes * 60

# Load and cleanup dismissed items
$script:dismissedItems = Load-DismissedItems
$cleanedCount = Cleanup-ExpiredDismissed -Dismissed $script:dismissedItems -MaxAgeDays 7
if ($cleanedCount -gt 0) {
    Save-DismissedItems -Dismissed $script:dismissedItems
}

# Main loop
$script:newsItems = @()
$script:shouldExit = $false
$script:lastRefreshTime = [DateTime]::MinValue
$script:nextRefreshTime = [DateTime]::MinValue

while (-not $script:shouldExit) {
    # Fetch news from all enabled sources
    Show-Header -Version $VERSION -LastRefresh $script:lastRefreshTime -NextRefresh $script:nextRefreshTime
    Write-Host "📡 Fetching news from $($config.sources.Count) sources..." -ForegroundColor Yellow

    $allItems = @()
    $cutoffDate = (Get-Date).AddDays(-$maxAgeDays)
    $fetchErrors = @()

    foreach ($source in $config.sources) {
        if (-not $source.enabled) { continue }

        Write-Host "→ $($source.name)..." -NoNewline -ForegroundColor DarkGray
        $result = Get-RssFeed -Url $source.url -SourceName $source.name -Category $source.category

        if ($result.Error) {
            $fetchErrors += "  ⚠️  $($source.name): $($result.Error)"
            Write-Host " ERROR: $($result.Error)" -ForegroundColor Red
        }
        else {
            $items = $result.Items | Where-Object { $_.PubDate -ge $cutoffDate }
            $allItems += $items
            Write-Host " $($items.Count) items" -ForegroundColor DarkGreen
        }
    }

    # Sort by date (newest first), filter dismissed, and store
    $script:newsItems = $allItems | 
        Where-Object { -not $script:dismissedItems.ContainsKey($_.Link) } |
        Sort-Object -Property PubDate -Descending

    # Update refresh times
    $script:lastRefreshTime = Get-Date
    $script:nextRefreshTime = $script:lastRefreshTime.AddSeconds($refreshIntervalSeconds)

    Write-Host "✓ Fetched $($script:newsItems.Count) total items" -ForegroundColor Green
    
    if ($fetchErrors.Count -gt 0) {
        Write-Host "⚠️  Some sources failed to fetch. Waiting 3s to let you read errors..." -ForegroundColor Yellow
        Start-Sleep -Seconds 3
    }
    else {
        Start-Sleep -Milliseconds 500
    }

    # Display news items
    Show-Header -Version $VERSION -LastRefresh $script:lastRefreshTime -NextRefresh $script:nextRefreshTime
    if ($fetchErrors.Count -gt 0) {
        foreach ($err in $fetchErrors) {
            Write-Host $err -ForegroundColor DarkGray
        }
        Write-Host (("-" * (Get-TerminalWidth))) -ForegroundColor DarkGray
    }
    Show-NewsItems -Items $script:newsItems -MaxItems $maxItems
    Show-Menu -RefreshSeconds $refreshIntervalSeconds

    if ($Test) { return }

    # Wait for user input or timeout
    $startTime = Get-Date
    $inputReceived = $false

    while (-not $inputReceived) {
        if ([Console]::KeyAvailable) {
            $key = [Console]::ReadKey($true)
            $inputReceived = $true

            $w = Get-TerminalWidth
            Write-Host "`r" + (" " * $w) # Clear the line

            $keyChar = $key.KeyChar.ToString().ToUpper()

            # Map shifted number keys to indices: !@#$%^&*( = Shift+1-9
            $shiftedNumbers = '!@#$%^&*('
            $shiftedIndex = $shiftedNumbers.IndexOf($keyChar)

            if ($keyChar -eq 'Q') {
                $script:shouldExit = $true
                Write-Host "👋 Goodbye!" -ForegroundColor Cyan
                break
            }
            elseif ($keyChar -eq 'R') {
                Write-Host "🔄 Refreshing..." -ForegroundColor Yellow
                Start-Sleep -Milliseconds 500
                break
            }
            elseif ($shiftedIndex -ge 0) {
                # Handle Shift+1-9 (dismiss) - shifted chars !@#$%^&*(
                $itemIndex = $shiftedIndex
                if ($itemIndex -lt $script:displayedItems.Count) {
                    $selectedItem = $script:displayedItems[$itemIndex]
                    $script:dismissedItems[$selectedItem.Link] = Get-Date
                    Save-DismissedItems -Dismissed $script:dismissedItems
                    Write-Host "🚫 Dismissed: $($selectedItem.Title)" -ForegroundColor DarkGray
                    Start-Sleep -Milliseconds 500
                    $script:newsItems = $script:newsItems | Where-Object { $_.Link -ne $selectedItem.Link }
                }
                else {
                    Write-Host "⚠️  Invalid selection" -ForegroundColor Yellow
                    Start-Sleep -Seconds 1
                }
                break
            }
            elseif ($keyChar -match '^[1-9]$') {
                # Handle 1-9 (indices 0-8) - open article
                $itemIndex = [int]$keyChar - 1
                if ($itemIndex -lt $script:displayedItems.Count) {
                    $selectedItem = $script:displayedItems[$itemIndex]
                    Write-Host "🌐 Opening: $($selectedItem.Title)" -ForegroundColor Cyan
                    Start-Process $selectedItem.Link
                    Start-Sleep -Milliseconds 500
                }
                else {
                    Write-Host "⚠️  Invalid selection" -ForegroundColor Yellow
                    Start-Sleep -Seconds 1
                }
                break
            }
            elseif ($keyChar -match '^[A-K]$') {
                # Handle a-k for items 10-20 (indices 9-19)
                # Shift+letter produces uppercase, regular produces lowercase (but we uppercased)
                $itemIndex = 9 + ([int]($keyChar.ToLower()[0]) - [int]'a'[0])
                $isDismiss = $key.Modifiers -band [ConsoleModifiers]::Shift
                if ($itemIndex -lt $script:displayedItems.Count) {
                    $selectedItem = $script:displayedItems[$itemIndex]
                    if ($isDismiss) {
                        $script:dismissedItems[$selectedItem.Link] = Get-Date
                        Save-DismissedItems -Dismissed $script:dismissedItems
                        Write-Host "🚫 Dismissed: $($selectedItem.Title)" -ForegroundColor DarkGray
                        Start-Sleep -Milliseconds 500
                        $script:newsItems = $script:newsItems | Where-Object { $_.Link -ne $selectedItem.Link }
                    }
                    else {
                        Write-Host "🌐 Opening: $($selectedItem.Title)" -ForegroundColor Cyan
                        Start-Process $selectedItem.Link
                        Start-Sleep -Milliseconds 500
                    }
                }
                else {
                    Write-Host "⚠️  Invalid selection" -ForegroundColor Yellow
                    Start-Sleep -Seconds 1
                }
                break
            }
            else {
                Write-Host "⚠️  Invalid input. Use 1-9,a-k (Shift to dismiss), R, or Q" -ForegroundColor Yellow
                Start-Sleep -Seconds 1
                break
            }
        }

        # Check if refresh timeout reached
        $elapsed = ((Get-Date) - $startTime).TotalSeconds
        if ($elapsed -ge $refreshIntervalSeconds) {
            $w = Get-TerminalWidth
            Write-Host "`r" + (" " * $w) # Clear the line
            Write-Host "⏰ Auto-refresh triggered" -ForegroundColor Yellow
            Start-Sleep -Milliseconds 500
            break
        }

        Start-Sleep -Milliseconds 100
    }
}
