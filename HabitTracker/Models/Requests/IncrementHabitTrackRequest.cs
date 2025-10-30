using System.ComponentModel.DataAnnotations;

namespace HabitTracker.Models.Requests;

public class IncrementHabitTrackerRequest
{
    [Required]
    public required Dictionary<int, double> DayUpdates { get; set; }

}