using HabitTracker.Models.DataTransferObjects;
using HabitTracker.Models.Entities;
using HabitTracker.Models.Requests;
using HabitTracker.Services.Habits;
using HabitTracker.Services.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HabitTracker.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class HabitsController(
    ICurrentUser currentUser,
    IHabitService habitService,
    IHabitTrackService habitTrackService
) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> CreateHabit(CreateHabitRequest request)
    {
        User? user = currentUser.GetUser();
        if (user == null) return Unauthorized();

        var result = await habitService.CreateHabit(request, user.Id);
        if (result.IsSuccess)
        {
            var createdHabit = result.Value;
            return CreatedAtAction(
                nameof(GetHabitById),
                new { id = createdHabit.Id },
                HabitToDTO(createdHabit));
        }

        Dictionary<string, List<string>> errors = result.Errors
            .Where(e => e.Metadata != null && e.Metadata.ContainsKey("field"))
            .GroupBy(x => x.Metadata["field"])
            .ToDictionary(
                g => g.Key.ToString() ?? "",
                g => g.Select(x => x.Message).ToList()
            );

        return Problem(
            title: "Invalid habit",
            statusCode: StatusCodes.Status400BadRequest,
            instance: HttpContext.Request.Path,
            extensions: new Dictionary<string, object?>
            {
                ["errors"] = errors
            }
        );

    }

    [HttpGet("{id}")]
    public IActionResult GetHabitById(string id)
    {
        User? user = currentUser.GetUser();
        if (user == null) return Unauthorized();

        var result = habitService.GetById(id, user.Id);
        if (result.IsSuccess)
        {
            if (result.Value == null) return NotFound();
            return Ok(HabitToDTO(result.Value));
        }

        return BadRequest();
    }

    [HttpGet]
    public IActionResult GetAllHabits()
    {
        User? user = currentUser.GetUser();
        if (user == null) return Unauthorized();

        var result = habitService.GetAllByUser(user.Id);
        if (result.IsSuccess)
        {
            var habits = result.Value.Select(HabitToDTO).ToList();
            return Ok(habits);
        }

        return BadRequest();
    }

    [HttpPatch("{habitId}/track/{year}/{month}/days/increment")]
    public async Task<IActionResult> IncrementHabitTrack(string habitId, int year, int month, [FromBody] IncrementHabitTrackerRequest request)
    {
        if (year < 2020) return BadRequest("Invalid year");
        if (month < 1 || month > 12) return BadRequest("Invalid month");
        var user = currentUser.GetUser();
        if (user == null) return Unauthorized();

        var habitResult = habitService.GetById(habitId, user.Id);
        if (habitResult.IsFailed) return BadRequest();
        var habit = habitResult.Value;
        if (habit == null) return NotFound();

        var track = habitTrackService.GetOrCreateHabitTrack(month, year, habit.Id);
        var result = await habitTrackService.ApplyIncrements(track, request);
        if (result.IsFailed)
        {
            return BadRequest(result.Errors);
        }
        return NoContent();
    }

    [HttpDelete("{id}")]
    public IActionResult DeleteHabit(string id)
    {
        User? user = currentUser.GetUser();
        if (user == null) return Unauthorized();

        if (!Guid.TryParse(id, out var habitGuid))
        {
            return NotFound();
        }

        var result = habitService.DeleteHabit(habitGuid, user.Id);
        if (!result) return NotFound();
        return NoContent();
    }

    private static HabitDTO HabitToDTO(Habit habit)
    {
        var tracks = habit.HabitTracks?.Select(HabitTrackToDTO).ToList();

        return new HabitDTO
        {
            Id = habit.Id,
            Name = habit.Name,
            Description = habit.Description,
            Color = habit.Color,
            Emoji = habit.Emoji,
            Target = habit.Target,
            FrequencyInDays = habit.FrequencyInDays,
            AllowCustomValue = habit.AllowCustomValue,
            AllowExceedTarget = habit.AllowExceedTarget,
            HabitTracks = tracks,
        };
    }

    private static HabitTrackDTO HabitTrackToDTO(HabitTrack track)
    {
        return new HabitTrackDTO
        {
            Id = track.Id,
            Days = track.Days,
            Month = track.Month,
            Year = track.Year,
        };
    }

}