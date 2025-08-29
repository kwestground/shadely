namespace Shadely.Core;

public class Area : BaseEntity
{
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;
    public string Name { get; set; } = null!;
    public ICollection<AreaPosition> Positions { get; set; } = new List<AreaPosition>();
}
