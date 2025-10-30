using FluentResults;
using HabitTracker.Models.Entities;
using HabitTracker.Models.Requests;

namespace HabitTracker.Services.Habits;

public interface IHabitTrackService
{
    public HabitTrack GetOrCreateHabitTrack(int month, int year, Guid habitId);
    public Task<Result<HabitTrack>> ApplyIncrements(HabitTrack track, IncrementHabitTrackerRequest request);
}