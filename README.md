# Diagnostic Code Assistant

A comprehensive, production-ready AI-powered full-stack application for managing, searching, and analyzing diagnostic codes across medical, technical, and organizational contexts. Built with modern technologies and enterprise-grade features, this application streamlines diagnostic code management with an intuitive interface, powerful backend capabilities, and optional Google Gemini AI integration for natural language search.

## 📖 Overview

### What is Diagnostic Code Assistant?

Diagnostic Code Assistant is an enterprise-level code management system designed to help healthcare organizations, technical teams, and businesses efficiently organize, search, and maintain large repositories of diagnostic codes. Whether you're working with medical ICD-10 codes, system error codes, or custom diagnostic classifications, this application provides a unified platform for code management.

### Key Capabilities

**Code Management**
- Create, read, update, and delete diagnostic codes with full CRUD operations
- Organize codes by categories, subcategories, and severity levels
- Support for 74,000+ codes with high-performance virtual scrolling
- Bulk operations for managing multiple codes simultaneously
- Import/export functionality (CSV, JSON) for data migration

**Advanced Search & Discovery**
- Full-text search with PostgreSQL GIN indexes (2.2x faster than traditional ILIKE)
- Real-time autocomplete with search suggestions
- Multi-criteria filtering (category, severity, status)
- Save and reuse frequent searches
- **AI-powered natural language search** - Google Gemini integration for intelligent queries (e.g., "chest pain radiating to left arm" → relevant ICD codes)
- Smart search suggestions and code recommendations

**User Experience**
- Modern, responsive design that works on desktop, tablet, and mobile
- Dark/light theme support with system preference detection
- Keyboard shortcuts for power users (Ctrl+K for search, Ctrl+N for new, etc.)
- Virtual scrolling for smooth performance with large datasets
- Progressive Web App (PWA) support for offline access

**Collaboration & Organization**
- Multi-organization support with isolated data
- User authentication and role-based access control
- Favorites system for quick access to frequently used codes
- Real-time notifications for system events
- Activity analytics and usage tracking

**Enterprise Features**
- RESTful API with OpenAPI/Swagger documentation
- Comprehensive audit logging for compliance
- Database migrations with Alembic
- Connection pooling (60 concurrent connections)
- Rate limiting (100 requests/minute)
- CORS configuration for secure cross-origin requests
- Response compression with GZip middleware

### Use Cases

**Healthcare Organizations**
- Manage ICD-10, CPT, and other medical diagnostic codes
- Quick lookup during patient encounters
- Training and reference for medical coding staff
- Compliance and audit trail requirements

**IT & DevOps Teams**
- Centralize system error codes and troubleshooting guides
- Document application-specific diagnostic codes
- Share knowledge across development and support teams
- Integration with monitoring and alerting systems

**Quality Assurance**
- Track defect classifications and severity levels
- Maintain standardized issue taxonomies
- Generate reports on code usage patterns
- Historical analysis of diagnostic trends

**Research & Education**
- Teaching medical coding and classification systems
- Research on diagnostic code patterns and evolution
- Data analysis and statistical studies
- Reference database for academic purposes

### Technical Highlights

**Performance Optimized**
- Full-text search: 146ms average query time
- Virtual scrolling renders only visible rows
- Database query optimization with eager loading
- Frontend bundling and code splitting
- Response caching with Redis support

**Well Tested**
- 286 total tests (100% passing)
- 98%+ code coverage
- Unit, integration, and end-to-end tests
- Automated test execution in CI/CD

**Developer Friendly**
- Comprehensive API documentation
- PowerShell automation scripts
- Hot reload in development
- TypeScript for type safety
- Clear project structure

**Production Ready**
- Cloud database support (Neon PostgreSQL)
- Deployment guides for Railway and Vercel
- Environment-based configuration
- Error handling and logging
- Security best practices

## 🚀 Tech Stack

### Frontend
- **React 18** with **TypeScript** - Modern UI framework
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful, accessible components
- **Zod** - Type-safe validation
- **Lucide React** - Icon library

### Backend
- **Python 3.11+** - Programming language
- **FastAPI** - High-performance web framework
- **SQLAlchemy** - Powerful ORM
- **Pydantic** - Data validation
- **Alembic** - Database migrations
- **PostgreSQL** - Reliable database

### DevOps
- **Docker & Docker Compose** - Containerization
- **Uvicorn** - ASGI server

## 📋 Prerequisites

Before you begin, ensure you have installed:
- **Python 3.11+** ([Download](https://www.python.org/downloads/))
- **Node.js 18+** ([Download](https://nodejs.org/))
- **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop))
- **Git** ([Download](https://git-scm.com/downloads))

## 🛠️ Quick Start

### 1️⃣ Verify Setup

Run the verification script to check if everything is installed correctly:

```powershell
.\verify-setup.ps1
```

### 2️⃣ Start Docker Desktop

Make sure Docker Desktop is running before starting the application.

### 3️⃣ Start All Services

Use the convenient startup script to launch everything:

```powershell
.\start-all.ps1
```

This will:
- Start PostgreSQL database in Docker
- Launch the FastAPI backend server
- Start the React development server

### 4️⃣ Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Alternative API Docs**: http://localhost:8000/redoc

## 🔧 Manual Setup

If you prefer to set up manually:

### Backend Setup

```powershell
# Navigate to backend directory
cd backend

# Activate virtual environment
..\.venv\Scripts\Activate.ps1

# Install dependencies (already installed if you ran verify-setup)
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload
```

### Frontend Setup

```powershell
# Navigate to frontend directory
cd frontend

# Install dependencies (already installed)
npm install

# Start development server
npm run dev
```

### Database Setup

```powershell
# Start PostgreSQL with Docker Compose
docker-compose up -d

# Stop database
docker-compose down
```

## 📁 Project Structure

```
DiagnosticCodeAssistant/
├── backend/                    # FastAPI Backend
│   ├── app/
│   │   ├── api/               # API routes
│   │   │   └── v1/
│   │   │       ├── api.py     # API router
│   │   │       └── endpoints/ # API endpoints
│   │   ├── core/              # Core configuration
│   │   ├── db/                # Database setup
│   │   ├── models/            # SQLAlchemy models
│   │   ├── schemas/           # Pydantic schemas
│   │   └── services/          # Business logic
│   ├── main.py                # Application entry point
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Environment variables
│
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   │   └── ui/           # shadcn/ui components
│   │   ├── config/            # Configuration
│   │   ├── hooks/             # Custom hooks
│   │   ├── lib/               # Utilities
│   │   ├── pages/             # Page components
│   │   ├── services/          # API services
│   │   ├── types/             # TypeScript types
│   │   ├── App.tsx            # Root component
│   │   └── main.tsx           # Entry point
│   ├── package.json           # Node dependencies
│   ├── vite.config.ts         # Vite configuration
│   ├── tailwind.config.js     # Tailwind configuration
│   └── tsconfig.json          # TypeScript configuration
│
├── docker-compose.yml          # Docker services
├── .env.example               # Environment template
├── start-all.ps1              # Start all services
├── start-backend.ps1          # Start backend only
├── start-frontend.ps1         # Start frontend only
├── stop-all.ps1               # Stop all services
├── verify-setup.ps1           # Verify installation
└── README.md                  # This file
```

## 🎯 Features

- **Search & Filter**: Powerful search functionality for diagnostic codes
- **CRUD Operations**: Create, read, update, and delete diagnostic codes
- **Modern UI**: Beautiful, responsive interface built with shadcn/ui
- **Type Safety**: Full TypeScript support on frontend
- **API Documentation**: Auto-generated interactive API docs
- **Database Migrations**: Managed with Alembic
- **Docker Support**: Easy deployment with Docker Compose

## 🔄 Development Scripts

### PowerShell Scripts

- `.\verify-setup.ps1` - Verify all dependencies are installed
- `.\start-all.ps1` - Start all services (database, backend, frontend)
- `.\start-backend.ps1` - Start backend server only
- `.\start-frontend.ps1` - Start frontend dev server only
- `.\stop-all.ps1` - Stop all Docker services

### Backend Commands

```powershell
# Run backend server
cd backend
..\.venv\Scripts\python.exe -m uvicorn main:app --reload

# Create database migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head
```

## 🔑 Key Features

### Core Functionality

**Diagnostic Code Management**
- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ Rich code attributes: code, description, category, subcategory, severity
- ✅ Active/inactive status toggling
- ✅ Custom metadata support with JSON extra_data field
- ✅ Automatic timestamp tracking (created_at, updated_at)

**Search & Filter**
- ✅ Real-time full-text search across all code fields
- ✅ Advanced filtering by category, subcategory, and severity
- ✅ Search autocomplete with suggestions
- ✅ Save and load custom filter presets
- ✅ Saved searches for frequently used queries
- ✅ AI-powered natural language search

**Bulk Operations**
- ✅ Multi-select codes with checkboxes
- ✅ Select all with keyboard shortcut (Ctrl+A)
- ✅ Bulk delete with confirmation
- ✅ Bulk export to CSV or JSON
- ✅ Bulk import from CSV files
- ✅ Import validation and error reporting

**User Interface**
- ✅ Responsive design (desktop, tablet, mobile)
- ✅ Dark/light theme with smooth transitions
- ✅ Virtual scrolling for 74,000+ codes
- ✅ Card-based code display with badges
- ✅ Modal forms for create/edit operations
- ✅ Toast notifications for user feedback
- ✅ Loading skeletons and states
- ✅ Accessible UI components (ARIA labels)

**Keyboard Shortcuts**
- ✅ `Ctrl+K` - Focus search
- ✅ `Ctrl+N` - Create new code
- ✅ `Ctrl+E` - Export codes
- ✅ `Ctrl+I` - Import codes
- ✅ `Ctrl+A` - Select all codes
- ✅ `Ctrl+→/←` - Navigate pages
- ✅ `?` - Show keyboard shortcuts
- ✅ `Esc` - Close modals

**Dashboard & Analytics**
- ✅ Total codes count
- ✅ Active vs inactive statistics
- ✅ Category distribution charts
- ✅ Severity level breakdown
- ✅ Recent activity tracking
- ✅ User engagement analytics
- ✅ Custom analytics events

**Advanced Features**
- ✅ Multi-organization support
- ✅ User favorites for quick access
- ✅ Version history tracking
- ✅ Webhook integrations
- ✅ Real-time notifications
- ✅ Audit logging
- ✅ Organization switching
- ✅ User profile management

**Data Management**
- ✅ Import from CSV with validation
- ✅ Export to CSV format
- ✅ Export to JSON format
- ✅ Sample data seeding scripts
- ✅ ICD-10 code importer (74,000+ codes)
- ✅ Realistic test data generator

### Technical Features

**Backend API**
- ✅ RESTful API architecture
- ✅ OpenAPI/Swagger documentation
- ✅ JWT authentication
- ✅ Role-based access control
- ✅ Request/response validation
- ✅ Error handling middleware
- ✅ CORS configuration
- ✅ Rate limiting (100 req/min)
- ✅ Response compression (GZip)
- ✅ Database connection pooling
- ✅ Redis caching support

**Database**
- ✅ PostgreSQL with cloud support (Neon)
- ✅ Full-text search with GIN indexes
- ✅ Database migrations (Alembic)
- ✅ Connection pool (20 + 40 overflow)
- ✅ Foreign key relationships
- ✅ JSON data type support
- ✅ Automatic timestamp columns

**Security**
- ✅ Password hashing (bcrypt)
- ✅ JWT token authentication
- ✅ CORS origin validation
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ Input sanitization
- ✅ Environment variable secrets

**Testing & Quality**
- ✅ 286 tests (100% passing)
- ✅ 98% code coverage
- ✅ Unit tests (pytest, Vitest)
- ✅ Integration tests
- ✅ End-to-end tests (Playwright)
- ✅ TypeScript strict mode
- ✅ ESLint configuration
- ✅ Automated test scripts

**Developer Experience**
- ✅ Hot reload (frontend & backend)
- ✅ PowerShell automation scripts
- ✅ Docker containerization
- ✅ Environment setup verification
- ✅ Comprehensive documentation
- ✅ API client generation
- ✅ Type-safe development

## 🎯 Frontend Commands

```powershell
# Start development server
cd frontend
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🧪 Testing

### Backend Tests (pytest)

```powershell
cd backend

# Run all tests with coverage
pytest --cov=app --cov-report=html --cov-report=term-missing

# Run specific test file
pytest tests/test_api.py

# Run with verbose output
pytest -v
```

**Test Coverage**: 51 tests, 98% code coverage
- 8 model tests
- 19 service layer tests
- 24 API endpoint tests

### Frontend Tests (Vitest)

```powershell
cd frontend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests in UI mode
npm run test:ui
```

**Test Coverage**: 209 tests
- Component tests
- Hook tests
- Service tests
- Integration tests

### E2E Tests (Playwright)

```powershell
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in headed mode
npm run test:e2e:headed

# View test report
npm run test:e2e:report

# Quick E2E test runner
.\run-e2e-tests.ps1
```

**Test Coverage**: 26 E2E tests across 4 suites
- Home page functionality
- Dashboard statistics
- Bulk operations
- User interactions & keyboard shortcuts

See [e2e/README.md](e2e/README.md) for detailed E2E testing documentation.

## 🌐 API Endpoints

### Diagnostic Codes

- `GET /api/v1/diagnostic-codes` - List all codes (with pagination)
- `GET /api/v1/diagnostic-codes/{id}` - Get code by ID
- `POST /api/v1/diagnostic-codes` - Create new code
- `PUT /api/v1/diagnostic-codes/{id}` - Update code
- `DELETE /api/v1/diagnostic-codes/{id}` - Delete code
- `GET /api/v1/diagnostic-codes/search` - Search codes

## 📝 Environment Variables

Copy `.env.example` to `backend/.env` and configure:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/diagnostic_codes
API_V1_PREFIX=/api/v1
PROJECT_NAME=Diagnostic Code Assistant
BACKEND_CORS_ORIGINS=["http://localhost:5173","http://localhost:3000"]
```

## 🐛 Troubleshooting

### Database Connection Issues
- Ensure Docker Desktop is running
- Check if PostgreSQL container is running: `docker ps`
- Verify DATABASE_URL in backend/.env

### Port Already in Use
- Backend (8000): Kill process or change port in start-backend.ps1
- Frontend (5173): Change port in vite.config.ts
- Database (5432): Change port in docker-compose.yml

### Python Virtual Environment Issues
- Delete `.venv` folder and recreate: `python -m venv .venv`
- Reinstall dependencies: `pip install -r backend/requirements.txt`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Check the API documentation at http://localhost:8000/docs
- Review the troubleshooting section above
- Open an issue on GitHub

---

**Happy Coding! 🚀**
