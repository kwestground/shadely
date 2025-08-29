using Microsoft.EntityFrameworkCore;
using Shadely.Infrastructure;
using Shadely.Core;
using Wolverine;
using Shadely.Api.Abstractions;

namespace Shadely.Api.Endpoints.Customers;

public sealed record GetCustomerByIdQuery(Guid Id) : IQuery<GetCustomerByIdResult?>;
public sealed record GetCustomerByIdResult(Guid Id, string Name, string? Email);

public sealed class GetCustomerByIdHandler
{
    public async Task<GetCustomerByIdResult?> Handle(GetCustomerByIdQuery q, ApplicationDbContext db, CancellationToken ct)
    {
        return await db.Customers.AsNoTracking()
            .Where(c => c.Id == q.Id)
            .Select(c => new GetCustomerByIdResult(c.Id, c.Name, c.Email))
            .FirstOrDefaultAsync(ct);
    }
}

public static class GetCustomerByIdEndpoint
{
    public static RouteGroupBuilder MapGetCustomerById(this RouteGroupBuilder group)
    {
        group.MapGet("{id:guid}", async (Guid id, IMessageBus bus, CancellationToken ct) =>
        {
            var result = await bus.InvokeAsync<GetCustomerByIdResult?>(new GetCustomerByIdQuery(id), ct);
            return result is null ? Results.NotFound() : Results.Ok(result);
        })
        .WithName("GetCustomerById")
        .Produces<GetCustomerByIdResult>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status404NotFound);
        return group;
    }
}
