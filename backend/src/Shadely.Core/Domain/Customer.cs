namespace Shadely.Core;

public class Customer : BaseEntity
{
    public string Name { get; set; } = null!;
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public ICollection<Project> Projects { get; set; } = new List<Project>();
}
