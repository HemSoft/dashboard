param(
    [Parameter(Position=0, Mandatory=$true)]
    [string]$Query
)

# Load .env.local
$envFile = Join-Path $PSScriptRoot ".env.local"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^([^#=]+)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim().Trim('"')
            Set-Item -Path "env:$name" -Value $value
        }
    }
}

# Create temp JS file for bun to execute
$tempFile = [System.IO.Path]::GetTempFileName() -replace '\.tmp$', '.mjs'

# Parse simple SELECT queries: "select * from tablename" or "tablename"
$jsCode = @"
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL,
    process.env.SUPABASE_SECRET_SERVICE_ROLE_KEY
);

const query = process.env.QUERY.trim();

// Check for auth.users special case
if (query.match(/auth\.users/i)) {
    const limit = query.match(/limit\s+(\d+)/i)?.[1] || 100;
    const { data, error } = await supabase.auth.admin.listUsers({ perPage: parseInt(limit) });
    if (error) { console.error('Error:', error.message); process.exit(1); }
    console.log(JSON.stringify(data.users, null, 2));
    process.exit(0);
}

// Simple table query parser
let table, schema = 'public', selectCols = '*', limit = 100;

const match = query.match(/^select\s+(.+?)\s+from\s+(?:(\w+)\.)?(\w+)(?:\s+limit\s+(\d+))?/i);
if (match) {
    selectCols = match[1].trim();
    schema = match[2] || 'public';
    table = match[3];
    limit = match[4] ? parseInt(match[4]) : 100;
} else if (/^\w+$/.test(query)) {
    table = query;
} else {
    console.error('Unsupported query. Use: "select * from table" or just "tablename"');
    process.exit(1);
}

try {
    let q = supabase.schema(schema).from(table).select(selectCols === '*' ? '*' : selectCols);
    q = q.limit(limit);
    const { data, error } = await q;
    if (error) throw error;
    console.log(JSON.stringify(data, null, 2));
} catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
}
"@

Set-Content -Path $tempFile -Value $jsCode

try {
    $env:QUERY = $Query
    bun run $tempFile
} finally {
    Remove-Item $tempFile -ErrorAction SilentlyContinue
}
