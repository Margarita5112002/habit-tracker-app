using FluentResults;
using HabitTracker.Models.Entities;
using HabitTracker.Models.Requests;

namespace HabitTracker.Services.Habits;

public interface IHabitService
{
    Task<Result<Habit>> CreateHabit(CreateHabitRequest request, Guid userId);

    Result<Habit?> GetById(string id, Guid userId);
    Result<List<Habit>> GetAllByUser(Guid userId);
    bool DeleteHabit(Guid id, Guid userId);
}