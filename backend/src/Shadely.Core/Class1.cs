namespace Shadely.Core;

// Domain enums (persist as string via EF Core HasConversion<string>())
public enum ProjectStatus { Draft, Measuring, Quoted, Approved, Purchasing, InProduction, Installing, Completed, Cancelled }
public enum AreaPositionStatus { Draft, Measuring, Configured, Quoted, Approved, InProduction, Installing, Completed, Cancelled }
public enum ProductionOrderStatus { Draft, PendingApproval, Approved, WaitingMaterial, InProgress, OnHold, Completed, Cancelled }
public enum ActivityStatus { Scheduled, Confirmed, InProgress, Completed, Cancelled, Rescheduled }
public enum PurchaseOrderStatus { Draft, Sent, Acknowledged, PartiallyReceived, Received, Closed, Cancelled }
public enum InventoryTransactionType { Receipt, Consumption, Allocation, Deallocation, Reservation, ReleaseReservation, Adjustment, TransferOut, TransferIn, Correction, Reversal }

// Base entity with audit + soft delete
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

// Example nucleus entities (minimal skeleton just to start wiring DbContext)
public class Customer : BaseEntity
{
	public string Name { get; set; } = null!;
	public string? Address { get; set; }
	public string? Phone { get; set; }
	public string? Email { get; set; }
	public ICollection<Project> Projects { get; set; } = new List<Project>();
}

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

public class Area : BaseEntity
{
	public Guid ProjectId { get; set; }
	public Project Project { get; set; } = null!;
	public string Name { get; set; } = null!;
	public ICollection<AreaPosition> Positions { get; set; } = new List<AreaPosition>();
}

public class AreaPosition : BaseEntity
{
	public Guid AreaId { get; set; }
	public Area Area { get; set; } = null!;
	public string Name { get; set; } = null!;
	public AreaPositionStatus Status { get; set; } = AreaPositionStatus.Draft;
	public decimal? Width { get; set; }
	public decimal? Height { get; set; }
}

