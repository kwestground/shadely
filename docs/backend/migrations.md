# Backend Migrations (Entity Framework Core)

Syfte: Standardisera hur vi skapar och kör EF Core migrations för Shadely backend.

## Projektstruktur

- DbContext: `ApplicationDbContext` i projekt `Shadely.Infrastructure`
- Startup/hosting: `Shadely.Api` (Program.cs konfigurerar DbContext och connection string)
- Migrations-assembly: `Shadely.Infrastructure` (default eftersom DbContext ligger där)

## Förutsättningar

- .NET SDK 9 installerad
- Lokal SQL Server (LocalDB räcker för utveckling) – connection string i `appsettings.json` (`DefaultConnection`)
- Globalt EF-verktyg (rekommenderas uppdatera till matchande huvudversion):
  dotnet tool update --global dotnet-ef

## Skapa migration

Från repo root (viktigt för relative paths):

```powershell
dotnet ef migrations add <Name> -p backend/src/Shadely.Infrastructure/Shadely.Infrastructure.csproj -s backend/src/Shadely.Api/Shadely.Api.csproj
```

Exempel (initial):

```powershell
dotnet ef migrations add Init -p backend/src/Shadely.Infrastructure/Shadely.Infrastructure.csproj -s backend/src/Shadely.Api/Shadely.Api.csproj
```

## Applicera migrationer

```powershell
dotnet ef database update -p backend/src/Shadely.Infrastructure/Shadely.Infrastructure.csproj -s backend/src/Shadely.Api/Shadely.Api.csproj
```

## Vanliga problem

| Problem                                                                       | Orsak                  | Åtgärd                                                                                                                                 |
| ----------------------------------------------------------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| "Your startup project doesn't reference Microsoft.EntityFrameworkCore.Design" | Paket saknas i Api     | Lägg till `<PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="x" PrivateAssets="all" />` i `Shadely.Api.csproj` |
| Migrations hamnar i fel projekt                                               | Fel `-p`/`-s`          | Använd alltid explicita csproj-sökvägar som ovan                                                                                       |
| NU1608 CodeAnalysis-versioner                                                 | Roslyn mismatch        | Aligna via explicit `Microsoft.CodeAnalysis.Workspaces.MSBuild` 4.14.0 i berörda csproj                                                |
| Precision-varningar för decimal                                               | Ingen precision satt   | Använd `.HasPrecision(9,2)` i `OnModelCreating`                                                                                        |
| Verktygsversion äldre än runtime                                              | Global dotnet-ef äldre | Uppdatera globalt dotnet-ef verktyg                                                                                                    |

## Konventioner

- Namnge migrations PascalCase utan datum prefix (EF genererar tidsstämpel). Ex: `AddProjectStatus`, `IntroduceAuditLog`.
- En migration per logisk förändring; kombinera små kolumnändringar om de tillhör samma feature.
- Efter större rename: skapa uppföljande "Cleanup" migration (droppar gamla kolumner) efter data-backfill.

## Rollback

Senaste migration:

```powershell
dotnet ef migrations remove -p backend/src/Shadely.Infrastructure/Shadely.Infrastructure.csproj -s backend/src/Shadely.Api/Shadely.Api.csproj
```

Specifik migration (tillbaka till):

```powershell
dotnet ef database update <MigrationName> -p backend/src/Shadely.Infrastructure/Shadely.Infrastructure.csproj -s backend/src/Shadely.Api/Shadely.Api.csproj
```

## Kodgranskning Checklist (Migrations)

- Förväntade tabeller/kolumner endast? (Granska snapshot diff)
- Inga genererade oönskade skuggindex eller foreign keys.
- Ingen dataloss utan medveten backfill/expand&contract-plan.
- Enums lagras som string (kolumnlängd rimlig, t.ex. `nvarchar(40)`).
- Soft delete och RowVersion fält med (ja på basentiteter).

## Framtida Utökning

- Flytta migrations till separat katalog om antalet blir stort (`Migrations/` under Infrastructure är default OK nu).
- När multi-db eller modulär arkitektur: överväg flera DbContext + map separata migrations assemblies.

---

Kort: Använd alltid både `-p` och `-s`, och håll Infrastructure som migrations-assembly. Uppdatera verktyg vid versionsskillnad.
