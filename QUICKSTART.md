# Quick Start Guide - Diagnostic Code Assistant

## ✅ Setup Complete!

Your Diagnostic Code Assistant app is fully set up and ready to use!

## 🚀 How to Run

### Option 1: Start Everything at Once (Recommended)

1. **Start Docker Desktop** (if not already running)
2. Open PowerShell in this directory
3. Run:
   ```powershell
   .\start-all.ps1
   ```

This will open:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### Option 2: Start Services Individually

**Terminal 1 - Database:**
```powershell
docker-compose up
```

**Terminal 2 - Backend:**
```powershell
.\start-backend.ps1
```

**Terminal 3 - Frontend:**
```powershell
.\start-frontend.ps1
```

## 🛑 How to Stop

```powershell
.\stop-all.ps1
```

Or press `Ctrl+C` in each terminal window.

## 🔍 What You Can Do

- ✅ Search diagnostic codes
- ✅ View code details
- ✅ Create new codes
- ✅ Edit existing codes
- ✅ Delete codes
- ✅ Filter by category and severity

## 📚 Available Resources

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Interactive API Docs**: http://localhost:8000/docs
- **Alternative API Docs**: http://localhost:8000/redoc

## 🎯 Tech Stack Features

### Frontend
- React 18 + TypeScript
- Tailwind CSS styling
- shadcn/ui components
- Responsive design
- Real-time search

### Backend
- FastAPI framework
- PostgreSQL database
- RESTful API
- Auto-generated documentation
- Type validation with Pydantic

## 📝 Sample API Requests

### Get All Codes
```bash
GET http://localhost:8000/api/v1/diagnostic-codes
```

### Create New Code
```bash
POST http://localhost:8000/api/v1/diagnostic-codes
Content-Type: application/json

{
  "code": "E001",
  "description": "System error",
  "category": "ERROR",
  "severity": "high"
}
```

### Search Codes
```bash
GET http://localhost:8000/api/v1/diagnostic-codes/search?q=error
```

## 🔧 Troubleshooting

### Database won't start
- Make sure Docker Desktop is running
- Check if port 5432 is available

### Frontend won't load
- Check if port 5173 is available
- Verify Node.js is installed: `node --version`

### Backend errors
- Ensure Python packages are installed
- Check database connection in `.env` file

## 📖 Next Steps

1. **Explore the UI**: Open http://localhost:5173
2. **Test the API**: Visit http://localhost:8000/docs
3. **Add Sample Data**: Use the UI or API to create diagnostic codes
4. **Customize**: Modify components in `frontend/src`
5. **Extend**: Add new endpoints in `backend/app/api`

## 🎉 Happy Coding!

For more details, see [README.md](README.md)
