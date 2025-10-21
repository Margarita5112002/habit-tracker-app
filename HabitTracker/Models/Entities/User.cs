using System.ComponentModel.DataAnnotations;

namespace HabitTracker.Models.Entities;

public class User
{
    public Guid Id { get; set; }
    [Required]
    [MinLength(6)]
    [MaxLength(50)]
    public required string Username { get; set; }

    [Required]
    [EmailAddress]
    public required string Email { get; set; }

    [Required]
    public required string PasswordHash { get; set; }
    [Required]
    public DateTime CreatedOn { get; set; }
}