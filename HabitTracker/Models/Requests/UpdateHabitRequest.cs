using System.ComponentModel.DataAnnotations;

namespace HabitTracker.Models.Requests;

public class UpdateHabitRequest
{
    [Required]
    [MaxLength(100)]
    public required string Name { get; set; }
    [MaxLength(500)]
    public string? Description { get; set; }
    [Required]
    [RegularExpression("^#[0-9a-fA-F]{3,8}$")]
    [MaxLength(9)]
    public required string Color { get; set; } = "#fff";
    [Required]
    [MaxLength(10)]
    public required string Emoji { get; set; } = "🚀";

    // goal 
    [Required]
    public required int Target { get; set; } = 1;
    [Required]
    public required int FrequencyInDays { get; set; } = 1;

    // settings
    public bool AllowCustomValue { get; set; } = false;
    public bool AllowExceedTarget { get; set; } = false;

}