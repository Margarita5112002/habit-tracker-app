using HabitTracker.Data;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.EntityFrameworkCore.Infrastructure;
using System.Data.Common;
using HabitTracker.Models.Entities;

namespace HabitTracker.Tests;

public class HabitTrackerWebApplicationFactory<TProgram>
    : WebApplicationFactory<TProgram> where TProgram : class
{

    private static string ConnectionString = "Server=localhost\\SQLEXPRESS;Database=habittrackerapp_tests;Trusted_Connection=True;TrustServerCertificate=True;";
    private static readonly object _lock = new();
    private static bool _databaseInitialized;
    private static readonly User user = new User
    {
        Id = Guid.NewGuid(),
        Username = "TestUser",
        Email = "a@a.com",
        PasswordHash = "hash"
    };
    private static readonly Habit[] habits = [
        new Habit {
            Id = Guid.NewGuid(),
            Name = "read",
            Description = "i want to read more",
            Color = "#0000dd",
            Emoji = ":3",
            Target = 20,
            FrequencyInDays = 1,
            AllowCustomValue = false,
            AllowExceedTarget = false,
            UserId = user.Id,
            HabitTracks = []
        },
        new Habit {
            Id = Guid.NewGuid(),
            Name = "walk",
            Description = "",
            Color = "#00dd0d",
            Emoji = ":)",
            Target = 50,
            FrequencyInDays = 7,
            AllowCustomValue = true,
            AllowExceedTarget = true,
            UserId = user.Id,
            HabitTracks = []
        },
    ];

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            var dbContextDescriptor = services.SingleOrDefault(
                d => d.ServiceType ==
                    typeof(IDbContextOptionsConfiguration<ApplicationDbContext>));

            if (dbContextDescriptor != null)
                services.Remove(dbContextDescriptor);

            var dbConnectionDescriptor = services.SingleOrDefault(
                d => d.ServiceType ==
                    typeof(DbConnection));

            if (dbConnectionDescriptor != null)
                services.Remove(dbConnectionDescriptor);

            services.AddDbContext<ApplicationDbContext>(options =>
            {
                options.UseSqlServer(ConnectionString);
            });

        });

        lock (_lock)
        {
            if (!_databaseInitialized)
            {
                using (var context = CreateContext())
                {
                    context.Database.EnsureDeleted();
                    context.Database.EnsureCreated();

                    Cleanup();
                }

                _databaseInitialized = true;
            }
        }

        builder.UseEnvironment("Development");
    }

    public static User GetTestUser()
    {
        return user;
    }

    public static Habit[] GetSeededHabits()
    {
        return habits;
    }

    public void Cleanup()
    {
        using var context = CreateContext();

        context.Users.RemoveRange(context.Users);
        context.Habits.RemoveRange(context.Habits);
        context.SaveChanges();

        context.AddRange(user);
        context.SaveChanges();

        context.AddRange(habits); 
        context.SaveChanges();
    }

    public ApplicationDbContext CreateContext()
       => new ApplicationDbContext(
           new DbContextOptionsBuilder<ApplicationDbContext>()
               .UseSqlServer(ConnectionString)
               .Options);

}