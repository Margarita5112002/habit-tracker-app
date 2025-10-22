using System.Collections.Generic;
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
    IHabitService habitService
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
            return CreatedAtAction(nameof(GetHabitById), new { id = createdHabit.Id }, createdHabit);
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
            return Ok(result.Value);
        }

        return BadRequest();
    }
}