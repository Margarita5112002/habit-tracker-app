using HabitTracker.Models.Entities;

namespace HabitTracker.Services.Users;

public interface ICurrentUser
{
    public User? GetUser();
}