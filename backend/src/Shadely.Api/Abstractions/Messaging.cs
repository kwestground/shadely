namespace Shadely.Api.Abstractions;

// Marker interfaces för tydlighet (används för klassificering, Wolverine kräver dem inte men ger struktur)
public interface ICommand<TResponse> { }
public interface ICommand : ICommand<Unit> { }
public interface IQuery<TResponse> { }
public readonly record struct Unit;
