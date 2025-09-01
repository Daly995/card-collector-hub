# Card Collector Hub - Java Full Stack Project Plan

## Project Overview
A modern web application for managing and tracking your trading card collections, including sports cards and TCGs with price tracking, collection analytics, and market insights.

## Updated Tech Stack for Java Full Stack Developer Role

### Frontend
- **Angular** (latest version) - Component-based SPA framework
- **TypeScript** - Type-safe JavaScript
- **Angular Material** or **Tailwind CSS** - UI components and styling
- **RxJS** - Reactive programming for async operations
- **Chart.js/ng2-charts** - Data visualization

### Backend  
- **Java** (17+) - Core programming language
- **Spring Boot** (3.x) - Application framework
- **Spring Data JPA** - Database abstraction layer
- **Spring Security** - Authentication and authorization
- **Spring Web** - REST API development
- **Maven/Gradle** - Build and dependency management

### Database
- **PostgreSQL** - Primary database
- **H2** - In-memory database for testing
- **Redis** (optional) - Caching layer

### Additional Technologies
- **JWT** - Token-based authentication
- **Docker** - Containerization
- **JUnit 5** - Unit testing
- **Mockito** - Mocking framework

## Updated Project Structure
```
card-collector-hub/
├── backend/                     # Spring Boot application
│   ├── src/main/java/
│   │   └── com/cardcollector/
│   │       ├── CardCollectorApplication.java
│   │       ├── config/          # Configuration classes
│   │       ├── controller/      # REST controllers
│   │       ├── dto/            # Data Transfer Objects
│   │       ├── entity/         # JPA entities
│   │       ├── repository/     # JPA repositories
│   │       ├── service/        # Business logic
│   │       └── security/       # Security configuration
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   └── data.sql           # Sample data
│   ├── src/test/              # Unit and integration tests
│   └── pom.xml               # Maven dependencies
├── frontend/                   # Angular application
│   ├── src/app/
│   │   ├── components/        # Reusable components
│   │   ├── pages/            # Page components
│   │   ├── services/         # HTTP services
│   │   ├── models/           # TypeScript interfaces
│   │   ├── guards/           # Route guards
│   │   └── interceptors/     # HTTP interceptors
│   ├── angular.json
│   └── package.json
└── database/                   # SQL scripts and migrations
    ├── schema.sql
    └── sample-data.sql
```

## Database Design (PostgreSQL)

### Core Tables
```sql
-- Card Universe/Sets
CREATE TABLE card_sets (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    game_type ENUM('SPORTS', 'POKEMON', 'MTG', 'YUGIOH', 'OTHER'),
    sport_type ENUM('BASEBALL', 'BASKETBALL', 'FOOTBALL', 'HOCKEY', 'SOCCER') NULL,
    release_date DATE,
    total_cards INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Master Card Information
CREATE TABLE cards (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    set_id BIGINT,
    card_number VARCHAR(50),
    name VARCHAR(255) NOT NULL,
    rarity VARCHAR(100),
    card_type VARCHAR(100),
    -- Sports specific
    player_name VARCHAR(255),
    team VARCHAR(100),
    position VARCHAR(50),
    rookie_year INTEGER,
    -- TCG specific
    mana_cost VARCHAR(50),
    attack_power INTEGER,
    defense_power INTEGER,
    abilities TEXT,
    -- Common
    description TEXT,
    image_url VARCHAR(500),
    api_card_id VARCHAR(100), -- For external API mapping
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (set_id) REFERENCES card_sets(id)
);

-- User's Collection
CREATE TABLE collection_cards (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    card_id BIGINT,
    condition_grade ENUM('MINT', 'NEAR_MINT', 'EXCELLENT', 'VERY_GOOD', 'GOOD', 'FAIR', 'POOR'),
    is_graded BOOLEAN DEFAULT FALSE,
    grading_company VARCHAR(50), -- PSA, BGS, etc.
    grade_value DECIMAL(3,1), -- 9.5, 10, etc.
    quantity INTEGER DEFAULT 1,
    purchase_price DECIMAL(10,2),
    purchase_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (card_id) REFERENCES cards(id)
);

-- Price History
CREATE TABLE price_history (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    card_id BIGINT,
    condition_grade ENUM('MINT', 'NEAR_MINT', 'EXCELLENT', 'VERY_GOOD', 'GOOD', 'FAIR', 'POOR'),
    is_graded BOOLEAN,
    grade_value DECIMAL(3,1),
    price DECIMAL(10,2),
    source VARCHAR(100), -- 'EBAY_SOLD', 'TCGPLAYER', 'COMC', etc.
    recorded_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (card_id) REFERENCES cards(id),
    INDEX idx_card_date (card_id, recorded_date),
    INDEX idx_condition (card_id, condition_grade, is_graded)
);
```

### Advanced SQL Queries to Practice

```sql
-- Portfolio value over time
WITH monthly_values AS (
    SELECT 
        DATE_FORMAT(ph.recorded_date, '%Y-%m') as month,
        cc.id as collection_id,
        c.name as card_name,
        cc.quantity,
        ph.price * cc.quantity as total_value,
        ROW_NUMBER() OVER (
            PARTITION BY cc.id, DATE_FORMAT(ph.recorded_date, '%Y-%m') 
            ORDER BY ph.recorded_date DESC
        ) as rn
    FROM collection_cards cc
    JOIN cards c ON cc.card_id = c.id
    JOIN price_history ph ON c.id = ph.card_id 
        AND ph.condition_grade = cc.condition_grade
        AND ph.is_graded = cc.is_graded
    WHERE ph.recorded_date >= DATE_SUB(CURRENT_DATE, INTERVAL 12 MONTH)
)
SELECT month, SUM(total_value) as portfolio_value
FROM monthly_values 
WHERE rn = 1 
GROUP BY month 
ORDER BY month;

-- Top gaining/losing cards
SELECT 
    c.name,
    cs.name as set_name,
    current_price.price as current_price,
    old_price.price as price_30_days_ago,
    ((current_price.price - old_price.price) / old_price.price) * 100 as percent_change,
    (current_price.price - old_price.price) * cc.quantity as total_gain_loss
FROM collection_cards cc
JOIN cards c ON cc.card_id = c.id
JOIN card_sets cs ON c.set_id = cs.id
JOIN price_history current_price ON c.id = current_price.card_id
JOIN price_history old_price ON c.id = old_price.card_id
WHERE current_price.recorded_date = CURRENT_DATE
    AND old_price.recorded_date = DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
    AND current_price.condition_grade = cc.condition_grade
    AND old_price.condition_grade = cc.condition_grade
ORDER BY percent_change DESC;
```

## Spring Boot Backend Implementation

### 1. Maven Dependencies (pom.xml)
```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt</artifactId>
        <version>0.9.1</version>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

### 2. Application Configuration (application.yml)
```yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/cardcollector
    username: ${DB_USERNAME:cardcollector}
    password: ${DB_PASSWORD:password}
    driver-class-name: org.postgresql.Driver
  
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    database-platform: org.hibernate.dialect.PostgreSQLDialect
  
  security:
    jwt:
      secret: ${JWT_SECRET:mySecretKey}
      expiration: 86400000 # 24 hours

logging:
  level:
    com.cardcollector: DEBUG
```

### 3. JPA Entities
```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true)
    @NotBlank
    private String username;
    
    @Column(unique = true)
    @Email
    private String email;
    
    @NotBlank
    private String password;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<CollectionCard> collection = new ArrayList<>();
    
    // Constructors, getters, setters
}

@Entity
@Table(name = "cards")
public class Card {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "set_id")
    private CardSet cardSet;
    
    @NotBlank
    private String cardNumber;
    
    @NotBlank
    private String name;
    
    private String rarity;
    
    // Sports specific fields
    private String playerName;
    private String team;
    private String position;
    private Integer rookieYear;
    
    // TCG specific fields  
    private String manaCost;
    private Integer attackPower;
    private Integer defensePower;
    
    @Column(columnDefinition = "TEXT")
    private String abilities;
    
    @Column(columnDefinition = "TEXT") 
    private String description;
    
    private String imageUrl;
    private String apiCardId;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @OneToMany(mappedBy = "card", cascade = CascadeType.ALL)
    private List<PriceHistory> priceHistory = new ArrayList<>();
    
    // Constructors, getters, setters, equals, hashCode
}
```

### 4. Repository Layer
```java
@Repository
public interface CardRepository extends JpaRepository<Card, Long> {
    List<Card> findByCardSetAndNameContainingIgnoreCase(CardSet cardSet, String name);
    
    @Query("SELECT c FROM Card c WHERE c.playerName ILIKE %:playerName% OR c.name ILIKE %:name%")
    List<Card> findByPlayerNameOrCardName(@Param("playerName") String playerName, @Param("name") String name);
    
    @Query("SELECT c FROM Card c JOIN c.priceHistory ph WHERE ph.recordedDate = :date")
    List<Card> findCardsWithPriceOnDate(@Param("date") LocalDate date);
    
    List<Card> findByCardSet_GameTypeAndRarityIn(GameType gameType, List<String> rarities);
}

@Repository
public interface CollectionCardRepository extends JpaRepository<CollectionCard, Long> {
    List<CollectionCard> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    @Query("SELECT cc FROM CollectionCard cc JOIN FETCH cc.card WHERE cc.user.id = :userId")
    List<CollectionCard> findByUserIdWithCards(@Param("userId") Long userId);
    
    @Query("SELECT SUM(ph.price * cc.quantity) FROM CollectionCard cc " +
           "JOIN PriceHistory ph ON cc.card.id = ph.card.id " +
           "WHERE cc.user.id = :userId AND ph.recordedDate = CURRENT_DATE")
    BigDecimal calculatePortfolioValue(@Param("userId") Long userId);
}
```

### 5. Service Layer
```java
@Service
@Transactional
public class CardService {
    
    private final CardRepository cardRepository;
    private final PriceHistoryRepository priceHistoryRepository;
    
    public CardService(CardRepository cardRepository, PriceHistoryRepository priceHistoryRepository) {
        this.cardRepository = cardRepository;
        this.priceHistoryRepository = priceHistoryRepository;
    }
    
    public List<CardDTO> searchCards(String query, GameType gameType) {
        List<Card> cards;
        if (gameType != null) {
            cards = cardRepository.findByCardSet_GameTypeAndNameContainingIgnoreCase(gameType, query);
        } else {
            cards = cardRepository.findByPlayerNameOrCardName(query, query);
        }
        return cards.stream().map(this::convertToDTO).collect(Collectors.toList());
    }
    
    public CardDetailDTO getCardWithPriceHistory(Long cardId) {
        Card card = cardRepository.findById(cardId)
            .orElseThrow(() -> new CardNotFoundException("Card not found with id: " + cardId));
            
        List<PriceHistory> priceHistory = priceHistoryRepository
            .findByCardIdOrderByRecordedDateDesc(cardId);
            
        return convertToDetailDTO(card, priceHistory);
    }
    
    public CardDTO createCard(CreateCardRequest request) {
        Card card = new Card();
        card.setName(request.getName());
        card.setCardNumber(request.getCardNumber());
        card.setRarity(request.getRarity());
        // ... set other fields
        
        Card savedCard = cardRepository.save(card);
        return convertToDTO(savedCard);
    }
    
    private CardDTO convertToDTO(Card card) {
        // Convert entity to DTO
        return CardDTO.builder()
            .id(card.getId())
            .name(card.getName())
            .cardNumber(card.getCardNumber())
            .rarity(card.getRarity())
            .playerName(card.getPlayerName())
            .team(card.getTeam())
            .imageUrl(card.getImageUrl())
            .build();
    }
}
```

### 6. REST Controllers
```java
@RestController
@RequestMapping("/api/cards")
@CrossOrigin(origins = "http://localhost:4200")
public class CardController {
    
    private final CardService cardService;
    
    public CardController(CardService cardService) {
        this.cardService = cardService;
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<CardDTO>> searchCards(
            @RequestParam String query,
            @RequestParam(required = false) GameType gameType) {
        List<CardDTO> cards = cardService.searchCards(query, gameType);
        return ResponseEntity.ok(cards);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<CardDetailDTO> getCard(@PathVariable Long id) {
        CardDetailDTO card = cardService.getCardWithPriceHistory(id);
        return ResponseEntity.ok(card);
    }
    
    @PostMapping
    public ResponseEntity<CardDTO> createCard(@Valid @RequestBody CreateCardRequest request) {
        CardDTO createdCard = cardService.createCard(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdCard);
    }
    
    @GetMapping("/{id}/price-history")
    public ResponseEntity<List<PriceHistoryDTO>> getPriceHistory(
            @PathVariable Long id,
            @RequestParam(defaultValue = "30") int days) {
        List<PriceHistoryDTO> priceHistory = cardService.getPriceHistory(id, days);
        return ResponseEntity.ok(priceHistory);
    }
}

@RestController
@RequestMapping("/api/collection")
public class CollectionController {
    
    private final CollectionService collectionService;
    
    @GetMapping
    public ResponseEntity<List<CollectionCardDTO>> getCollection(Authentication auth) {
        String username = auth.getName();
        List<CollectionCardDTO> collection = collectionService.getUserCollection(username);
        return ResponseEntity.ok(collection);
    }
    
    @PostMapping("/cards")
    public ResponseEntity<CollectionCardDTO> addToCollection(
            @Valid @RequestBody AddToCollectionRequest request,
            Authentication auth) {
        String username = auth.getName();
        CollectionCardDTO addedCard = collectionService.addToCollection(request, username);
        return ResponseEntity.status(HttpStatus.CREATED).body(addedCard);
    }
    
    @GetMapping("/analytics")
    public ResponseEntity<PortfolioAnalyticsDTO> getPortfolioAnalytics(Authentication auth) {
        String username = auth.getName();
        PortfolioAnalyticsDTO analytics = collectionService.getPortfolioAnalytics(username);
        return ResponseEntity.ok(analytics);
    }
}

## Angular Frontend Implementation

### 1. Project Setup & Dependencies
```bash
ng new card-collector-frontend --routing --style=scss
cd card-collector-frontend
ng add @angular/material
npm install chart.js ng2-charts
npm install @auth0/angular-jwt
```

### 2. Core Services
```typescript
// card.service.ts
@Injectable({
  providedIn: 'root'
})
export class CardService {
  private apiUrl = 'http://localhost:8080/api/cards';
  
  constructor(private http: HttpClient) {}
  
  searchCards(query: string, gameType?: string): Observable<Card[]> {
    let params = new HttpParams().set('query', query);
    if (gameType) {
      params = params.set('gameType', gameType);
    }
    return this.http.get<Card[]>(`${this.apiUrl}/search`, { params });
  }
  
  getCard(id: number): Observable<CardDetail> {
    return this.http.get<CardDetail>(`${this.apiUrl}/${id}`);
  }
  
  getPriceHistory(cardId: number, days: number = 30): Observable<PriceHistory[]> {
    return this.http.get<PriceHistory[]>(`${this.apiUrl}/${cardId}/price-history`, {
      params: { days: days.toString() }
    });
  }
}

// auth.service.ts
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private tokenKey = 'auth-token';
  
  constructor(private http: HttpClient) {}
  
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          if (response.token) {
            localStorage.setItem(this.tokenKey, response.token);
          }
        })
      );
  }
  
  logout(): void {
    localStorage.removeItem(this.tokenKey);
  }
  
  isAuthenticated(): boolean {
    const token = localStorage.getItem(this.tokenKey);
    return token != null && !this.isTokenExpired(token);
  }
  
  private isTokenExpired(token: string): boolean {
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= decoded.exp * 1000;
    } catch {
      return true;
    }
  }
}

// collection.service.ts
@Injectable({
  providedIn: 'root'
})
export class CollectionService {
  private apiUrl = 'http://localhost:8080/api/collection';
  
  constructor(private http: HttpClient) {}
  
  getCollection(): Observable<CollectionCard[]> {
    return this.http.get<CollectionCard[]>(this.apiUrl);
  }
  
  addToCollection(request: AddToCollectionRequest): Observable<CollectionCard> {
    return this.http.post<CollectionCard>(`${this.apiUrl}/cards`, request);
  }
  
  getAnalytics(): Observable<PortfolioAnalytics> {
    return this.http.get<PortfolioAnalytics>(`${this.apiUrl}/analytics`);
  }
}
```

### 3. Key Components
```typescript
// card-search.component.ts
@Component({
  selector: 'app-card-search',
  templateUrl: './card-search.component.html'
})
export class CardSearchComponent implements OnInit {
  searchForm: FormGroup;
  cards$ = new BehaviorSubject<Card[]>([]);
  loading = false;
  
  gameTypes = ['SPORTS', 'POKEMON', 'MTG', 'YUGIOH'];
  
  constructor(
    private fb: FormBuilder,
    private cardService: CardService
  ) {
    this.searchForm = this.fb.group({
      query: ['', [Validators.required, Validators.minLength(2)]],
      gameType: ['']
    });
  }
  
  ngOnInit(): void {
    this.searchForm.get('query')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(query => {
          if (query.length >= 2) {
            this.loading = true;
            const gameType = this.searchForm.get('gameType')?.value;
            return this.cardService.searchCards(query, gameType);
          }
          return of([]);
        })
      )
      .subscribe(cards => {
        this.cards$.next(cards);
        this.loading = false;
      });
  }
  
  onSearch(): void {
    if (this.searchForm.valid) {
      const { query, gameType } = this.searchForm.value;
      this.loading = true;
      
      this.cardService.searchCards(query, gameType)
        .subscribe(cards => {
          this.cards$.next(cards);
          this.loading = false;
        });
    }
  }
}

// collection-dashboard.component.ts
@Component({
  selector: 'app-collection-dashboard',
  templateUrl: './collection-dashboard.component.html'
})
export class CollectionDashboardComponent implements OnInit {
  collection: CollectionCard[] = [];
  analytics: PortfolioAnalytics | null = null;
  
  // Chart configuration
  portfolioChartData: ChartData<'line'> = {
    labels: [],
    datasets: [{
      label: 'Portfolio Value',
      data: [],
      borderColor: '#1976d2',
      backgroundColor: 'rgba(25, 118, 210, 0.1)'
    }]
  };
  
  constructor(
    private collectionService: CollectionService
  ) {}
  
  ngOnInit(): void {
    this.loadCollection();
    this.loadAnalytics();
  }
  
  loadCollection(): void {
    this.collectionService.getCollection()
      .subscribe(collection => {
        this.collection = collection;
      });
  }
  
  loadAnalytics(): void {
    this.collectionService.getAnalytics()
      .subscribe(analytics => {
        this.analytics = analytics;
        this.updateChartData(analytics.portfolioHistory);
      });
  }
  
  private updateChartData(portfolioHistory: PortfolioValue[]): void {
    this.portfolioChartData.labels = portfolioHistory.map(p => p.date);
    this.portfolioChartData.datasets[0].data = portfolioHistory.map(p => p.value);
  }
}

// card-detail.component.ts
@Component({
  selector: 'app-card-detail',
  templateUrl: './card-detail.component.html'
})
export class CardDetailComponent implements OnInit {
  card: CardDetail | null = null;
  priceHistory: PriceHistory[] = [];
  
  priceChartData: ChartData<'line'> = {
    labels: [],
    datasets: [{
      label: 'Price History',
      data: [],
      borderColor: '#4caf50',
      backgroundColor: 'rgba(76, 175, 80, 0.1)'
    }]
  };
  
  constructor(
    private route: ActivatedRoute,
    private cardService: CardService
  ) {}
  
  ngOnInit(): void {
    const cardId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadCard(cardId);
    this.loadPriceHistory(cardId);
  }
  
  loadCard(cardId: number): void {
    this.cardService.getCard(cardId)
      .subscribe(card => {
        this.card = card;
      });
  }
  
  loadPriceHistory(cardId: number): void {
    this.cardService.getPriceHistory(cardId)
      .subscribe(history => {
        this.priceHistory = history;
        this.updatePriceChart(history);
      });
  }
  
  private updatePriceChart(history: PriceHistory[]): void {
    this.priceChartData.labels = history.map(h => h.recordedDate);
    this.priceChartData.datasets[0].data = history.map(h => h.price);
  }
}

### 4. Routing & Guards
```typescript
// app-routing.module.ts
const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'collection', component: CollectionDashboardComponent, canActivate: [AuthGuard] },
  { path: 'cards/search', component: CardSearchComponent, canActivate: [AuthGuard] },
  { path: 'cards/:id', component: CardDetailComponent, canActivate: [AuthGuard] },
  { path: 'analytics', component: AnalyticsComponent, canActivate: [AuthGuard] },
];

// auth.guard.ts
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
```

### 5. HTTP Interceptor
```typescript
// auth.interceptor.ts
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('auth-token');
    
    if (token) {
      const authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      return next.handle(authReq);
    }
    
    return next.handle(req);
  }
}
```

## Learning Focus Areas for Java Full Stack Developer Role

### Java & Spring Boot Skills
- **Core Java**: Streams, Lambdas, Optional, Records (Java 14+)
- **Spring Boot**: Auto-configuration, Starters, Profiles
- **Spring Data JPA**: Custom queries, Specifications, Pagination
- **Spring Security**: JWT authentication, Method-level security
- **REST API Design**: Best practices, HTTP status codes, HATEOAS
- **Exception Handling**: Global exception handlers, custom exceptions
- **Testing**: JUnit 5, Mockito, TestContainers for integration tests
- **Build Tools**: Maven/Gradle dependency management

### Angular & Frontend Skills
- **Angular Architecture**: Modules, Components, Services, Dependency Injection
- **TypeScript**: Advanced types, Decorators, Generics
- **Reactive Programming**: RxJS operators, Observables, Subjects
- **Forms**: Reactive Forms, Validation, Custom Validators
- **HTTP Client**: Interceptors, Error handling, Caching
- **State Management**: Services with BehaviorSubject or NgRx for complex state
- **Angular Material**: UI components, Theming, Responsive design
- **Testing**: Jasmine, Karma, Component testing

### Database & SQL Mastery
- **Advanced Queries**: Window functions, CTEs, Subqueries
- **Performance**: Query optimization, Indexing strategies, Execution plans
- **Relationships**: Complex joins, Foreign keys, Cascading operations
- **Data Analysis**: Aggregations, Grouping, Statistical functions
- **Transactions**: ACID properties, Isolation levels
- **Database Design**: Normalization, Denormalization strategies

## Implementation Phases for Interview Preparation

### Phase 1: Core Foundation (Week 1-2)
1. **Backend Setup**
   - Spring Boot project structure
   - Basic JPA entities and repositories
   - Simple REST endpoints
   - Database connection and schema

2. **Frontend Setup**
   - Angular project with routing
   - Basic components and services
   - HTTP client setup
   - Authentication guard

### Phase 2: Core Features (Week 3-4)
1. **Authentication System**
   - JWT token generation and validation
   - Login/logout functionality
   - Protected routes

2. **Card Management**
   - Search functionality with filters
   - CRUD operations for cards
   - File upload for card images

### Phase 3: Advanced Features (Week 5-6)
1. **Collection Management**
   - Add cards to personal collection
   - Track conditions and quantities
   - Portfolio value calculations

2. **Data Visualization**
   - Price history charts
   - Collection analytics dashboard
   - Responsive design implementation

### Phase 4: Production Ready (Week 7-8)
1. **Testing & Quality**
   - Unit tests for services and components
   - Integration tests for REST APIs
   - Error handling and validation

2. **Deployment & DevOps**
   - Docker containerization
   - Environment configuration
   - CI/CD pipeline setup

## Interview Talking Points

### Technical Decisions
- **Why Spring Boot?** Rapid development, auto-configuration, embedded server
- **Why Angular over React?** Enterprise-ready, TypeScript by default, comprehensive framework
- **JWT vs Session?** Stateless, scalable, mobile-friendly
- **PostgreSQL choice?** ACID compliance, advanced SQL features, JSON support

### Architecture Patterns
- **Repository Pattern**: Data access abstraction
- **Service Layer**: Business logic separation  
- **DTO Pattern**: API contract definition
- **Observer Pattern**: Angular services with RxJS

### Performance Considerations
- **Database**: Proper indexing, query optimization, connection pooling
- **Frontend**: Lazy loading, OnPush change detection, HTTP caching
- **Backend**: Caching strategies, async processing, pagination

## Sample Code Examples for Key Concepts

### Advanced Spring Boot Features

#### 1. Custom Repository with Specifications
```java
// CardSpecifications.java
public class CardSpecifications {
    public static Specification<Card> hasPlayerName(String playerName) {
        return (root, query, criteriaBuilder) -> 
            playerName == null ? null : 
            criteriaBuilder.like(criteriaBuilder.lower(root.get("playerName")), 
                "%" + playerName.toLowerCase() + "%");
    }
    
    public static Specification<Card> belongsToGameType(GameType gameType) {
        return (root, query, criteriaBuilder) -> 
            gameType == null ? null : 
            criteriaBuilder.equal(root.get("cardSet").get("gameType"), gameType);
    }
    
    public static Specification<Card> hasRarityIn(List<String> rarities) {
        return (root, query, criteriaBuilder) -> 
            rarities == null || rarities.isEmpty() ? null : 
            root.get("rarity").in(rarities);
    }
}

// Enhanced CardRepository
@Repository
public interface CardRepository extends JpaRepository<Card, Long>, JpaSpecificationExecutor<Card> {
    // Complex query with multiple joins and conditions
    @Query("SELECT DISTINCT c FROM Card c " +
           "LEFT JOIN FETCH c.priceHistory ph " +
           "WHERE c.cardSet.gameType = :gameType " +
           "AND (c.name ILIKE %:searchTerm% OR c.playerName ILIKE %:searchTerm%) " +
           "AND ph.recordedDate = (SELECT MAX(ph2.recordedDate) FROM PriceHistory ph2 WHERE ph2.card.id = c.id)")
    List<Card> findCardsWithLatestPrices(@Param("gameType") GameType gameType, 
                                        @Param("searchTerm") String searchTerm);
    
    // Native query for complex analytics
    @Query(value = "WITH price_changes AS (" +
                   "    SELECT card_id, " +
                   "           LAG(price) OVER (PARTITION BY card_id ORDER BY recorded_date) as prev_price, " +
                   "           price as current_price, " +
                   "           recorded_date " +
                   "    FROM price_history " +
                   "    WHERE recorded_date >= CURRENT_DATE - INTERVAL '30 days' " +
                   ") " +
                   "SELECT c.name, c.player_name, " +
                   "       ((pc.current_price - pc.prev_price) / pc.prev_price) * 100 as percent_change " +
                   "FROM cards c " +
                   "JOIN price_changes pc ON c.id = pc.card_id " +
                   "WHERE pc.prev_price IS NOT NULL " +
                   "ORDER BY percent_change DESC " +
                   "LIMIT 10", nativeQuery = true)
    List<Object[]> findTopGainers();
}
```

#### 2. Advanced Service Layer with Caching
```java
@Service
@Transactional
@Slf4j
public class CardServiceImpl implements CardService {
    
    private final CardRepository cardRepository;
    private final RedisTemplate<String, Object> redisTemplate;
    
    @Cacheable(value = "cards", key = "#query + '_' + #gameType")
    public List<CardDTO> searchCards(String query, GameType gameType) {
        log.info("Searching cards with query: {} and gameType: {}", query, gameType);
        
        Specification<Card> spec = Specification.where(CardSpecifications.hasPlayerName(query))
                .or(CardSpecifications.cardNameContains(query))
                .and(CardSpecifications.belongsToGameType(gameType));
        
        return cardRepository.findAll(spec)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Async
    public CompletableFuture<Void> updatePricesFromExternalApi() {
        log.info("Starting price update job");
        
        List<Card> cards = cardRepository.findAll();
        List<CompletableFuture<Void>> futures = cards.stream()
                .map(this::updateCardPrice)
                .collect(Collectors.toList());
        
        return CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]));
    }
    
    private CompletableFuture<Void> updateCardPrice(Card card) {
        return CompletableFuture.runAsync(() -> {
            try {
                // Call external API for price
                BigDecimal newPrice = externalPriceService.getLatestPrice(card.getApiCardId());
                if (newPrice != null) {
                    savePriceHistory(card, newPrice);
                    evictCardCache(card.getId());
                }
            } catch (Exception e) {
                log.error("Failed to update price for card: {}", card.getId(), e);
            }
        });
    }
    
    @CacheEvict(value = "cards", allEntries = true)
    public void evictCardCache(Long cardId) {
        log.debug("Evicted cache for card: {}", cardId);
    }
}
```

#### 3. Security Configuration
```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {
    
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final JwtTokenFilter jwtTokenFilter;
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors().and().csrf().disable()
            .exceptionHandling().authenticationEntryPoint(jwtAuthenticationEntryPoint)
            .and()
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/cards/search").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/cards/**").hasRole("USER")
                .requestMatchers(HttpMethod.POST, "/api/cards/**").hasRole("ADMIN")
                .requestMatchers("/api/collection/**").hasRole("USER")
                .anyRequest().authenticated()
            );
        
        http.addFilterBefore(jwtTokenFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}

@Component
public class JwtTokenFilter extends OncePerRequestFilter {
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                  HttpServletResponse response, 
                                  FilterChain filterChain) throws ServletException, IOException {
        
        String token = extractTokenFromRequest(request);
        if (token != null && jwtTokenProvider.validateToken(token)) {
            String username = jwtTokenProvider.getUsernameFromToken(token);
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            
            UsernamePasswordAuthenticationToken auth = 
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(auth);
        }
        
        filterChain.doFilter(request, response);
    }
}
```

### Advanced Angular Features

#### 1. State Management with Services
```typescript
// collection-state.service.ts
@Injectable({
  providedIn: 'root'
})
export class CollectionStateService {
  private collectionSubject = new BehaviorSubject<CollectionCard[]>([]);
  private analyticsSubject = new BehaviorSubject<PortfolioAnalytics | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  
  public readonly collection$ = this.collectionSubject.asObservable();
  public readonly analytics$ = this.analyticsSubject.asObservable();
  public readonly loading$ = this.loadingSubject.asObservable();
  
  constructor(private collectionService: CollectionService) {}
  
  loadCollection(): void {
    this.loadingSubject.next(true);
    this.collectionService.getCollection()
      .pipe(
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe({
        next: (collection) => this.collectionSubject.next(collection),
        error: (error) => console.error('Failed to load collection', error)
      });
  }
  
  addToCollection(request: AddToCollectionRequest): Observable<CollectionCard> {
    return this.collectionService.addToCollection(request)
      .pipe(
        tap(newCard => {
          const currentCollection = this.collectionSubject.value;
          this.collectionSubject.next([...currentCollection, newCard]);
        })
      );
  }
  
  updateCard(cardId: number, updates: Partial<CollectionCard>): void {
    const currentCollection = this.collectionSubject.value;
    const updatedCollection = currentCollection.map(card => 
      card.id === cardId ? { ...card, ...updates } : card
    );
    this.collectionSubject.next(updatedCollection);
  }
  
  getCardsByGameType(gameType: string): Observable<CollectionCard[]> {
    return this.collection$.pipe(
      map(collection => collection.filter(card => card.card.cardSet.gameType === gameType))
    );
  }
}
```

#### 2. Advanced Component with Reactive Forms
```typescript
// add-to-collection.component.ts
@Component({
  selector: 'app-add-to-collection',
  templateUrl: './add-to-collection.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddToCollectionComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  addForm: FormGroup;
  selectedCard: Card | null = null;
  conditions = ['MINT', 'NEAR_MINT', 'EXCELLENT', 'VERY_GOOD', 'GOOD', 'FAIR', 'POOR'];
  gradingCompanies = ['PSA', 'BGS', 'SGC', 'CGC'];
  
  constructor(
    private fb: FormBuilder,
    private collectionState: CollectionStateService,
    private cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: { card: Card }
  ) {
    this.selectedCard = data.card;
    this.initForm();
  }
  
  ngOnInit(): void {
    this.setupFormSubscriptions();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  private initForm(): void {
    this.addForm = this.fb.group({
      cardId: [this.selectedCard?.id, Validators.required],
      condition: ['MINT', Validators.required],
      isGraded: [false],
      gradingCompany: [''],
      gradeValue: [''],
      quantity: [1, [Validators.required, Validators.min(1)]],
      purchasePrice: ['', [Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      purchaseDate: [''],
      notes: ['']
    });
  }
  
  private setupFormSubscriptions(): void {
    // Conditional validation based on isGraded
    this.addForm.get('isGraded')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(isGraded => {
        const gradingCompanyControl = this.addForm.get('gradingCompany');
        const gradeValueControl = this.addForm.get('gradeValue');
        
        if (isGraded) {
          gradingCompanyControl?.setValidators([Validators.required]);
          gradeValueControl?.setValidators([
            Validators.required,
            Validators.min(1),
            Validators.max(10)
          ]);
        } else {
          gradingCompanyControl?.clearValidators();
          gradeValueControl?.clearValidators();
          gradingCompanyControl?.setValue('');
          gradeValueControl?.setValue('');
        }
        
        gradingCompanyControl?.updateValueAndValidity();
        gradeValueControl?.updateValueAndValidity();
      });
  }
  
  onSubmit(): void {
    if (this.addForm.valid) {
      const request: AddToCollectionRequest = this.addForm.value;
      
      this.collectionState.addToCollection(request)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (addedCard) => {
            console.log('Card added to collection:', addedCard);
            // Close dialog or navigate
          },
          error: (error) => {
            console.error('Failed to add card:', error);
            // Show error message
          }
        });
    } else {
      this.markFormGroupTouched(this.addForm);
    }
  }
  
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
```

#### 3. Custom Validators and Pipes
```typescript
// custom-validators.ts
export class CustomValidators {
  static cardNumber(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
    
    // Card numbers should be alphanumeric and may contain hyphens
    const cardNumberPattern = /^[A-Za-z0-9\-]+$/;
    return cardNumberPattern.test(value) ? null : { invalidCardNumber: true };
  }
  
  static gradeValue(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return { invalidGrade: true };
    
    // PSA grades are 1-10, BGS allows half grades
    if (numValue < 1 || numValue > 10) return { gradeOutOfRange: true };
    
    // Check if half grades are valid (only .5 allowed)
    if (numValue % 0.5 !== 0) return { invalidGradeIncrement: true };
    
    return null;
  }
}

// currency.pipe.ts
@Pipe({ name: 'currency' })
export class CurrencyPipe implements PipeTransform {
  transform(value: number | string, currencyCode: string = 'USD', display: 'symbol' | 'code' = 'symbol'): string {
    if (value == null || value === '') return '';
    
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return '';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      currencyDisplay: display
    }).format(numValue);
  }
}

// price-change.pipe.ts
@Pipe({ name: 'priceChange' })
export class PriceChangePipe implements PipeTransform {
  transform(currentPrice: number, previousPrice: number): { value: string; class: string } {
    if (!currentPrice || !previousPrice) {
      return { value: 'N/A', class: 'neutral' };
    }
    
    const change = currentPrice - previousPrice;
    const percentChange = (change / previousPrice) * 100;
    
    const value = `${change >= 0 ? '+' : ''}${change.toFixed(2)} (${percentChange.toFixed(1)}%)`;
    const cssClass = change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral';
    
    return { value, class: cssClass };
  }
}
```

## Production-Ready Features

### Error Handling & Logging
```java
// Global Exception Handler
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    
    @ExceptionHandler(CardNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleCardNotFound(CardNotFoundException ex) {
        log.warn("Card not found: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(new ErrorResponse("CARD_NOT_FOUND", ex.getMessage()));
    }
    
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ErrorResponse> handleValidation(ValidationException ex) {
        log.warn("Validation error: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(new ErrorResponse("VALIDATION_ERROR", ex.getMessage()));
    }
    
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrity(DataIntegrityViolationException ex) {
        log.error("Data integrity violation", ex);
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(new ErrorResponse("DATA_INTEGRITY_ERROR", "Duplicate or invalid data"));
    }
}
```

### Testing Examples
```java
// Service Test
@ExtendWith(MockitoExtension.class)
class CardServiceTest {
    
    @Mock
    private CardRepository cardRepository;
    
    @Mock
    private PriceHistoryRepository priceHistoryRepository;
    
    @InjectMocks
    private CardServiceImpl cardService;
    
    @Test
    void searchCards_WithValidQuery_ReturnsCards() {
        // Given
        String query = "Michael Jordan";
        GameType gameType = GameType.SPORTS;
        List<Card> mockCards = Arrays.asList(createMockCard());
        
        when(cardRepository.findAll(any(Specification.class))).thenReturn(mockCards);
        
        // When
        List<CardDTO> result = cardService.searchCards(query, gameType);
        
        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getPlayerName()).isEqualTo("Michael Jordan");
        verify(cardRepository).findAll(any(Specification.class));
    }
}

// Integration Test
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(properties = "spring.datasource.url=jdbc:h2:mem:testdb")
class CardControllerIntegrationTest {
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    @Autowired
    private CardRepository cardRepository;
    
    @Test
    void searchCards_ReturnsExpectedResults() {
        // Given
        Card card = new Card();
        card.setName("Charizard");
        card.setPlayerName("Pokemon");
        cardRepository.save(card);
        
        // When
        ResponseEntity<Card[]> response = restTemplate.getForEntity(
            "/api/cards/search?query=Charizard", Card[].class);
        
        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(1);
        assertThat(response.getBody()[0].getName()).isEqualTo("Charizard");
    }
}
```

This comprehensive project structure provides you with real-world experience in all the technologies that Java Full Stack Developer positions require, with production-ready patterns and best practices!
- **Scheduled Tasks**: For periodic price updates from APIs
- **Caching**: Redis integration for frequently accessed card data
- **API Integration**: RestTemplate/WebClient for external price APIs
- **Exception Handling**: Global exception handlers
- **Validation**: Bean validation for card data

### Angular
- **Reactive Forms**: For adding cards to collection
- **HTTP Interceptors**: For API authentication
- **State Management**: NgRx for complex collection state
- **Charts**: Integration with Chart.js for price visualization
- **Routing**: Lazy loading for different sections
- **Observables**: RxJS for real-time price updates

### Advanced SQL
- **Window Functions**: Price change analysis, ranking
- **CTEs**: Complex portfolio calculations
- **Triggers**: Automatic price history updates
- **Stored Procedures**: Complex analytics calculations
- **Indexing**: Optimize price history queries
- **Partitioning**: For large price history tables

## Implementation Phases

### Phase 1: Foundation
1. Set up Spring Boot project with JPA entities
2. Create basic CRUD operations for cards and collections
3. Set up Angular project with basic components
4. Implement card search and basic collection management

### Phase 2: Price Integration
1. Integrate with external APIs (TCGPlayer, eBay)
2. Implement price history tracking
3. Create price charts in Angular
4. Add scheduled tasks for price updates

### Phase 3: Analytics
1. Advanced SQL queries for portfolio analysis
2. Dashboard with collection insights
3. Price alerts and notifications
4. Export functionality for collection data

### Phase 4: Advanced Features
1. Image recognition for card identification
2. Barcode scanning for quick card addition
3. Trading functionality between users
4. Mobile responsiveness and PWA features

## External APIs to Consider
- **TCGPlayer API**: For TCG card prices
- **eBay API**: For sold listings and market data
- **Sports card APIs**: COMC, Beckett, etc.
- **Card recognition APIs**: For image-based card identification

This project will give you hands-on experience with all four technologies while building something genuinely useful for your card collecting hobby!