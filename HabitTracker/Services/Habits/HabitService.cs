using FluentResults;
using HabitTracker.Data;
using HabitTracker.Models.Entities;
using HabitTracker.Models.Requests;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HabitTracker.Services.Habits;

public class HabitService(
    ApplicationDbContext context
) : IHabitService
{

    public async Task<Result<Habit>> CreateHabit(CreateHabitRequest request, Guid userId)
    {
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

        var errors = ValidateHabit(newHabit);
        if (errors.Count > 0)
        {
            return errors.Merge();
        }

        context.Habits.Add(newHabit);
        await context.SaveChangesAsync();
        return Result.Ok(newHabit);
    }

    public Result<Habit?> UpdateHabit(Guid habitId, Guid userId, UpdateHabitRequest request)
    {
        var habitResult = GetById(habitId, userId);
        if (habitResult.IsFailed) return habitResult;
        var habit = habitResult.Value;
        if (habit == null) return Result.Ok<Habit?>(null);

        habit.Name = request.Name;
        habit.Description = request.Description;
        habit.Color = request.Color;
        habit.Emoji = request.Emoji;
        habit.Target = request.Target;
        habit.FrequencyInDays = request.FrequencyInDays;
        habit.AllowCustomValue = request.AllowCustomValue;
        habit.AllowExceedTarget = request.AllowExceedTarget;

        var errors = ValidateHabit(habit);
        if (errors.Count > 0)
        {
            return errors.Merge();
        }

        context.SaveChanges();

        return Result.Ok<Habit?>(habit);
    }

    private static IList<Result> ValidateHabit(Habit habit)
    {
        IList<Result> errors = [];
        if (habit.Target <= 0)
        {
            errors.Add(
                Result.Fail(
                    new Error("Target cannot be less or equal to 0")
                    .WithMetadata("field", "Target")
                )
            );
        }
        if (habit.FrequencyInDays <= 0)
        {
            errors.Add(
                Result.Fail(
                    new Error("Frequency in days cannot be less or equal to 0")
                    .WithMetadata("field", "FrequencyInDays")
                )
            );
        }
        return errors;
    }

    public Result<Habit?> GetById(Guid id, Guid userId)
    {
        var habit = context.Habits
            .Include(h => h.HabitTracks)
            .FirstOrDefault(h => h.Id == id && h.UserId == userId && !h.IsArchived);
        return Result.Ok(habit);
    }

    public Result<List<Habit>> GetAllByUser(Guid userId)
    {
        var habits = context.Habits
            .Include(h => h.HabitTracks)
            .Where(h => h.UserId == userId && !h.IsArchived)
            .ToList();
        return Result.Ok(habits);
    }
    public bool DeleteHabit(Guid id, Guid userId)
    {
        var habit = context.Habits
            .FirstOrDefault(h => h.Id == id && h.UserId == userId && !h.IsArchived);
        if (habit == null) return false;
        habit.IsArchived = true;
        context.SaveChanges();
        return true;
    }

}
