using Shadely.Api.Endpoints.Customers;

namespace Shadely.Api.Endpoints;

public static class EndpointRegistration
{
    public static void MapApi(this WebApplication app)
    {
        var customers = app
            .MapGroup("/api/customers")
            .WithTags("Customers");
        customers.MapCreateCustomer();
        customers.MapGetCustomerList();
        customers.MapGetCustomerById();
    }
}
