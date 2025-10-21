using System.ComponentModel.DataAnnotations;

namespace HabitTracker.Models.Requests;


public class RegisterRequest
{
    [Required]
    [MinLength(6)]
    [MaxLength(50)]
    [RegularExpression("[^@]+", ErrorMessage = "Username cannot contain @")]
    public required string Username { get; set; }

    [Required]
    [EmailAddress]
    public required string Email { get; set; }

    [Required]
    [MinLength(6)]
    [MaxLength(150)]
    public required string Password { get; set; }
}