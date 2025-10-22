using System.Security.Claims;
using HabitTracker.Models.Entities;

namespace HabitTracker.Services.Users;

public class CurrentUser(
    IHttpContextAccessor contextAccessor
) : ICurrentUser
{
    public User? GetUser()
    {
        var claims = contextAccessor.HttpContext?.User;
        if (claims == null) return null;
        var username = claims.FindFirstValue(ClaimTypes.Name);
        var id = claims.FindFirstValue(ClaimTypes.NameIdentifier);
        var email = claims.FindFirstValue(ClaimTypes.Email);

        if (id == null || username == null || email == null) return null;

        return new User
        {
            Username = username,
            Id = new Guid(id),
            Email = email,
            PasswordHash = ""
        };
    }
}