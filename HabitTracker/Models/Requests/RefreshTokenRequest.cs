using System.ComponentModel.DataAnnotations;

namespace HabitTracker.Models.Requests;

public class RefreshTokenRequest
{
    [Required]
    public required string AccessToken { get; set; }
    [Required]
    public required string RefreshToken { get; set; }

}