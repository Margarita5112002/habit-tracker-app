using FluentResults;
using HabitTracker.Data;
using HabitTracker.Models.Entities;
using HabitTracker.Models.Requests;

namespace HabitTracker.Services.Habits;

public class HabitTrackService (
    ApplicationDbContext context
) : IHabitTrackService
{
    public HabitTrack GetOrCreateHabitTrack(int month, int year, Guid habitId)
    {
        var habitTrack = context.HabitTracks
            .FirstOrDefault(h => h.HabitId == habitId && h.Year == year && h.Month == month);
        if (habitTrack != null) return habitTrack;

        habitTrack = new HabitTrack
        {
            Year = year,
            Month = month,
            HabitId = habitId,
            Days = new double[32]
        };

        context.HabitTracks.Add(habitTrack);
        return habitTrack;
    }

    public async Task<Result<HabitTrack>> ApplyIncrements(HabitTrack track, IncrementHabitTrackerRequest request)
    {
        double[] days = [..track.Days];
        var increments = request.DayUpdates;
        foreach (var (day, increment) in increments)
        {
            if (day < 1 || day > 31)
                return Result.Fail("Request is not valid. Day is not valid");
            var newDayTrack = days[day] + increment;
            if (newDayTrack < 0.0)
                return Result.Fail("Request is not valid. Increments yield invalid state");
            days[day] = newDayTrack;
        }
        track.Days = days;
        await context.SaveChangesAsync();
        return track;
    }
}