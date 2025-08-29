namespace Shadely.Core;

public abstract class BaseEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    public Guid? CreatedByUserId { get; set; }
    public DateTime? ModifiedDate { get; set; }
    public Guid? ModifiedByUserId { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime? DeletedDate { get; set; }
    public Guid? DeletedByUserId { get; set; }
    public byte[]? RowVersion { get; set; }
}
