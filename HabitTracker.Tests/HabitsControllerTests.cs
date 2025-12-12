using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;
using HabitTracker;
using HabitTracker.Models.Requests;
using System.Net.Http.Json;
using HabitTracker.Models.DataTransferObjects;
using System.Net;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Mvc;
using FluentResults;
using HabitTracker.Models.Entities;
using FluentAssertions;

namespace HabitTracker.Tests;

public class HabitControllerTests
    : IClassFixture<HabitTrackerWebApplicationFactory<Program>>
{
    public const string HabitsEndpoint = "/api/habits";
    private readonly HabitTrackerWebApplicationFactory<Program> _factory;

    public HabitControllerTests(HabitTrackerWebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _factory.Cleanup();
    }

    private HttpClient CreateAuthenticatedClient()
    {
        return _factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                services.AddAuthentication(defaultScheme: TestAuthHandler.TestScheme)
                    .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>(
                        TestAuthHandler.TestScheme, options => { });
            });
        }).CreateClient();
    }

    [Fact]
    public async Task ValidCreateNewHabitRequest_CreateNewHabit()
    {
        // Arrange
        var client = CreateAuthenticatedClient();

        CreateHabitRequest request = new CreateHabitRequest
        {
            Name = "test",
            Color = "#000000",
            Emoji = ":)",
            Target = 10,
            FrequencyInDays = 1
        };

        // Act
        var response = await client.PostAsJsonAsync(HabitsEndpoint, request);

        // Assert
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadFromJsonAsync<HabitDTO>();
        Assert.NotNull(content);
        Assert.NotEqual(Guid.Empty, content.Id);
        Assert.Equal(request.Name, content.Name);
        Assert.Equal(request.Emoji, content.Emoji);
        Assert.Equal(request.Description, content.Description);
        Assert.Equal(request.FrequencyInDays, content.FrequencyInDays);
        Assert.Equal(request.Target, content.Target);
        Assert.Equal(request.Color, content.Color);
    }

    [Theory]
    [InlineData("", "", "#000000", ":)", 10, 10, "Name")]
    [InlineData("read", "", "000000", ":)", 10, 10, "Color")]
    [InlineData("read", "", "", ":)", 10, 10, "Color")]
    [InlineData("read", "", "#ff00ff", "12345678901", 10, 10, "Emoji")]
    [InlineData("read", "", "#ff00ff", "", 10, 10, "Emoji")]
    [InlineData("read", "", "#ff00ff", ":)", -10, 10, "Target")]
    [InlineData("read", "", "#ff00ff", ":)", 1, -5, "FrequencyInDays")]
    public async Task InvalidCreateNewHabitRequest_ReturnBadRequest(
        string name, string? desc, string color, string emoji, int target, int freq, string badFieldname
    )
    {
        // Arrange
        var client = CreateAuthenticatedClient();

        CreateHabitRequest request = new CreateHabitRequest
        {
            Name = name,
            Description = desc,
            Color = color,
            Emoji = emoji,
            Target = target,
            FrequencyInDays = freq
        };

        // Act
        var response = await client.PostAsJsonAsync(HabitsEndpoint, request);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var content = await response.Content.ReadFromJsonAsync<ProblemDetails>();
        Assert.NotNull(content);
        Assert.Equal("One or more validation errors occurred.", content.Title);

        Assert.True(content.Extensions.TryGetValue("errors", out var errorsObj));
        var errors = Assert.IsType<System.Text.Json.JsonElement>(errorsObj);
        Assert.True(errors.TryGetProperty(badFieldname, out var specError));
        Assert.NotEqual(System.Text.Json.JsonValueKind.Undefined, specError.ValueKind);
        Assert.NotEqual(System.Text.Json.JsonValueKind.Null, specError.ValueKind);

    }

    [Fact]
    public async Task UnauthorizedValidCreateNewHabitRequest_ReturnUnauthorizedStatusCode()
    {
        // Arrange
        var client = _factory.CreateClient();
        CreateHabitRequest request = new CreateHabitRequest
        {
            Name = "test",
            Color = "#000000",
            Emoji = ":)",
            Target = 10,
            FrequencyInDays = 1
        };

        // Act
        var response = await client.PostAsJsonAsync("/api/habits", request);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task ValidGetHabitByIdRequest_ReturnHabitSuccessfully()
    {
        var habit = HabitTrackerWebApplicationFactory<Program>.GetSeededHabits()[0];
        var _client = CreateAuthenticatedClient();

        var habitDto = await _client.GetFromJsonAsync<HabitDTO>($"{HabitsEndpoint}/{habit.Id.ToString()}");

        Assert.NotNull(habitDto);
        habitDto.Should().BeEquivalentTo(habit, options => options.ExcludingMissingMembers());

    }

    [Fact]
    public async Task InvalidGetHabitByIdRequest_Return404StatusCode()
    {
        var _client = CreateAuthenticatedClient();

        var response = await _client.GetAsync($"{HabitsEndpoint}/invalid");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

    }

    [Fact]
    public async Task ValidUpdateHabitRequest_UpdateHabitSuccessfully()
    {
        var habit = HabitTrackerWebApplicationFactory<Program>.GetSeededHabits()[1];
        var client = CreateAuthenticatedClient();
        var request = new UpdateHabitRequest {
            Name = "write",
            Description = "write 500 words per day",
            Emoji = ":^3",
            Color = "#cc0000",
            Target = 500,
            FrequencyInDays = 1,
            AllowCustomValue = true,
            AllowExceedTarget = false
        };

        var response = await client.PutAsJsonAsync($"{HabitsEndpoint}/{habit.Id}", request);
        response.EnsureSuccessStatusCode();

        var updatedHabit = await client.GetFromJsonAsync<HabitDTO>($"{HabitsEndpoint}/{habit.Id}");
        Assert.NotNull(updatedHabit);
        updatedHabit.Should().BeEquivalentTo(request, options => options.ExcludingMissingMembers());
    }

    [Fact]
    public async Task ValidDeleteHabitRequest_DeleteHabitSuccessfully()
    {
        var habit = HabitTrackerWebApplicationFactory<Program>.GetSeededHabits()[1];
        var client = CreateAuthenticatedClient();

        var response = await client.DeleteAsync($"{HabitsEndpoint}/{habit.Id}");
        response.EnsureSuccessStatusCode();

        var deletedHabitResponse = await client.GetAsync($"{HabitsEndpoint}/{habit.Id}");
        deletedHabitResponse.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

}