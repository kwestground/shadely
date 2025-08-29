using Microsoft.AspNetCore.Mvc;
using Shadely.Core;
using Shadely.Infrastructure;
using Wolverine;
using Shadely.Api.Abstractions;

namespace Shadely.Api.Endpoints.Customers;

// Command + Result
public sealed record CreateCustomerCommand(string Name, string? Email, string? Phone) : ICommand<CreateCustomerResult>;
public sealed record CreateCustomerResult(Guid Id, string Name, string? Email);

// Wolverine handler (klass med Handle)
public sealed class CreateCustomerHandler
{
    public async Task<CreateCustomerResult> Handle(CreateCustomerCommand cmd, ApplicationDbContext db, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(cmd.Name)) throw new ArgumentException("Name required");
        var entity = new Customer { Name = cmd.Name, Email = cmd.Email, Phone = cmd.Phone };
        db.Customers.Add(entity);
        await db.SaveChangesAsync(ct);
        return new CreateCustomerResult(entity.Id, entity.Name, entity.Email);
    }
}

public static class CreateCustomerEndpoint
{
    public static RouteGroupBuilder MapCreateCustomer(this RouteGroupBuilder group)
    {
        group.MapPost("", async ([FromBody] CreateCustomerCommand cmd, IMessageBus bus, CancellationToken ct) =>
        {
            var result = await bus.InvokeAsync<CreateCustomerResult>(cmd, ct);
            return Results.Created($"/api/customers/{result.Id}", result);
        })
        .WithName("CreateCustomer")
        .Produces<CreateCustomerResult>(StatusCodes.Status201Created);
        return group;
    }
}
