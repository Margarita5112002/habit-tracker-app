using HabitTracker.Models.Entities;
using HabitTracker.Models.Requests;

namespace HabitTracker.Services.Users;

public interface IUserService
{
    public User? GetUserByUsername(string username);

    public User? GetUserByEmail(string email);

    public Task<User> CreateUser(RegisterRequest request);
}