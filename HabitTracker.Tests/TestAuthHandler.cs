using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace HabitTracker.Tests;

public class TestAuthHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{

    public const string TestScheme = "TestScheme";

    public TestAuthHandler(IOptionsMonitor<AuthenticationSchemeOptions> options, ILoggerFactory logger, UrlEncoder encoder)
        : base(options, logger, encoder)
    { }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var testUser = HabitTrackerWebApplicationFactory<Program>.GetTestUser();
        var claims = new List<Claim>
        {
            new(ClaimTypes.Name, testUser.Username),
            new(ClaimTypes.Email, testUser.Email),
            new(ClaimTypes.NameIdentifier, testUser.Id.ToString()),
            new(JwtRegisteredClaimNames.Jti, testUser.Id.ToString()),
        };

        var identity = new ClaimsIdentity(claims, "Test");
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, TestScheme);

        var result = AuthenticateResult.Success(ticket);

        return Task.FromResult(result);
    }
}
