using HabitTracker.Data;
using HabitTracker.Models.Entities;
using HabitTracker.Models.Requests;
using Microsoft.AspNetCore.Identity;

namespace HabitTracker.Services.Users;

public class UserService(
    ApplicationDbContext context
) : IUserService
{
    public User? GetUserByUsername(string username)
    {
        return context.Users.FirstOrDefault(x => x.Username == username);
    }

    public User? GetUserByEmail(string email)
    {
        return context.Users.FirstOrDefault(x => x.Email == email);
    }

    public async Task<User> CreateUser(RegisterRequest request)
    {
        var newuser = new User
        {
            Username = request.Username,
            Email = request.Email,
            CreatedOn = DateTime.Now,
            PasswordHash = ""
        };
        newuser.PasswordHash = new PasswordHasher<User>()
            .HashPassword(newuser, request.Password);

        context.Users.Add(newuser);
        await context.SaveChangesAsync();
        return newuser;
    }
}