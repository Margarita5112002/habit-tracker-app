using HabitTracker.Models.Requests;
using HabitTracker.Services.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HabitTracker.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(
    IUserService userService,
    IAuthService authService
) : ControllerBase
{
    [HttpPost("register")]
    public async Task<ActionResult> RegisterUser([FromBody] RegisterRequest request)
    {
        var existUsername = userService.GetUserByUsername(request.Username);
        var existEmail = userService.GetUserByEmail(request.Email);

        if (existUsername != null || existEmail != null)
        {
            var errors = new Dictionary<string, object?>();

            var title = existUsername != null && existEmail != null ?
                "Username and email are already used by another user" :
                (existEmail != null) ? "Email is already used by another user" :
                "Username is already used by another user";

            var detail = existUsername != null && existEmail != null ?
                $"The username '{request.Username}' is already in use. The email '{request.Email}' is already in use" :
                (existEmail != null) ? "The email '{request.Email}' is already in use" :
                "The username '{request.Username}' is already in use";

            if (existUsername != null)
            {
                errors["Username"] = new List<string> { "Username was already taken" };
            }
            if (existEmail != null)
            {
                errors["Email"] = new List<string> { "Email was already taken" };
            }

            return Problem(
                title: title,
                detail: detail,
                instance: HttpContext.Request.Path,
                statusCode: StatusCodes.Status409Conflict,
                extensions: new Dictionary<string, object?>
                {
                    ["errors"] = errors
                }
            );
        }

        await userService.CreateUser(request);

        return Created();
    }

    [HttpPost("login")]
    public async Task<ActionResult> Login([FromBody] LoginRequest request)
    {
        var identifier = request.UserIdentifier;
        var user = userService.GetUserByUsername(identifier);
        user ??= userService.GetUserByEmail(identifier);

        var problem = Problem(
            title: "Username or email or password is wrong",
            detail: "Credentials don't match",
            instance: HttpContext.Request.Path,
            statusCode: StatusCodes.Status401Unauthorized
        );

        if (user == null) return problem;

        if (!authService.CanLogin(user, request.Password))
        {
            return problem;
        }
        var response = await authService.Login(user);
        return Ok(response);
    }

    [HttpPost("refresh")]
    public async Task<ActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        try
        {
            var response = await authService.Refresh(request);
            return Ok(response);
        }
        catch (Exception e)
        {
            return Problem(
                title: e.Message,
                instance: HttpContext.Request.Path,
                statusCode: StatusCodes.Status400BadRequest
            );
        }
    }

    [Authorize]
    [HttpGet("ping")]
    public IActionResult Ping()
    {
        return Ok(new
        {
            message = "You're authorize",
        });
    }
}