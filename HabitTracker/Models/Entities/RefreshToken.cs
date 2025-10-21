using System.ComponentModel.DataAnnotations;

namespace HabitTracker.Models.Entities;

public class RefreshToken
{
    public Guid Id { get; set; }
    [Required]
    public required string Token { get; set; }
    [Required]
    public required string Jti { get; set; }
    [Required]
    public DateTime ExpiryTime { get; set; }
    [Required]
    public bool IsRevoked { get; set; } = false;

    [Required]
    public Guid UserId { get; set; }
    public User? User { get; set; }


}