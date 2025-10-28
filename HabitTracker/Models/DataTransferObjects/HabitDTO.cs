using System.ComponentModel.DataAnnotations;
using HabitTracker.Models.Entities;

namespace HabitTracker.Models.DataTransferObjects;

public class HabitDTO
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public required string Color { get; set; } = "#fff";
    public required string Emoji { get; set; } = "🚀";

    // goal 
    public required int Target { get; set; } = 1;
    public required int FrequencyInDays { get; set; } = 1;

    // settings
    public bool AllowCustomValue { get; set; } = false;
    public bool AllowExceedTarget { get; set; } = false;

}