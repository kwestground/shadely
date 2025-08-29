using Microsoft.EntityFrameworkCore;
using Shadely.Infrastructure;
using Shadely.Api.Endpoints;
using Wolverine;

var builder = WebApplication.CreateBuilder(args);
var defaultConnection = builder.Configuration.GetConnectionString("DefaultConnection");

// Wolverine setup
builder.Host.UseWolverine(opts =>
{
    // Auto discovery av handlers i Api assembly (Create.Handle, etc.)
    opts.Discovery.IncludeAssembly(typeof(Program).Assembly);
});

// Services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<ApplicationDbContext>(o => o.UseSqlServer(defaultConnection));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();

    // Auto apply pending EF Core migrations in Development if enabled
    var apply = app.Configuration.GetSection("Database").GetValue<bool>("ApplyMigrations");
    if (apply)
    {
        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        db.Database.Migrate();
    }
}

app.UseHttpsRedirection();
// Minimal API endpoints
app.MapApi();
app.Run();
