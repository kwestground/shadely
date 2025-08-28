# Shadely - Mini ERP för Gardiner & Solskydd

## Projektöversikt

Shadely är ett mini-ERP system för att hantera försäljning av gardiner, solskydd och tillbehör.
Systemet hanterar hela processen från kundkontakt, uppätning, tillverkning, montering och fakturering (via Fortnox).

## Teknisk Stack

- **Frontend**: Angular med Tailwind CSS
- **Backend**: .NET Core med Entity Framework Core
- **Databas**: SQL Server / PostgreSQL
- **Integration**: Fortnox API för fakturering, E-post (smtp/office365), SMS-utskick (ej klart med leverantör)

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

**Exempel: Rullgardin**
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

**Exempel: Gardin**
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
- Skapa offert för kund med leveransdatum
- Vid godkännande: aktivera produktionsorder med tidsplan
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

```
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

### ProductionGroups

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

### Projects

- Id, CustomerId, Name, Status, CreatedDate, CompletedDate
- CustomerRequestedDeliveryDate, CalculatedDeliveryDate
- Status: Draft, Measuring, Quoted, Approved, Purchasing, InProduction, Installing, Completed

### Areas

- Id, ProjectId, Name, Description, RoomType

### AreaPositions

- Id, AreaId, Name, PositionType, Width, Height, Depth
- ProductTypeId, ConfigurationType, SelectedItemId (för Matrix-typ)
- ConfigurationData (JSON för Dynamic-typ), ConfigurationHash
- Measurements, Photos, Notes, Status
- RequestedDeliveryDate, CalculatedDeliveryDate, ActualDeliveryDate

### ConfigurationComponents

- Id, AreaPositionId, ComponentType (Infästning/Kappa/etc.)
- Position, ComponentData (JSON med alla parametrar)
- MainItemId, SecondaryItemId, Quantity, SecondaryQuantity

### ComponentParameters

- Id, ConfigurationComponentId, ParameterName, ParameterValue
- ParameterType (Text/Number/Selection/Material)

### Items

- Id, Name, Category, Price, Description
- InventoryType (Normal/OrderSpecific)
- ReorderPoint, ReorderQuantity (endast för Normal lager)
- Unit (Grundenhet: st, m, kg, etc.)

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

### ProductConfigurations

- Id, ProductType, MainProduct, ConfigurationTemplate (JSON)
- Beskriver vilka parametrar som är tillgängliga för varje produkttyp

### ProductionOrders

- Id, AreaPositionId, Status, CreatedDate, DueDate
- AssignedUserId, Priority, Notes
- CalculatedStartDate, CalculatedCompletionDate
- Status: Draft, Approved, InProgress, Completed, OnHold

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
- (T.ex: "Sy gardin", Formula: "(bredd * höjd / 10000) * fästtyp_faktor")

### ItemMaterials

- Id, ItemId, MaterialItemId, QuantityFormula, Unit
- WasteFactor, IsOptional, Description
- Conditions (JSON för när materialet behövs)
- (T.ex: ItemId=Gardin, MaterialItemId=Tyg, Formula: "bredd * höjd * 1.1")

### PurchaseOrders

- Id, SupplierId, Status, OrderDate, ExpectedDeliveryDate
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

### Activity

- Id, ProjectId, Type (Measurement/Installation), ScheduledDate
- AssignedUserId, Status, Notes
- PlannedStartTime, PlannedEndTime, ActualStartTime, ActualEndTime

## Utvecklingsfaser

### Fas 1: Grundfunktioner (MVP)

- [ ] Användarhantering & autentisering
- [ ] Rollbaserade behörigheter (RBAC)
- [ ] CRUD för Customer, Project, Area
- [ ] QR-kod generering och scanning
- [ ] Grundläggande AreaPosition hantering
- [ ] Enkel produktkatalog (Items)
- [ ] Status-flöde för projekt

### Fas 2: Produktkonfigurator & Mätning

- [ ] Produktkonfigurator med dynamiska parametrar
- [ ] ProductionOrder-generering från konfigurationer
- [ ] Avancerad AreaPosition med mått och foton
- [ ] Mobilanpassad mätapp med QR-scanning
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
