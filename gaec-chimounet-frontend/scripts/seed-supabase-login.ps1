$email = Read-Host "Adresse e-mail du compte administrateur"
$securePassword = Read-Host "Mot de passe (la saisie reste masquée)" -AsSecureString
$credential = [System.Management.Automation.PSCredential]::new($email, $securePassword)
$exitCode = 1

try {
    $env:SUPABASE_ADMIN_EMAIL = $credential.UserName
    $env:SUPABASE_ADMIN_PASSWORD = $credential.GetNetworkCredential().Password

    & npm.cmd run seed:supabase
    $exitCode = $LASTEXITCODE
}
finally {
    Remove-Item Env:SUPABASE_ADMIN_EMAIL -ErrorAction SilentlyContinue
    Remove-Item Env:SUPABASE_ADMIN_PASSWORD -ErrorAction SilentlyContinue
}

exit $exitCode
