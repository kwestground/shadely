using Microsoft.EntityFrameworkCore;
using Shadely.Infrastructure;
using Shadely.Core;
using Wolverine;
using Shadely.Api.Abstractions;

namespace Shadely.Api.Endpoints.Customers;

public sealed record GetCustomerListQuery(int? Take = null) : IQuery<IReadOnlyList<CustomerListItem>>;
public sealed record CustomerListItem(Guid Id, string Name, string? Email);

public sealed class GetCustomerListHandler
{
    public async Task<IReadOnlyList<CustomerListItem>> Handle(GetCustomerListQuery q, ApplicationDbContext db, CancellationToken ct)
    {
        var query = db.Customers.AsNoTracking()
            .OrderBy(c => c.Name)
            .Select(c => new CustomerListItem(c.Id, c.Name, c.Email));
        if (q.Take is > 0) query = query.Take(q.Take.Value);
        return await query.ToListAsync(ct);
    }
}

public static class GetCustomerListEndpoint
{
    public static RouteGroupBuilder MapGetCustomerList(this RouteGroupBuilder group)
    {
        group.MapGet("", async ([AsParameters] GetCustomerListQuery q, IMessageBus bus, CancellationToken ct) =>
        {
            var items = await bus.InvokeAsync<IReadOnlyList<CustomerListItem>>(q, ct);
            return Results.Ok(items);
        })
        .WithName("GetCustomerList")
        .Produces<IReadOnlyList<CustomerListItem>>(StatusCodes.Status200OK);
        return group;
    }
}
