namespace HabitTracker.Models.Responses;

public class LoginResponse
{
    public required string AccessToken { get; set; }
    public required string RefreshToken { get; set; }
    public required string Username { get; set; }
    
}