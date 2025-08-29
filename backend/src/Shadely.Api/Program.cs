using Microsoft.EntityFrameworkCore;
using Shadely.Infrastructure;
using Shadely.Api.Endpoints;
using Wolverine;

var builder = WebApplication.CreateBuilder(args);

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
builder.Services.AddDbContext<ApplicationDbContext>(o => o.UseInMemoryDatabase("shadely_dev"));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
// Minimal API endpoints
app.MapApi();
app.Run();
