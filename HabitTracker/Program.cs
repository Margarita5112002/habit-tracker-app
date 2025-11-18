using System.Text;
using HabitTracker.Data;
using HabitTracker.Services.Habits;
using HabitTracker.Services.Users;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using NotesApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddHttpContextAccessor();
builder.Services
    .AddDbContext<ApplicationDbContext>(options =>
    {
        options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
    });

builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<ICurrentUser, CurrentUser>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IHabitService, HabitService>();
builder.Services.AddScoped<IHabitTrackService, HabitTrackService>();

var jwtsettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>();
var tokenValidationParameters = new TokenValidationParameters
{
    ValidateAudience = true,
    ValidAudience = jwtsettings?.Audience,
    ValidateIssuer = true,
    ValidIssuer = jwtsettings?.Issuer,
    ValidateLifetime = true,
    IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtsettings!.Token)
            ),
    ValidateIssuerSigningKey = true,
    ClockSkew = TimeSpan.Zero
};
builder.Services.AddSingleton(tokenValidationParameters);
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.SaveToken = true;
        options.TokenValidationParameters = tokenValidationParameters;
    });

var allowOrigins = builder.Configuration.GetValue<string>("AllowOrigins")!.Split(",");
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(allowOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.UseStaticFiles();
app.MapFallbackToFile("index.html");

app.Run();
