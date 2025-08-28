# Shadely - Mini ERP för Gardiner & Solskydd

## Projektöversikt

Shadely är ett mini-ERP system för att hantera försäljning av gardiner, solskydd och tillbehör.
Systemet hanterar hela processen från kundkontakt, uppätning, tillverkning, montering och fakturering (via Fortnox).

## Teknisk Stack

- **Frontend**: Angular med Tailwind CSS + DaisyUI (custom light/dark teman)
- **Backend**: .NET Core med Entity Framework Core
- **Databas**: SQL Server / PostgreSQL
- **Integration**: Fortnox API för fakturering, E-post (smtp/office365), SMS-utskick (ej klart med leverantör)

### Språk

MVP är helt på svenska och vi implementerar ingen flerspråksstöd (i18n). Riktlinjer:

- Kod (klass-/enum-namn) hålls på engelska för tydlighet och framtida eventuell översättning.
- All visningstext i UI är svenska strängar direkt i templates tills behov av i18n uppstår.
- Ingen runtime språkväxling, ingen extraction pipeline behövs.
- Undvik hårdkodade valutatecken i komponenter; använd formattering senare vid behov.

Om/ när flerspråk krävs kan Angular i18n eller ngx-translate införas; strukturera därför inte kataloger efter språk nu.

## Domänmodell

### Kärnentiteter

- **User** - Användarhantering och autentisering
- **Customer** - Kundregister
- **Project** - Kundprojekt (kan innehålla flera rum)
- **Area** - Rum/områden inom ett projekt
- **AreaPosition** - Specifika positioner med produktkonfigurator och QR-koder
- **Items** - Produktkatalog (gardiner, solskydd, tillbehör)
- **Suppliers** - Leverantörsregister
- **PurchaseOrder** - Inköpsorder för material
- **ProductionGroup** - Detaljerade produktionsorder med material och operationer
- **Activity** - Bokningar för mätningar och installationer
- **Inventory** - Materialhantering och lager

### Produktkonfigurator

**AreaPosition** använder två olika typer av konfigurationslogik beroende på produkttyp:

## A. Standardprodukter (Matris-baserad)

### Exempel: Rullgardin

- Produkttypen "Rullgardin" har en familj av ~10 färdiga artiklar
- Konfigurationen sker genom att välja från fördefinierade kombinationer
- **Attribut som definieras för produkttypen:**
  - Färg (från lista)
  - Höjd (från tillgängliga storlekar)
  - Bredd (från tillgängliga storlekar)
- Systemet matchar attributen mot befintliga artiklar i produktfamiljen
- Om kombination finns: välj artikel direkt
- Om kombination saknas: visa närmaste alternativ eller specialbeställning

## B. Kundunika produkter (Dynamisk konfiguration)

### Exempel: Gardin

- En "produktionsartikel" per typ (t.ex. "Gardin")
- Dynamiska attribut grupperade i sektioner för bättre användarupplevelse

**1. Gardin-sektion:**

- Tyg: Välj från Items med Category="Fabric"
- Bredd: Inmatning 10-800 cm
- Höjd: Inmatning (fritt)
- Fästtyp: Dropdown (Wave, Rynk, osv)
- **Yta**: Beräknat attribut `bredd * höjd / 10000` (visas som "2.4 m²")
- **Tygmängd**: Beräknat attribut `yta * 1.1` (visas som "2.64 m²")

**2. Infästning-sektion:**

- Tak/Betong: Dropdown val
- Skena: Välj från Items med Category="Skena"
- Längd: Inmatning för skena
- Monteringsdjup: Inmatning
- Monteringshöjd: Inmatning
- **Total skenalängd**: Beräknat attribut `längd + 2 * monteringsdjup` (visas som "310 cm")
- Kommentar: Fritextfält

**BOM-generering genom formler:**

- Tygmängd = `tygmängd` (använder beräknat attribut)
- Skenalängd = `total_skenalängd` (använder beräknat attribut)
- Fästeantal = `IF(fästtyp="Wave", CEILING(bredd/30), CEILING(bredd/25))`
- Arbetstid = `yta * fästtyp_faktor` (använder beräknat attribut)

Varje konfiguration genererar automatiskt ProductionOrder med material och operationer baserat på vald typ.

### Roller & Behörigheter

- **Säljare** - Skapar projekt, hanterar kundkontakt
- **Inköpare** - Beställer material
- **Mätare** - Utför mätningar, uppdaterar AreaPosition
- **Admin** - Systemadministration

### ProductionGroups

- **Sömmerska** - Hanterar tillverkning av textilier med specifikt timpris
- **Förmontage** - Hanterar förberedelse och förmontage av komponenter med specifikt timpris
- **Montör** - Genomför installation med specifikt timpris

En användare kan ha flera roller och tillhöra flera ProductionGroups.

## User Stories & Workflow

### 1. Projektstart (Säljare)

- Skapa ny kund i systemet
- Skapa nytt projekt kopplat till kund
- Registrera kundens önskade leveransdatum (CustomerRequestedDeliveryDate)
- Definiera rum/områden (Area)
- Lägga till preliminära positioner (AreaPosition) med Prel. materialval
- Sätta preliminära leveransdatum per position (RequestedDeliveryDate)
- Boka mätning via kalendersystem
- Skicka mätuppdrag till Mätare

### 2. Mätning (Mätare - Mobil/tablet-först)

- Ta emot mätuppdrag
- Uppdatera AreaPosition med exakta mått
- Använd produktkonfigurator för att välja produkttyp och parametrar
- Lägga till foton, skisser och dokumentation
- Hantera komplexa mått (djup, vinklar, hinder)
- Markera mätning som klar
- Skicka tillbaka till Säljare för prisberäkning och vidare hantering

### 3. Offert & Beställning (Säljare)

- System genererar automatiskt ProductionOrder från konfigurationer
- Beräkna leveransdatum baserat på material-leveranstider och produktionstid
- Uppdatera CalculatedDeliveryDate på projekt och positioner
- Beräkna priser baserat på material och arbetstid och prispåslag
- Skapa offert för kund med leveransdatum (QuoteDate, QuoteValidUntil, QuoteTotalAmount)
- Sätt projektstatus till "Quoted"
- Vid godkännande: sätt status till "Approved" och aktivera produktionsorder med tidsplan
- Generera inköpsorder (PurchaseOrder) för material
- Skicka till produktionsteam (flera grupper; sömmerska, förmontage)

### 4. Inköp (Inköpare)

- Ta emot och hantera PurchaseOrder
- Välja leveransadress baserat på ordertyp:
  - **Warehouse**: Till eget lager för normalt lager eller tex kapning
  - **Customer**: Direkt till kund för vissa produkter
  - **Production**: Till sömmerska/förmontage för bearbetning
- Beställa material från Suppliers med korrekt leveransadress
- Hantera orderkännande från leverantör med bekräftat leveransdatum
- Uppdatera ExpectedDeliveryDate som påverkar produktionstidsplan
- Automatisk omberäkning av CalculatedDeliveryDate vid förseningar
- **Lagerstyrning**:
  - **Normalt lager**: Skenor, standardtillbehör med beställningspunkt
  - **Orderunikt lager**: Måttbeställda gardiner kopplade till specifikt projekt
- Uppdatera lagerstatus (Inventory) med korrekt lagertyp
- Meddela när material är tillgängligt

### 5. Tillverkning (Sömmerska/Förmontage)

- Ta emot ProductionOrder med detaljerade material och operationer
- Operation tilldelas baserat på användarens ProductionGroup-medlemskap
- Kontrollera materialtillgång via Inventory
- Utföra operationer enligt sekvens och tidsuppskattningar
- Registrera faktisk arbetstid (beräknas mot ProductionGroup timpris)
- Markera operationer och hela ordern som klar
- Uppdatera lagerstatus för förbrukade material
- Skicka till Montör för installation

### 6. Installation (Montör - Mobil/Tablet-först)

- Ta emot installationsuppdrag via mobil webapp
- Boka installation via kalendersystem
- Scanna QR-kod för att identifiera projekt/position
- Genomföra montering enligt specifikation
- Dokumentera färdigt arbete med foton
- Markera projekt som klart

### 7. Fakturering (System)

- Automatisk export till Fortnox baserat på slutförd projekt, ska kunna delfaktureras
- Skapa faktura baserat på material och arbetstid
- Hantera eventuella justeringar och tillägg

## Teknisk Arkitektur

### Backend (.NET Core)

```text
src/
├── Shadely.Api/              # Web API controllers
├── Shadely.Core/             # Domain models & interfaces
├── Shadely.Infrastructure/   # EF Core, repositories
├── Shadely.Services/         # Business logic
└── Shadely.Integration/      # Fortnox integration
```

### Frontend (Angular)

```typescript
src/
├── app/
│   ├── core/                 # Auth, guards, interceptors
│   ├── shared/               # Shared components, QR-kod scanner
│   │   ├── components/       # Återanvändbara UI-komponenter
│   │   ├── directives/       # Tailwind-optimerade direktiv
│   │   └── pipes/            # Utility pipes
│   ├── features/
│   │   ├── auth/             # Inloggning, registrering, profil
│   │   ├── users/            # Användarhantering
│   │   ├── production-groups/ # ProductionGroup hantering
│   │   ├── customers/
│   │   ├── projects/
│   │   ├── areas/
│   │   ├── configurator/     # Produktkonfigurator
│   │   ├── measurements/     # Mobil-optimerad mätapp
│   │   ├── calendar/         # Bokningssystem
│   │   ├── inventory/        # Materialhantering
│   │   ├── purchase/         # Inköpsorder
│   │   ├── production/       # BOM och tillverkning
│   │   ├── installation/     # Mobil-optimerad monterapp
│   │   └── customer-portal/  # Framtida kundportal
│   └── layouts/
├── assets/
│   └── styles/               # Tailwind konfiguration
│       ├── tailwind.config.js
│       └── global.css
└── environments/
```

## Databas Schema (Preliminär)

### Users

- Id, UserName, Email, PasswordHash, Salt
- FirstName, LastName, Phone, CreatedDate
- IsActive, LastLoginDate, FailedLoginAttempts

### UserRoles

- Id, UserId, Role
- Role (Säljare/Inköpare/Mätare/Admin)

### ProductionGroups (Roller)

- Id, Name, Description, HourlyRate
- Name (Sömmerska/Förmontage/Montör)
- IsActive, CreatedDate

### UserProductionGroups

- Id, UserId, ProductionGroupId, JoinedDate
- IsActive, Notes

### UserSessions

- Id, UserId, SessionToken, CreatedDate, ExpiresDate
- IsActive, LastActivityDate, IpAddress, UserAgent

### Customers

- Id, Name, Address, Phone, Email, CreatedDate

### Suppliers

- Id, Name, ContactPerson, Address, Phone, Email
- PaymentTerms, DeliveryTerms, IsActive, CreatedDate
- Notes, Website, OrganizationNumber

### Projects

- Id, CustomerId, Name, Status, CreatedDate, CompletedDate
- CustomerRequestedDeliveryDate, CalculatedDeliveryDate
- QuoteDate, QuoteValidUntil, QuoteTotalAmount, QuoteNotes
- Status (FK -> ProjectStatusEnum)

### Areas

- Id, ProjectId, Name, Description, RoomType

### AreaPositions

- Id, AreaId, Name, PositionType, Width, Height, Depth
- ProductTypeId, ConfigurationType, SelectedItemId (för Matrix-typ)
- ConfigurationData (JSON för Dynamic-typ), ConfigurationHash
- Measurements, Photos, Notes, Status (FK -> AreaPositionStatusEnum)
- RequestedDeliveryDate, CalculatedDeliveryDate, ActualDeliveryDate

### Items

- Id, Name, Category, Price, ListPrice, Description
- InventoryType (Normal/OrderSpecific)
- ReorderPoint, ReorderQuantity (endast för Normal lager)
- Unit (Grundenhet: st, m, kg, etc.)
- CostPrice, Margin, IsActive, CreatedDate
- ProductTypeId (null för vanliga material, ifyllt för produktionsartiklar)

### ItemAttributes

- Id, AttributeName, AttributeType, IsRequired
- Category, Description, ValidationRules (JSON)
- AttributeType: 'Selection', 'NumberRange', 'FreeText', 'Color', 'Dimension'
- CreatedDate, UpdatedDate
- (Definierar vilka attribut som finns tillgängliga systemet, t.ex. "Färg", "Bredd", "Höjd")

### ItemAttributeOptions

- Id, ItemAttributeId, OptionValue, DisplayName
- IsDefault, DisplayOrder, HexColor (för färger)
- (Endast för AttributeType='Selection' - fördefinierade val som "Vit", "Svart", etc.)

### ItemAttributeValues

- Id, ItemId, ItemAttributeId, AttributeValue
- CreatedDate, UpdatedDate
- (Lagrar faktiska värden för artiklar, t.ex. ItemId=123, AttributeId=1(Färg), Value="Vit")

### ItemUnits

- Id, ItemId, Unit, ConversionFactor, PriceMultiplier
- Description (t.ex. "meter", "m2", "styck")

### ItemSuppliers

- Id, ItemId, SupplierId, SupplierArticleNumber
- SupplierUnit, SupplierPrice, LeadTimeDays
- MinOrderQuantity, IsPreferred

### ProductTypes

- Id, Name, ConfigurationType, Description
- ConfigurationType: 'Matrix' (standardprodukter) eller 'Dynamic' (kundunika)
- IsActive, CreatedDate

### ProductTypeAttributes

- Id, ProductTypeId, AttributeName, AttributeType, IsRequired
- DisplayOrder, ValidationRules (JSON)
- AttributeType: 'Selection', 'NumberRange', 'FreeText', 'ItemSelection', 'Calculation'
- Category (för ItemSelection - t.ex. "Fabric", "Skena")
- CalculationFormula (för AttributeType='Calculation' - t.ex. "bredd * höjd")
- DisplayFormat (för Calculation - t.ex. "{0:F2} m²", "SEK {0:N0}")
- IsVisibleInUI (true för att visa beräknat värde till användaren)

### ProductTypeAttributeOptions

- Id, ProductTypeAttributeId, OptionValue, DisplayName
- IsDefault, DisplayOrder
- (Endast för AttributeType='Selection')

### ProductFamilies

- Id, ProductTypeId, FamilyName, Description
- (För Matrix-baserade produkter som rullgardiner)

### ProductFamilyItems

- Id, ProductFamilyId, ItemId
- IsActive, DisplayOrder
- (Kopplar Items till ProductFamily, attributvärden hämtas från ItemAttributeValues)

### ConfigurationSections

- Id, ProductTypeId, SectionName, DisplayOrder
- Description, IsCollapsible
- (För Dynamic-produkter - grupperar attribut i sektioner som "Gardin", "Infästning")

### ConfigurationSectionAttributes

- Id, ConfigurationSectionId, ProductTypeAttributeId, DisplayOrder
- IsVisible, ConditionalVisibility (JSON för villkor)

### ProductionOrders

- Id, AreaPositionId, Status, CreatedDate, DueDate
- AssignedUserId, Priority, Notes
- CalculatedStartDate, CalculatedCompletionDate
- Status (FK -> ProductionOrderStatusEnum)

### ProductionOrderOperations

- Id, ProductionOrderId, OperationName, OperationType
- EstimatedHours, ActualHours, ProductionGroupId
- AssignedUserId, Status, SequenceOrder
- Description, Notes
- PlannedStartDate, PlannedEndDate, ActualStartDate, ActualEndDate

### ProductionOrderMaterials

- Id, ProductionOrderOperationId, ItemId, RequiredQuantity, Unit
- AllocatedQuantity, ConsumedQuantity, UnitPrice
- Notes, Status, RequiredDate

### ItemOperations

- Id, ItemId, OperationName, ProductionGroupId, EstimatedHours
- HoursFormula, Description, SequenceOrder
- IsRequired, Conditions (JSON för när operationen behövs)
- Exempel operation: "Sy gardin" med formula `(bredd * höjd /10000) * fästtyp_faktor`

### ItemMaterials

- Id, ItemId, MaterialItemId, QuantityFormula, Unit
- WasteFactor, IsOptional, Description
- Conditions (JSON för när materialet behövs)
- (T.ex: ItemId=Gardin, MaterialItemId=Tyg, Formula: "bredd * höjd *1.1")

### PurchaseOrders

- Id, SupplierId, Status (FK -> PurchaseOrderStatusEnum), OrderDate, ExpectedDeliveryDate
- TotalAmount, Notes
- DeliveryType (Warehouse/Customer/Production)
- DeliveryAddress, DeliveryContactPerson, DeliveryPhone
- ProjectId (null för normalt lager, ifyllt för orderspecifik leverans)

### PurchaseOrderItems

- Id, PurchaseOrderId, ItemId, Quantity, UnitPrice

### Inventory

- Id, ItemId, Quantity, ReservedQuantity, MinimumStock
- LastUpdated, Location
- ProjectId (null för normalt lager, ifyllt för orderunikt)
- InventoryType (Normal/OrderSpecific)

### InventoryTransactions (NY)

- Id, ItemId, TransactionType (FK -> InventoryTransactionTypeEnum)
- QuantityChange (positiv/negativ), PreviousQuantity, NewQuantity
- ReservedChange, PreviousReserved, NewReserved
- ProjectId (för orderunikt)
- ReferenceType (ProductionOrder, PurchaseOrder, Adjustment, AreaPosition)
- ReferenceId
- CorrelationId (batch-id)
- PerformedByUserId, PerformedDate
- Notes, IsReversal, ReversesTransactionId

Syfte: Full spårbarhet av lagerförändringar, möjliggör revision och differensanalyser.

### Activity

- Id, ProjectId, Type (Measurement/Installation), ScheduledDate
- AssignedUserId, Status (FK -> ActivityStatusEnum), Notes
- PlannedStartTime, PlannedEndTime, ActualStartTime, ActualEndTime

### Attachments

- Id, EntityType, EntityId, FileName, FilePath, FileSize
- FileType (Image/Document/Video), MimeType, Description
- UploadedBy, UploadedDate, IsActive
- EntityType: 'Project', 'Area', 'AreaPosition', 'ProductionOrder'
- (Flexibel filhantering för alla huvudentiteter)

### AuditLog (NY)

- Id, EntityType, EntityId
- Action (Create, Update, Delete, Restore, StatusChange, SoftDelete, HardDelete)
- ChangedByUserId, ChangedDate
- FieldChanges (JSON [{ field, old, new }])
- Summary, CorrelationId, Source (API, UI, SystemJob)
- PreviousStatus, NewStatus
- IpAddress, UserAgent

Implementeras via EF Core SaveChanges-interceptor + domänhändelser. Ignorera tekniska fält (RowVersion etc.).

### Soft Delete Standard (NY)

Basfält på huvudentiteter: IsDeleted, DeletedDate, DeletedByUserId.

#### Regler

- UI-delete -> Soft delete (sätter IsDeleted)
- Hard delete endast via admin-jobb (loggas som HardDelete)
- Global query filter `IsDeleted = false` med override i adminvy.

### Status & Typer (Code Enums)

Vi ersätter tidigare idé om enum-tabeller med vanliga .NET enums i kodbasen under MVP.

Exempel (C#):
 
```csharp
public enum ProjectStatus { Draft, Measuring, Quoted, Approved, Purchasing, InProduction, Installing, Completed, Cancelled }
public enum AreaPositionStatus { Draft, Measuring, Configured, Quoted, Approved, InProduction, Installing, Completed, Cancelled }
public enum ProductionOrderStatus { Draft, PendingApproval, Approved, WaitingMaterial, InProgress, OnHold, Completed, Cancelled }
public enum ActivityStatus { Scheduled, Confirmed, InProgress, Completed, Cancelled, Rescheduled }
public enum PurchaseOrderStatus { Draft, Sent, Acknowledged, PartiallyReceived, Received, Closed, Cancelled }
public enum InventoryTransactionType { Receipt, Consumption, Allocation, Deallocation, Reservation, ReleaseReservation, Adjustment, TransferOut, TransferIn, Correction, Reversal }
```

Persistens: lagras som string via `HasConversion<string>()` för läsbarhet.
Översättning/visningsnamn hanteras i frontend eller via en statisk mapping-service.
Vill vi senare lägga till metadata (beskrivningar, sortering, inaktivering) kan vi migrera specifika enums till tabeller utan att ändra domänlogik (introducera Value Objects + lookup cache).

### MaterialShortageView (Use Case)

Vy (eller materialiserad vy) för att upptäcka brister innan produktion stoppar.

#### Beräkning

- Summera ej slutförda ProductionOrderMaterials + framräknade framtida behov (ItemMaterials-expansion) minus (Allocated + Reserved + OnHand).

Fält (exempel): ItemId, ItemName, RequiredQuantity, AllocatedQuantity, ReservedQuantity, OnHandQuantity, AvailableQuantity (OnHand-Allocated-Reserved), ShortageQuantity (max(Required-Available,0)), EarliestNeededDate, InventoryType, ProjectId (orderunikt), PreferredSupplierId, LeadTimeDays, SuggestedOrderDate, ShortageSeverity.

#### Flöde

1. Inköpare filtrerar ShortageQuantity > 0
2. Markerar rader -> "Skapa PO" (manuell trigger)
3. System grupperar per Supplier & InventoryType, avrundar upp mot MinOrderQuantity/ReorderQuantity
4. Skapar PurchaseOrder + AuditLog + Reservation-transaktioner (Reservation/Allocation vid bekräftelse)

Edge cases: Negativt OnHand -> ShortageSeverity=DataError, OrderSpecific visas per ProjectId, supplier-byte påverkar nästa vy-refresh.

### Flödespåverkan

1. Statusbyte valideras mot definierade transitions i kod (dictionary/state machine) och loggas.
2. Soft delete loggas (Action=SoftDelete) och exkluderas via filter.
3. Lagerändringar går via InventoryService -> InventoryTransactions batch.
4. MaterialShortageView konsumeras innan PO-skapande; Receipt skapar Receipt-transaktion; vid allokering: Allocation.

### Implementation Noteringar

- BaseEntity: Id, CreatedDate, CreatedByUserId, ModifiedDate, ModifiedByUserId, IsDeleted, DeletedDate, DeletedByUserId, RowVersion
- Audit: ChangeTracker diff -> FieldChanges JSON
- Inventory disponibelt = Quantity - Allocated - Reserved
- Reversal: spegling med länkat ReversesTransactionId
- Enums lagras som string; vid namnbyte skapa fallback mapping/migration-script
  (ex: tidigare värde 'InProduction' -> nytt 'Production' hanteras via script + AllowedLegacyValues-lista)

---
Tillägg: standardiserade statusar, revisionsspårning, soft delete, inventeringstransaktioner och shortage-analys.

## Utvecklingsfaser

### Fas 1: Grundfunktioner (MVP)

- [ ] Användarhantering & autentisering
- [ ] Rollbaserade behörigheter (RBAC)
- [ ] CRUD för Customer, Project, Area
- [ ] Grundläggande AreaPosition hantering
- [ ] Enkel produktkatalog (Items)
- [ ] Status-flöde för projekt

### Fas 2: Produktkonfigurator & Mätning

- [ ] Produktkonfigurator med dynamiska parametrar
- [ ] ProductionOrder-generering från konfigurationer
- [ ] Avancerad AreaPosition med mått och foton
- [ ] Mobilanpassad mätapp
- [ ] Attachments-system för filer och bilder
- [ ] Foto-upload och skiss-hantering

### Fas 3: Kalender & Bokningssystem

- [ ] Bokningssystem för mätningar och installationer
- [ ] Activity-hantering med statusuppföljning
- [ ] Kalenderintegration och schemaläggning
- [ ] Notifieringar för bokningar
- [ ] Resursplanering för personal

### Fas 4: Materialhantering & Inköp

- [ ] Inventory-hantering med normalt/orderunikt lager
- [ ] Automatisk beställningspunkt för normalt lager
- [ ] PurchaseOrder-system med lagertyphantering
- [ ] Leveransadresshantering (Warehouse/Customer/Production)
- [ ] Leverantörsintegration
- [ ] Automatisk materialreservation per lagertyp

### Fas 5: Prissättning & Produktion

- [ ] Prisberäkningar baserat på ProductionOrder
- [ ] Offertgenerering (PDF)
- [ ] Produktionsorder och statusuppföljning
- [ ] Materialförbrukning och lageruppdatering
- [ ] Mobilanpassad monterapp

### Fas 6: Integration & Rapporter

- [ ] Fortnox integration med BOM-baserad fakturering
- [ ] SMS och e-post notifieringar
- [ ] Rapporter & dashboard
- [ ] Export/import funktioner
- [ ] QR-kod generering och scanning

### Fas 7: Kundportal & Avancerade funktioner

- [ ] Kundportal för projektuppföljning
- [ ] Avancerad rapportering och analytics
- [ ] Smart notifieringar och automatisering
- [ ] API för tredjepartsintegration

## Speciella funktioner

### QR-kod System

- QR-koder genereras dynamiskt baserat på entitet-ID
- Format: `shadely://project/{id}`, `shadely://area/{id}`, `shadely://position/{id}`
- QR-koder används för snabb identifiering i fält
- Mobila appar kan scanna koder för att komma direkt till rätt vy
- Ingen separat databatabell behövs - QR-koder pekar direkt på entiteter

### Dynamisk Produktkonfigurator

- Dynamisk konfiguration baserat på produkttyp
- Genererar automatiskt ProductionOrders med material och operationer
- Validering av kompatibilitet mellan komponenter
- Prisberäkning i realtid baserat på material och arbetstid

### Mobil-först Design

- Mätapp optimerad för tablets och telefoner med Tailwind CSS
- Responsiv design med mobile-first approach
- Touch-optimerade kontroller och komponenter
- Offline-kapacitet för mätningar
- Synkronisering när anslutning är tillgänglig
- Tailwind utilities för snabb prototyping och konsistent design

### Lagerstyrningssystem

**Normalt Lager**:

- Används för standardprodukter som skenor, fästen, standardtillbehör
- Har beställningspunkt (ReorderPoint) och beställningskvantitet
- Automatiska påfyllningsorder när lagret går under minimum
- Kan användas för flera projekt samtidigt

**Orderunikt Lager**:

- Används för måttbeställda produkter som gardiner, persienner
- Kopplas till specifikt projekt (ProjectId)
- Beställs endast mot behov för det specifika projektet
- Kan inte användas för andra projekt

## Nästa Steg

1. Detaljera AreaPosition modellen
2. Definiera exakt statusflöde
3. Skapa wireframes för huvudfunktioner
4. Sätta upp utvecklingsmiljö

## Referenser

- Angular officiell LLM-referens: <https://angular.dev/llms.txt>
- DaisyUI LLM-referens: <https://daisyui.com/llms.txt>

## UI / Styling (Tailwind + DaisyUI)

Mål: Snabb komponentbas + eget branding med två teman (light/dark) och möjlighet att senare utöka.

### Teman

Light theme id: `shadelylight`  | Dark theme id: `shadelydark`

Växling sker genom att sätta `data-theme="shadelylight"` eller `data-theme="shadelydark"` på `<html>` eller en wrapper.

### Rekommenderat filupplägg

- `tailwind.config.js` – innehåller DaisyUI theme-definitioner
- `src/styles.css` (eller `global.css`) – import av Tailwind layers
- `src/app/core/theme/theme.service.ts` – enkel Angular service för toggle (valfritt)

### Minimal konfig (utdrag)

```js
// tailwind.config.js (utdrag)
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  darkMode: 'class',
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        shadelylight: {
          primary: '#3F6B9E',
          'primary-content': '#ffffff',
          secondary: '#7B8BA3',
          accent: '#D97706',
          neutral: '#374151',
          'base-100': '#ffffff',
          info: '#0ca5e9',
          success: '#16a34a',
          warning: '#f59e0b',
          error: '#dc2626'
        }
      },
      {
        shadelydark: {
          primary: '#64A5FF',
          'primary-content': '#0B1221',
          secondary: '#8899B1',
          accent: '#F59E0B',
          neutral: '#1E293B',
          'base-100': '#0F172A',
          info: '#38bdf8',
          success: '#22c55e',
          warning: '#f59e0b',
          error: '#f87171'
        }
      }
    ]
  }
}
```

### Angular theme toggle (exempel)

```ts
// theme.service.ts
import { Injectable } from '@angular/core';

type Theme = 'shadelylight' | 'shadelydark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private current: Theme = (localStorage.getItem('theme') as Theme) || 'shadelylight';
  init() { this.apply(this.current); }
  toggle() { this.apply(this.current === 'shadelylight' ? 'shadelydark' : 'shadelylight'); }
  private apply(t: Theme) {
    this.current = t;
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('theme', t);
  }
}
```

Anropa `themeService.init()` i `AppComponent` `ngOnInit`.

### Komponentexempel

```html
<button class="btn btn-primary" (click)="theme.toggle()">Byt tema</button>
<div class="card bg-base-100 shadow">
  <div class="card-body">
    <h2 class="card-title">Projekt</h2>
    <p>Översikt...</p>
  </div>
</div>
```

### Riktlinjer

- Återanvänd DaisyUI för bas (buttons, inputs, modals)
- Skräddarsy domäntunga vyer (konfigurator, mätning) med utility-klasser för exakt layout
- Lägg inte inline-färger; använd semantiska klasser (btn-primary etc.)
- Om färg behöver särskiljas: överväg ny semantic token i theme, inte hårdkoda HEX

### Ljus / mörk kontrastcheck

När teman justeras: verifiera med t.ex. Lighthouse / axe att kontrast AA bibehålls (primärt mot base-100 / base-content).

### Framtida förbättring

- Lägg till tredje tema för kundportal med mjukare neutrals
- Introducera CSS vars för spacing/typografi tokens om design blir mer avancerad
- Automatisk dark-mode detektion via `prefers-color-scheme` innan man läser localStorage

### Frontend Mock (Angular + Tailwind + DaisyUI)

En prototyp finns i `frontend/` med en mock dashboard (ingen backend). Starta:

```powershell
cd frontend
npm start
```

Funktioner:

- Drawer-layout med sidomeny + topbar
- Tema-toggle (light/dark) persist via localStorage
- Stat cards, tabell, materialbrist-lista, timeline, quick actions
- Allt hårdkodat för UI-experiment

Nästa UI-steg: skapa komponentbibliotek (atoms/molecules), definiera spacing & typography tokens, börja bygga riktiga feature-moduler.
