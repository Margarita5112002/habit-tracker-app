using System.ComponentModel.DataAnnotations;

namespace HabitTracker.Models.Entities;

public class HabitTrack
{
    public Guid Id { get; set; }
    [Required]
    public int Month { get; set; } // one-indexed 1 = Jan
    [Required]
    public int Year { get; set; }
    [Required]
    public required double[] Days { get; set; }

    [Required]
    public Guid HabitId { get; set; }
    public Habit? Habit { get; set; }
}