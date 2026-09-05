using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

public class JwtTokenService(IConfiguration configuration)
{
    public string CreateToken(Pengguna pengguna)
    {
        var jwt = configuration.GetSection("Jwt");
        var key = jwt["Key"] ?? throw new InvalidOperationException("JWT key belum dikonfigurasi.");
        var issuer = jwt["Issuer"] ?? "KKCS.Api";
        var audience = jwt["Audience"] ?? "KKCS.App";
        var expiresInMinutes = int.TryParse(jwt["ExpiresInMinutes"], out var minutes) ? minutes : 120;

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, pengguna.Id.ToString()),
            new Claim("nik", pengguna.NomorIndukKaryawan),
            new Claim(ClaimTypes.Name, pengguna.NamaLengkap)
        };
        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
            SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer,
            audience,
            claims,
            expires: DateTime.UtcNow.AddMinutes(expiresInMinutes),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
