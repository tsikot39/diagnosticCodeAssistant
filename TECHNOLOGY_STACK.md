# Technology Stack Documentation

**Diagnostic Code Assistant** - Complete Technology Reference

---

## 📑 Table of Contents

1. [Frontend Technologies](#frontend-technologies)
2. [Backend Technologies](#backend-technologies)
3. [Database & Data Management](#database--data-management)
4. [Development Tools](#development-tools)
5. [Testing Frameworks](#testing-frameworks)
6. [Deployment & Infrastructure](#deployment--infrastructure)
7. [Third-Party Services](#third-party-services)
8. [Build & Development Tools](#build--development-tools)

---

## Frontend Technologies

### Core Framework & Language

#### **React 18.2.0**
- **Purpose**: UI framework for building component-based interfaces
- **Why chosen**: 
  - Industry standard with massive ecosystem
  - Excellent performance with virtual DOM
  - Strong TypeScript support
  - Rich component library ecosystem
- **Usage in app**:
  - All UI components (CodeCard, Layout, Forms, etc.)
  - State management with hooks
  - Route-based code splitting
- **Documentation**: https://react.dev

#### **TypeScript 5.3+**
- **Purpose**: Typed superset of JavaScript
- **Why chosen**:
  - Type safety reduces runtime errors
  - Better IDE support and autocomplete
  - Self-documenting code
  - Easier refactoring
- **Usage in app**:
  - All frontend code written in TypeScript
  - Strict mode enabled
  - Custom type definitions for API responses
  - Type-safe props and hooks
- **Documentation**: https://www.typescriptlang.org

### Build Tool

#### **Vite 5.4.21**
- **Purpose**: Next-generation frontend build tool
- **Why chosen**:
  - Lightning-fast hot module replacement (HMR)
  - Optimized production builds
  - Native ES modules support
  - Excellent developer experience
- **Usage in app**:
  - Development server with instant updates
  - Production bundling with code splitting
  - Asset optimization
  - Environment variable handling
- **Features used**:
  - React plugin for Fast Refresh
  - Path aliases (@/ for src/)
  - CSS preprocessing
  - Build optimization
- **Documentation**: https://vitejs.dev

### Styling & UI Components

#### **Tailwind CSS 3.4+**
- **Purpose**: Utility-first CSS framework
- **Why chosen**:
  - Rapid UI development
  - Consistent design system
  - Small production bundle size
  - Easy to customize
- **Usage in app**:
  - All component styling
  - Responsive design utilities
  - Dark/light theme support
  - Custom color palette
- **Configuration**:
  - Custom color scheme
  - Extended spacing and sizing
  - Custom animations
  - Dark mode class strategy
- **Documentation**: https://tailwindcss.com

#### **shadcn/ui**
- **Purpose**: Re-usable component library built on Radix UI
- **Why chosen**:
  - Fully customizable and owned by you
  - Accessible by default (ARIA compliant)
  - Beautiful design out of the box
  - Copy-paste, not npm install approach
- **Components used**:
  - Button, Card, Dialog, Dropdown Menu
  - Input, Label, Select, Tabs
  - Popover, Badge, Skeleton
  - Toast notifications
- **Underlying**: Radix UI primitives
- **Documentation**: https://ui.shadcn.com

#### **Radix UI**
- **Purpose**: Unstyled, accessible UI primitives
- **Why chosen**:
  - Built-in accessibility
  - Keyboard navigation support
  - Focus management
  - Screen reader compatibility
- **Components used**:
  - Dialog, Dropdown Menu, Label
  - Popover, Select, Tabs
- **Documentation**: https://www.radix-ui.com

### State Management & Data Fetching

#### **TanStack Query (React Query) 5.17.19**
- **Purpose**: Async state management and data fetching
- **Why chosen**:
  - Automatic caching and background updates
  - Optimistic updates
  - Request deduplication
  - Built-in loading and error states
- **Usage in app**:
  - All API calls (useDiagnosticCodes, useFavorites, etc.)
  - Automatic cache invalidation
  - Mutation handling for create/update/delete
  - Background refetching
- **Features used**:
  - Query hooks for GET requests
  - Mutation hooks for POST/PUT/DELETE
  - Automatic retry on failure
  - Cache persistence
- **Documentation**: https://tanstack.com/query

#### **Zustand** (via custom hooks)
- **Purpose**: Lightweight state management
- **Why chosen**:
  - Simple API
  - No boilerplate
  - TypeScript friendly
- **Usage in app**:
  - Theme state (dark/light mode)
  - Authentication state
  - Global UI state
- **Documentation**: https://zustand-demo.pmnd.rs

### Routing

#### **React Router DOM 6.21.3**
- **Purpose**: Client-side routing
- **Why chosen**:
  - Standard routing solution for React
  - Nested routes support
  - URL parameter handling
  - Programmatic navigation
- **Usage in app**:
  - Page navigation (Home, Dashboard, Detail)
  - Protected routes (authentication required)
  - URL-based filtering
  - Browser history management
- **Routes**:
  - `/` - Home page with code listing
  - `/dashboard` - Analytics dashboard
  - `/codes/:id` - Code detail page
  - `/login` - Authentication
- **Documentation**: https://reactrouter.com

### UI Enhancement Libraries

#### **Lucide React 0.309.0**
- **Purpose**: Beautiful, consistent icon library
- **Why chosen**:
  - 1000+ icons
  - Tree-shakeable (only import what you use)
  - Consistent design
  - TypeScript support
- **Usage in app**:
  - All icons (Edit, Trash, Search, Plus, etc.)
  - Navigation icons
  - Status indicators
  - Action buttons
- **Documentation**: https://lucide.dev

#### **Sonner 2.0.7**
- **Purpose**: Toast notification system
- **Why chosen**:
  - Beautiful animations
  - Promise-based toasts
  - Customizable
  - Accessible
- **Usage in app**:
  - Success messages (code created, deleted)
  - Error notifications
  - Loading states
  - User feedback
- **Documentation**: https://sonner.emilkowal.ski

#### **Recharts 3.6.0**
- **Purpose**: Composable charting library
- **Why chosen**:
  - Built on D3.js
  - Declarative syntax
  - Responsive
  - TypeScript support
- **Usage in app**:
  - Dashboard charts (category distribution, severity breakdown)
  - Statistical visualizations
  - Data analytics
- **Documentation**: https://recharts.org

#### **@tanstack/react-virtual 3.13.13**
- **Purpose**: Virtual scrolling for large lists
- **Why chosen**:
  - High performance with 74,000+ items
  - Smooth scrolling
  - Dynamic row heights
  - Minimal re-renders
- **Usage in app**:
  - Virtual code grid for large datasets
  - Only renders visible items + overscan
  - Auto-enables for datasets >50 records
- **Documentation**: https://tanstack.com/virtual

### Form Handling & Validation

#### **Zod 3.22.4**
- **Purpose**: TypeScript-first schema validation
- **Why chosen**:
  - Type inference
  - Composable schemas
  - Error messages
  - Zero dependencies
- **Usage in app**:
  - Form validation
  - API response validation
  - Type-safe data parsing
  - Error handling
- **Documentation**: https://zod.dev

### Utilities

#### **Axios 1.13.2**
- **Purpose**: Promise-based HTTP client
- **Why chosen**:
  - Interceptors for auth tokens
  - Request/response transformation
  - Automatic JSON handling
  - Better error handling than fetch
- **Usage in app**:
  - All API calls
  - JWT token injection
  - Error response handling
  - Request timeout management
- **Documentation**: https://axios-http.com

#### **class-variance-authority (cva) 0.7.1**
- **Purpose**: Component variant management
- **Why chosen**:
  - Type-safe variants
  - Conditional classes
  - Works perfectly with Tailwind
- **Usage in app**:
  - Button variants (primary, secondary, destructive)
  - Component states
  - Size variations
- **Documentation**: https://cva.style/docs

#### **clsx 2.1.1** & **tailwind-merge 2.6.0**
- **Purpose**: Conditional className utilities
- **Why chosen**:
  - Merge Tailwind classes properly
  - Conditional class application
  - Prevent class conflicts
- **Usage in app**:
  - Dynamic className construction
  - Component styling
  - Theme-based classes
- **Documentation**: 
  - clsx: https://github.com/lukeed/clsx
  - tailwind-merge: https://github.com/dcastil/tailwind-merge

#### **use-debounce 10.0.6**
- **Purpose**: Debounce hook for React
- **Why chosen**:
  - Reduce API calls on search
  - Performance optimization
  - Simple API
- **Usage in app**:
  - Search input debouncing (500ms)
  - Filter changes
  - Auto-save functionality
- **Documentation**: https://github.com/xnimorz/use-debounce

---

## Backend Technologies

### Core Framework & Language

#### **Python 3.11+**
- **Purpose**: Programming language for backend
- **Why chosen**:
  - Excellent web framework ecosystem
  - Strong typing with type hints
  - Great for data processing
  - Easy to read and maintain
- **Features used**:
  - Async/await for concurrent operations
  - Type hints for code clarity
  - Context managers
  - Decorators for middleware
- **Documentation**: https://docs.python.org

#### **FastAPI 0.109.0**
- **Purpose**: Modern, high-performance web framework
- **Why chosen**:
  - Automatic OpenAPI documentation
  - Built-in data validation with Pydantic
  - Async support (ASGI)
  - Type hints for editor support
  - High performance (on par with Node.js/Go)
- **Usage in app**:
  - All API endpoints
  - Request/response validation
  - Dependency injection
  - Background tasks
  - WebSocket support (ready for future features)
- **Features used**:
  - Path operations (GET, POST, PUT, DELETE)
  - Query parameters and path parameters
  - Request body validation
  - Response models
  - Middleware
  - CORS handling
  - OpenAPI/Swagger docs at /docs
- **Documentation**: https://fastapi.tiangolo.com

#### **Uvicorn 0.27.0**
- **Purpose**: Lightning-fast ASGI server
- **Why chosen**:
  - Production-ready
  - Auto-reload in development
  - WebSocket support
  - HTTP/2 ready
- **Usage in app**:
  - Running the FastAPI application
  - Development server with hot reload
  - Production deployment
- **Documentation**: https://www.uvicorn.org

### Data Validation & Settings

#### **Pydantic 2.5.3**
- **Purpose**: Data validation using Python type hints
- **Why chosen**:
  - Runtime type checking
  - Data serialization/deserialization
  - Settings management
  - Integration with FastAPI
- **Usage in app**:
  - Request/response schemas
  - Database model validation
  - Configuration validation
  - Error messages
- **Models**:
  - DiagnosticCodeCreate, DiagnosticCodeUpdate
  - UserCreate, UserResponse
  - TokenResponse
- **Documentation**: https://docs.pydantic.dev

#### **Pydantic Settings 2.1.0**
- **Purpose**: Settings management from environment variables
- **Why chosen**:
  - Type-safe configuration
  - Environment variable validation
  - .env file support
  - Default values
- **Usage in app**:
  - Database URL configuration
  - API keys (Gemini, Sentry)
  - CORS origins
  - Secret keys
- **Documentation**: https://docs.pydantic.dev/latest/concepts/pydantic_settings/

### Database & ORM

#### **SQLAlchemy 2.0.25**
- **Purpose**: SQL toolkit and ORM
- **Why chosen**:
  - Powerful query builder
  - Relationship management
  - Migration support
  - Async support
- **Usage in app**:
  - Database models (DiagnosticCode, User, Organization)
  - Complex queries with joins
  - Eager/lazy loading
  - Connection pooling
- **Features used**:
  - Declarative models
  - Relationships (ForeignKey, relationship())
  - Query filtering and ordering
  - Bulk operations
  - Transaction management
- **Documentation**: https://docs.sqlalchemy.org

#### **Alembic 1.13.1**
- **Purpose**: Database migration tool
- **Why chosen**:
  - Version control for database schema
  - Auto-generate migrations
  - Rollback support
  - Works seamlessly with SQLAlchemy
- **Usage in app**:
  - Schema migrations
  - Adding new columns
  - Creating indexes
  - Database versioning
- **Migrations**:
  - Initial schema creation
  - Add extra_data column
  - Create indexes for full-text search
  - Add organization support
- **Documentation**: https://alembic.sqlalchemy.org

#### **psycopg 3.1.18**
- **Purpose**: PostgreSQL adapter for Python
- **Why chosen**:
  - Fast and efficient
  - Full PostgreSQL feature support
  - Async support
  - Connection pooling
- **Usage in app**:
  - PostgreSQL database connection
  - Query execution
  - Transaction handling
- **Documentation**: https://www.psycopg.org

### Security & Authentication

#### **python-jose** (implicit via FastAPI)
- **Purpose**: JWT token handling
- **Why chosen**:
  - Secure token generation
  - Token validation
  - Industry standard (RFC 7519)
- **Usage in app**:
  - User authentication
  - Token-based sessions
  - API security
- **Documentation**: https://python-jose.readthedocs.io

#### **passlib** (implicit via FastAPI)
- **Purpose**: Password hashing
- **Why chosen**:
  - Bcrypt algorithm
  - Secure password storage
  - Industry best practices
- **Usage in app**:
  - User password hashing
  - Password verification
  - Secure authentication
- **Documentation**: https://passlib.readthedocs.io

### API Enhancement

#### **SlowAPI 0.1.9**
- **Purpose**: Rate limiting for FastAPI
- **Why chosen**:
  - Prevent API abuse
  - DoS protection
  - Per-route limits
- **Usage in app**:
  - 100 requests per minute limit
  - IP-based rate limiting
  - Customizable per endpoint
- **Documentation**: https://github.com/laurentS/slowapi

#### **HTTPX 0.25.2**
- **Purpose**: Modern HTTP client
- **Why chosen**:
  - Async support
  - HTTP/2 support
  - Used for webhook calls
- **Usage in app**:
  - Webhook delivery
  - External API calls
  - Service integrations
- **Documentation**: https://www.python-httpx.org

### AI Integration

#### **google-generativeai 0.3.2**
- **Purpose**: Google Gemini AI integration
- **Why chosen**:
  - Natural language search
  - Free tier available
  - Easy integration
  - Good performance
- **Usage in app**:
  - AI-powered search
  - Natural language queries
  - Code suggestions
- **Documentation**: https://ai.google.dev/docs

### Utilities

#### **python-dotenv 1.0.0**
- **Purpose**: Environment variable management
- **Why chosen**:
  - .env file support
  - Easy configuration
  - Separation of secrets
- **Usage in app**:
  - Load environment variables
  - Development configuration
  - Secret management
- **Documentation**: https://github.com/theskumar/python-dotenv

---

## Database & Data Management

### Primary Database

#### **PostgreSQL 14+**
- **Purpose**: Relational database management system
- **Why chosen**:
  - ACID compliance
  - Full-text search support
  - JSON data type support
  - Excellent performance
  - Open source
- **Usage in app**:
  - Primary data storage
  - User management
  - Code storage (74,000+ records)
  - Analytics data
- **Features used**:
  - GIN indexes for full-text search
  - JSON/JSONB columns for metadata
  - Foreign key constraints
  - Transaction support
  - Connection pooling (20 + 40 overflow)
- **Indexes**:
  - Full-text search index on code and description
  - Category and severity indexes
  - Foreign key indexes
- **Documentation**: https://www.postgresql.org

### Cloud Database

#### **Neon PostgreSQL**
- **Purpose**: Serverless PostgreSQL cloud hosting
- **Why chosen**:
  - Serverless architecture
  - Auto-scaling
  - Generous free tier
  - Built-in connection pooling
  - Point-in-time recovery
- **Usage in app**:
  - Production database hosting
  - Development database
  - Automatic backups
- **Features**:
  - 0.5 GB storage (free tier)
  - Connection pooling
  - SSL/TLS encryption
  - Branching for testing
- **Documentation**: https://neon.tech

### Caching (Optional)

#### **Redis 5.0.1**
- **Purpose**: In-memory data store for caching
- **Why chosen**:
  - Extremely fast (sub-millisecond latency)
  - Rich data structures
  - Pub/sub support
  - Persistence options
- **Usage in app** (when enabled):
  - API response caching
  - Session storage
  - Rate limiting counters
  - Real-time features
- **Status**: Optional, not required for local development
- **Documentation**: https://redis.io

---

## Development Tools

### Package Management

#### **npm (Node Package Manager)**
- **Purpose**: JavaScript package manager
- **Why chosen**:
  - Industry standard
  - Huge registry
  - Lock file for consistency
- **Usage**: Frontend dependency management
- **Documentation**: https://docs.npmjs.com

#### **pip**
- **Purpose**: Python package manager
- **Why chosen**:
  - Python standard
  - Simple to use
  - Requirements.txt format
- **Usage**: Backend dependency management
- **Documentation**: https://pip.pypa.io

### Version Control

#### **Git**
- **Purpose**: Distributed version control
- **Why chosen**:
  - Industry standard
  - Branch management
  - Collaboration support
- **Usage**:
  - Code versioning
  - Feature branching
  - Commit history
- **Documentation**: https://git-scm.com

### Code Quality

#### **ESLint 8.56+**
- **Purpose**: JavaScript/TypeScript linter
- **Why chosen**:
  - Catch errors early
  - Code style consistency
  - Best practices enforcement
- **Usage in app**:
  - TypeScript linting
  - React rules
  - Accessibility checks
- **Configuration**:
  - TypeScript parser
  - React plugin
  - Custom rules
- **Documentation**: https://eslint.org

#### **TypeScript Compiler (tsc)**
- **Purpose**: TypeScript to JavaScript compilation
- **Why chosen**:
  - Type checking
  - Latest ECMAScript features
  - Code transformation
- **Usage**: Build process and type checking
- **Documentation**: https://www.typescriptlang.org

### Containerization

#### **Docker**
- **Purpose**: Container platform
- **Why chosen**:
  - Consistent environments
  - Easy deployment
  - Isolation
- **Usage in app**:
  - PostgreSQL container (local dev)
  - Production containerization
  - Docker Compose for orchestration
- **Files**:
  - `Dockerfile` (backend)
  - `Dockerfile` (frontend)
  - `docker-compose.yml`
- **Documentation**: https://docs.docker.com

#### **Docker Compose**
- **Purpose**: Multi-container orchestration
- **Why chosen**:
  - Easy local development
  - Service dependencies
  - Environment management
- **Usage**: Local database setup
- **Documentation**: https://docs.docker.com/compose/

---

## Testing Frameworks

### Backend Testing

#### **pytest 7.4+**
- **Purpose**: Python testing framework
- **Why chosen**:
  - Simple syntax
  - Powerful fixtures
  - Excellent plugin ecosystem
  - Async support
- **Usage in app**:
  - Unit tests (models, services)
  - Integration tests (API endpoints)
  - Fixtures for test data
- **Test count**: 51 tests, 98% coverage
- **Documentation**: https://docs.pytest.org

#### **pytest-cov**
- **Purpose**: Coverage reporting for pytest
- **Why chosen**:
  - Code coverage metrics
  - HTML reports
  - Integration with pytest
- **Usage**: Coverage reports (98%+ coverage)
- **Documentation**: https://pytest-cov.readthedocs.io

### Frontend Testing

#### **Vitest 4.0+**
- **Purpose**: Vite-native testing framework
- **Why chosen**:
  - Fast execution
  - Compatible with Vite
  - Jest-compatible API
  - Watch mode
- **Usage in app**:
  - Component tests
  - Hook tests
  - Service tests
- **Test count**: 209 tests, all passing
- **Documentation**: https://vitest.dev

#### **React Testing Library 16.3+**
- **Purpose**: React component testing
- **Why chosen**:
  - User-centric testing
  - Best practices encouraged
  - Accessibility-focused
- **Usage in app**:
  - Component rendering tests
  - User interaction tests
  - Integration tests
- **Documentation**: https://testing-library.com/react

#### **@testing-library/user-event 14.6+**
- **Purpose**: User interaction simulation
- **Why chosen**:
  - Realistic user events
  - Async support
  - Keyboard and pointer events
- **Usage**: Simulating clicks, typing, navigation
- **Documentation**: https://testing-library.com/docs/user-event/intro

#### **@testing-library/jest-dom 6.9+**
- **Purpose**: Custom Jest matchers for DOM
- **Why chosen**:
  - Readable assertions
  - DOM-specific matchers
  - Better error messages
- **Usage**: Assertions like `toBeInTheDocument()`, `toBeVisible()`
- **Documentation**: https://testing-library.com/docs/ecosystem-jest-dom

### End-to-End Testing

#### **Playwright 1.40+**
- **Purpose**: E2E testing framework
- **Why chosen**:
  - Cross-browser testing
  - Auto-wait for elements
  - Network interception
  - Screenshot/video capture
- **Usage in app**:
  - User flow testing
  - Integration testing
  - Critical path testing
- **Test count**: 26 tests, 100% passing
- **Browsers**: Chromium, Firefox, WebKit
- **Documentation**: https://playwright.dev

---

## Deployment & Infrastructure

### Frontend Deployment

#### **Vercel**
- **Purpose**: Frontend hosting and deployment
- **Why chosen**:
  - Automatic deployments from Git
  - Global CDN
  - Zero configuration
  - Free tier for personal projects
  - Excellent performance
- **Usage**:
  - Production frontend hosting
  - Preview deployments for PRs
  - Custom domains
  - Environment variables
- **Features**:
  - Automatic HTTPS
  - Edge network (global)
  - Instant cache invalidation
  - Build optimization
- **Alternative**: Netlify, Cloudflare Pages
- **Documentation**: https://vercel.com/docs

### Backend Deployment

#### **Railway**
- **Purpose**: Backend hosting platform
- **Why chosen**:
  - Easy PostgreSQL provisioning
  - Automatic deployments
  - Built-in monitoring
  - Affordable pricing
- **Usage**:
  - Backend API hosting
  - PostgreSQL database
  - Environment management
  - Continuous deployment
- **Features**:
  - Git integration
  - Automatic SSL
  - Logs and metrics
  - Database backups
- **Alternative**: Render, Fly.io, Heroku
- **Documentation**: https://docs.railway.app

### Domain & DNS

#### **Cloudflare** (optional)
- **Purpose**: DNS and CDN services
- **Why chosen**:
  - Free DNS management
  - DDoS protection
  - CDN acceleration
  - SSL certificates
- **Usage**: Domain management and security
- **Documentation**: https://www.cloudflare.com

---

## Third-Party Services

### Error Tracking

#### **Sentry 10.32+**
- **Purpose**: Application monitoring and error tracking
- **Why chosen**:
  - Real-time error reporting
  - Stack traces
  - Performance monitoring
  - User impact analysis
- **Usage in app**:
  - Frontend error tracking
  - Backend error tracking
  - Performance monitoring
  - Release tracking
- **Integration**:
  - `@sentry/react` for frontend
  - `sentry-sdk` for backend
- **Documentation**: https://docs.sentry.io

### AI Services

#### **Google Gemini API**
- **Purpose**: AI-powered natural language processing
- **Why chosen**:
  - Free tier available
  - Good performance
  - Easy integration
  - Multimodal capabilities
- **Usage**: Natural language search and code suggestions
- **Documentation**: https://ai.google.dev

---

## Build & Development Tools

### CSS Processing

#### **PostCSS**
- **Purpose**: CSS transformation tool
- **Why chosen**:
  - Autoprefixer for browser compatibility
  - CSS optimization
  - Works with Tailwind
- **Usage**: CSS processing in build pipeline
- **Documentation**: https://postcss.org

#### **Autoprefixer**
- **Purpose**: Automatically add vendor prefixes
- **Why chosen**:
  - Browser compatibility
  - Automatic updates
  - No manual prefixing
- **Usage**: CSS vendor prefixing
- **Documentation**: https://github.com/postcss/autoprefixer

### Animation

#### **tailwindcss-animate 1.0.7**
- **Purpose**: Animation utilities for Tailwind
- **Why chosen**:
  - Pre-built animations
  - Customizable
  - Performance optimized
- **Usage**:
  - Modal animations
  - Loading states
  - Transitions
- **Animations used**:
  - Fade in/out
  - Slide animations
  - Scale effects
- **Documentation**: https://github.com/jamiebuilds/tailwindcss-animate

### Development Scripts

#### **PowerShell Scripts**
- **Purpose**: Automation and workflow
- **Scripts**:
  - `start-all.ps1` - Start all services
  - `start-backend.ps1` - Start backend only
  - `start-frontend.ps1` - Start frontend only
  - `stop-all.ps1` - Stop all services
  - `verify-setup.ps1` - Verify environment
  - `run-e2e-tests.ps1` - Run E2E tests
- **Why chosen**:
  - Windows compatibility
  - Easy automation
  - Developer experience

---

## Environment & Configuration

### Environment Variables

**Backend (.env)**:
```env
DATABASE_URL=postgresql://...
SECRET_KEY=...
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
BACKEND_CORS_ORIGINS=["http://localhost:5173"]
GEMINI_API_KEY=...
SENTRY_DSN=... (optional)
REDIS_URL=... (optional)
```

**Frontend (.env)**:
```env
VITE_API_URL=http://localhost:8000
VITE_SENTRY_DSN=... (optional)
```

---

## Performance Optimizations

### Frontend
- **Code splitting**: Lazy loading routes
- **Virtual scrolling**: Only render visible items
- **Memoization**: React.memo for expensive components
- **Debouncing**: Search input (500ms)
- **Caching**: TanStack Query cache
- **Bundle optimization**: Vite tree-shaking

### Backend
- **Connection pooling**: 20 + 40 overflow
- **Database indexing**: GIN indexes for full-text search
- **Eager loading**: Prevent N+1 queries
- **Response compression**: GZip middleware
- **Rate limiting**: 100 requests/minute
- **Query optimization**: Selective column loading

### Database
- **Indexes**: Full-text search, foreign keys
- **Connection pooling**: Neon auto-scaling
- **Query optimization**: EXPLAIN ANALYZE for slow queries

---

## Security Measures

1. **Authentication**: JWT tokens with expiration
2. **Password hashing**: Bcrypt algorithm
3. **CORS**: Configured allowed origins
4. **Rate limiting**: API abuse prevention
5. **SQL injection**: SQLAlchemy parameterized queries
6. **XSS protection**: React auto-escaping
7. **HTTPS**: Enforced in production
8. **Environment variables**: Secrets not in code
9. **Input validation**: Pydantic and Zod schemas
10. **Error handling**: No sensitive info in errors

---

## Browser Support

### Target Browsers
- **Chrome**: Latest 2 versions
- **Firefox**: Latest 2 versions
- **Safari**: Latest 2 versions
- **Edge**: Latest 2 versions
- **Mobile**: iOS Safari, Chrome Android

### Polyfills
- Modern JavaScript features via Vite
- CSS features via PostCSS
- No IE11 support (deprecated)

---

## Development Requirements

### Minimum Versions
- **Node.js**: 18.0.0+
- **Python**: 3.11+
- **PostgreSQL**: 14+
- **npm**: 9.0.0+
- **Git**: 2.0.0+

### Recommended IDEs
- **VS Code** with extensions:
  - ESLint
  - Prettier
  - Python
  - Pylance
  - Thunder Client (API testing)
  - GitLens

---

## Dependency Management

### Frontend
- **Lock file**: `package-lock.json`
- **Updates**: `npm update` or `npm outdated`
- **Security**: `npm audit`

### Backend
- **Requirements**: `requirements.txt`, `requirements-dev.txt`
- **Virtual environment**: `venv`
- **Updates**: `pip list --outdated`

---

## Monitoring & Observability

### Production Monitoring
- **Sentry**: Error tracking and performance
- **Database**: Neon built-in monitoring
- **API**: FastAPI metrics endpoint
- **Frontend**: Web Vitals tracking

### Development Tools
- **React DevTools**: Component debugging
- **Network tab**: API request monitoring
- **Console logs**: Structured logging
- **Database GUI**: pgAdmin, DBeaver

---

## Future Technology Considerations

### Potential Additions
1. **Redis**: Production caching layer
2. **WebSockets**: Real-time updates
3. **GraphQL**: Alternative to REST API
4. **Elasticsearch**: Advanced search
5. **Docker Swarm/Kubernetes**: Container orchestration
6. **CI/CD**: GitHub Actions, GitLab CI
7. **Monitoring**: Prometheus + Grafana
8. **Message Queue**: RabbitMQ, Celery

---

## Technology Decision Matrix

| Aspect | Technology | Alternatives Considered | Why Chosen |
|--------|-----------|------------------------|------------|
| Frontend Framework | React | Vue, Angular, Svelte | Largest ecosystem, best TypeScript support |
| Backend Framework | FastAPI | Django, Flask, Express | Best async support, auto docs, modern |
| Database | PostgreSQL | MySQL, MongoDB | Full-text search, ACID, JSON support |
| Styling | Tailwind CSS | Styled Components, CSS Modules | Rapid development, small bundle |
| State Management | TanStack Query | Redux, MobX, Recoil | Built-in caching, simpler API |
| Testing (E2E) | Playwright | Cypress, Selenium | Cross-browser, faster, better API |
| Deployment | Vercel + Railway | AWS, DigitalOcean, Heroku | Ease of use, free tier, auto-deploy |
| Build Tool | Vite | Webpack, Parcel | Faster HMR, better DX |

---

## Resources & Documentation

### Official Docs
- [React](https://react.dev)
- [TypeScript](https://www.typescriptlang.org)
- [FastAPI](https://fastapi.tiangolo.com)
- [SQLAlchemy](https://docs.sqlalchemy.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Vite](https://vitejs.dev)

### Community
- [Stack Overflow](https://stackoverflow.com)
- [GitHub Discussions](https://github.com/discussions)
- [Discord Servers](https://discord.com) - React, FastAPI communities

### Learning
- [Frontend Masters](https://frontendmasters.com)
- [Real Python](https://realpython.com)
- [freeCodeCamp](https://www.freecodecamp.org)

---

**Last Updated**: December 25, 2025  
**Tech Stack Version**: 1.0.0  
**Maintained By**: Development Team
