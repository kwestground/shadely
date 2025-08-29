namespace Shadely.Core;

public class AreaPosition : BaseEntity
{
    public Guid AreaId { get; set; }
    public Area Area { get; set; } = null!;
    public string Name { get; set; } = null!;
    public AreaPositionStatus Status { get; set; } = AreaPositionStatus.Draft;
    public decimal? Width { get; set; }
    public decimal? Height { get; set; }
}
