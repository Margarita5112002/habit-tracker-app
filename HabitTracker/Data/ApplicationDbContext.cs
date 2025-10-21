using Microsoft.EntityFrameworkCore;
using HabitTracker.Models.Entities;

namespace HabitTracker.Data;

public class ApplicationDbContext : DbContext
{
    
    public DbSet<User> Users { get; set; }
    public DbSet<RefreshToken> RefreshTokens { get; set; }
    public DbSet<Habit> Habits { get; set; }
    public DbSet<HabitTrack> HabitTracks { get; set; }

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {

    }
    
}