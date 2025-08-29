namespace Shadely.Core;

// Domain enums (persist as string via EF Core HasConversion<string>())
public enum ProjectStatus { Draft, Measuring, Quoted, Approved, Purchasing, InProduction, Installing, Completed, Cancelled }
public enum AreaPositionStatus { Draft, Measuring, Configured, Quoted, Approved, InProduction, Installing, Completed, Cancelled }
public enum ProductionOrderStatus { Draft, PendingApproval, Approved, WaitingMaterial, InProgress, OnHold, Completed, Cancelled }
public enum ActivityStatus { Scheduled, Confirmed, InProgress, Completed, Cancelled, Rescheduled }
public enum PurchaseOrderStatus { Draft, Sent, Acknowledged, PartiallyReceived, Received, Closed, Cancelled }
public enum InventoryTransactionType { Receipt, Consumption, Allocation, Deallocation, Reservation, ReleaseReservation, Adjustment, TransferOut, TransferIn, Correction, Reversal }
