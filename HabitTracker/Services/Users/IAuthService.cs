using HabitTracker.Models.Entities;
using HabitTracker.Models.Requests;
using HabitTracker.Models.Responses;

namespace HabitTracker.Services.Users;

public interface IAuthService
{
    public bool CanLogin(User user, string password);
    public Task<LoginResponse> Login(User user);
    public Task<LoginResponse> Refresh(RefreshTokenRequest request);
}