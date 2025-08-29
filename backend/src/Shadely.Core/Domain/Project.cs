namespace Shadely.Core;

public class Project : BaseEntity
{
    public Guid CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;
    public string Name { get; set; } = null!;
    public ProjectStatus Status { get; set; } = ProjectStatus.Draft;
    public DateTime? CustomerRequestedDeliveryDate { get; set; }
    public DateTime? CalculatedDeliveryDate { get; set; }
    public ICollection<Area> Areas { get; set; } = new List<Area>();
}
