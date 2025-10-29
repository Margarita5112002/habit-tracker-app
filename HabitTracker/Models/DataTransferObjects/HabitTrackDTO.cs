namespace HabitTracker.Models.DataTransferObjects;

public class HabitTrackDTO
{
    public Guid Id { get; set; }
    public int Month { get; set; } // one-indexed 1 = Jan
    public int Year { get; set; }
    public required double[] Days { get; set; }
}