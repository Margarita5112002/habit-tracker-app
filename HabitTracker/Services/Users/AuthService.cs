using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using HabitTracker.Data;
using HabitTracker.Models.Entities;
using HabitTracker.Models.Requests;
using HabitTracker.Models.Responses;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using NotesApi.Models;

namespace HabitTracker.Services.Users;

public class AuthService(
    IConfiguration configuration,
    ApplicationDbContext context,
    TokenValidationParameters tokenValidationParameters
) : IAuthService
{

    public bool CanLogin(User user, string password)
    {
        return new PasswordHasher<User>()
            .VerifyHashedPassword(user, user.PasswordHash, password)
            == PasswordVerificationResult.Success;
    }

    public async Task<LoginResponse> Login(User user)
    {
        var token = GenerateJwtToken(user);

        var refreshtoken = new RefreshToken
        {
            Token = GenerateRefreshToken(),
            ExpiryTime = GenerateExpiryTimeForRefreshToken(),
            UserId = user.Id,
            Jti = token.Id
        };
        context.RefreshTokens.Add(refreshtoken);
        await context.SaveChangesAsync();

        return new LoginResponse
        {
            AccessToken = new JwtSecurityTokenHandler().WriteToken(token),
            RefreshToken = refreshtoken.Token,
            Username = user.Username
        };
    }

    private JwtSecurityToken GenerateJwtToken(User user)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        var jwtsettings = configuration.GetSection("JwtSettings").Get<JwtSettings>();

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtsettings!.Token)
        );

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512);

        return new JwtSecurityToken(
            issuer: jwtsettings.Issuer,
            audience: jwtsettings.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(jwtsettings.ExpiresInMinutes),
            signingCredentials: creds
        );
    }

    private static string GenerateRefreshToken()
    {
        return Guid.NewGuid().ToString() + "-" + Guid.NewGuid().ToString();
    }

    private DateTime GenerateExpiryTimeForRefreshToken()
    {
        var jwtsettings = configuration.GetSection("JwtSettings").Get<JwtSettings>();

        return DateTime.UtcNow.AddMinutes(
            jwtsettings?.RefreshTokenExpiresInMinutes ?? 0
        );
    }

    public async Task<LoginResponse> Refresh(RefreshTokenRequest request)
    {
        var jwtTokenHandler = new JwtSecurityTokenHandler();

        var parametersCopy = tokenValidationParameters.Clone();
        parametersCopy.ValidateLifetime = false;

        var claims = jwtTokenHandler.ValidateToken(
            request.AccessToken,
            parametersCopy,
            out var validatedToken);
        
        if (validatedToken is JwtSecurityToken jwtSecurityToken)
        {
            var result = jwtSecurityToken.Header.Alg.Equals(
                SecurityAlgorithms.HmacSha512,
                StringComparison.InvariantCultureIgnoreCase
            );
            if (!result) throw new Exception("Algorithm doesn't match");
        }

        var utcExpiryDate = long.Parse(
            claims?.Claims.FirstOrDefault(x => x.Type == JwtRegisteredClaimNames.Exp)?.Value ?? "0");
        var expityDate = UnixTimeStampToDateTimeInUTC(utcExpiryDate);
        if (expityDate > DateTime.UtcNow) throw new Exception("Token has not expired yet");

        var refreshtoken = context.RefreshTokens
            .FirstOrDefault(x => x.Token == request.RefreshToken);
        if (refreshtoken == null) throw new Exception("Refresh token doesn't exist");

        var jti = claims?.Claims.FirstOrDefault(x => x.Type == JwtRegisteredClaimNames.Jti)?.Value;

        if (refreshtoken.Jti != jti)
            throw new Exception("Refresh token doesn't match with the access token");

        if (refreshtoken.ExpiryTime < DateTime.UtcNow)
            throw new Exception("Refresh token expired");

        if (refreshtoken.IsRevoked)
            throw new Exception("Refresh token is revoked");

        var user = context.Users.FirstOrDefault(x => x.Id == refreshtoken.UserId);
        if (user == null) throw new Exception("User doesn't exist");

        var newtoken = GenerateJwtToken(user);
        refreshtoken.Jti = newtoken.Id;
        refreshtoken.ExpiryTime = GenerateExpiryTimeForRefreshToken();
        refreshtoken.Token = GenerateRefreshToken();
        await context.SaveChangesAsync();

        return new LoginResponse
        {
            Username = user.Username ?? "",
            AccessToken = new JwtSecurityTokenHandler().WriteToken(newtoken),
            RefreshToken = refreshtoken.Token
        };
    }

    private static DateTime UnixTimeStampToDateTimeInUTC(long time)
    {
        var dateTimeVal = new DateTime(1970, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc);
        dateTimeVal = dateTimeVal.AddSeconds(time);
        return dateTimeVal;
    }

}