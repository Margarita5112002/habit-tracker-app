using FluentResults;
using HabitTracker.Data;
using HabitTracker.Models.Entities;
using HabitTracker.Models.Requests;
using Microsoft.EntityFrameworkCore;

namespace HabitTracker.Services.Habits;

public class HabitService(
    ApplicationDbContext context
) : IHabitService
{

    public async Task<Result<Habit>> CreateHabit(CreateHabitRequest request, Guid userId)
    {
        IList<Result> errors = [];
        if (request.Target <= 0)
        {
            errors.Add(
                Result.Fail(
                    new Error("Target cannot be less or equal to 0")
                    .WithMetadata("field", "Target")
                )
            );
        }
        if (request.FrequencyInDays <= 0)
        {
            errors.Add(
                Result.Fail(
                    new Error("Frequency in days cannot be less or equal to 0")
                    .WithMetadata("field", "FrequencyInDays")
                )
            );
        }
        if (errors.Count > 0)
        {
            return errors.Merge();
        }

        Habit newHabit = new Habit
        {
            Name = request.Name,
            Description = request.Description,
            Color = request.Color,
            Emoji = request.Emoji,
            Target = request.Target,
            FrequencyInDays = request.FrequencyInDays,
            AllowCustomValue = request.AllowCustomValue,
            AllowExceedTarget = request.AllowExceedTarget,
            IsArchived = false,
            UserId = userId,
        };

        context.Habits.Add(newHabit);
        await context.SaveChangesAsync();
        return Result.Ok(newHabit);
    }

    public Result<Habit?> GetById(string id, Guid userId)
    {
        var habit = context.Habits
            .FirstOrDefault(h => h.Id.ToString() == id && h.UserId == userId && !h.IsArchived);
        return Result.Ok(habit);
    }

    public Result<List<Habit>> GetAllByUser(Guid userId)
    {
        var habits = context.Habits
            .Include(h => h.HabitTracks)
            .Where(h => h.UserId == userId)
            .ToList();
        return Result.Ok(habits);
    }

}
