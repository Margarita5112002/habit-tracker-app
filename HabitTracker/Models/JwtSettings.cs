namespace NotesApi.Models;

public class JwtSettings
{
    public required string Token { get; set; }
    public required string Audience { get; set; }
    public required string Issuer { get; set; }
    public int ExpiresInMinutes { get; set; } = 10;
    public int RefreshTokenExpiresInMinutes { get; set; } = 60 * 24 * 7;
}