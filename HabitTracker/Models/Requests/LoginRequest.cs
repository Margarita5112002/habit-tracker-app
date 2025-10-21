using System.ComponentModel.DataAnnotations;

namespace HabitTracker.Models.Requests;

public class LoginRequest
{
    [Required]
    public required string UserIdentifier { get; set; }

    [Required]
    public required string Password { get; set; }
}