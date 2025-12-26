# Authentication System

## Overview

The Diagnostic Code Assistant now includes a complete JWT-based authentication system. Users must register and login to access the application.

## Features

- **User Registration**: Create new accounts with email, username, and password
- **Login/Logout**: Secure authentication with JWT tokens
- **Protected Routes**: All diagnostic code features require authentication
- **Token Management**: Automatic token refresh and session management
- **User Profile**: View current user information in the header

## Implementation

### Backend

1. **User Model** ([backend/app/models/user.py](backend/app/models/user.py))
   - SQLAlchemy model with email, username, hashed passwords
   - Support for is_active and is_superuser flags
   - Timestamps for created_at and updated_at

2. **Authentication Endpoints** ([backend/app/api/v1/endpoints/auth.py](backend/app/api/v1/endpoints/auth.py))
   - `POST /api/v1/auth/register`: Create new user account
   - `POST /api/v1/auth/login`: Login and receive JWT token
   - `GET /api/v1/auth/me`: Get current user information

3. **Security** ([backend/app/core/security.py](backend/app/core/security.py))
   - Password hashing with bcrypt
   - JWT token generation and validation
   - Configurable token expiration (default: 30 minutes)

4. **Dependencies** ([backend/app/core/deps.py](backend/app/core/deps.py))
   - `get_current_user`: Extract user from JWT token
   - `get_current_active_user`: Verify user is active
   - `get_current_superuser`: Verify user has admin permissions

### Frontend

1. **Auth Context** ([frontend/src/contexts/AuthContext.tsx](frontend/src/contexts/AuthContext.tsx))
   - Global authentication state management
   - Login, register, and logout functions
   - Persistent token storage in localStorage

2. **Auth Service** ([frontend/src/services/auth.ts](frontend/src/services/auth.ts))
   - API calls for authentication endpoints
   - Token management

3. **Protected Routes** ([frontend/src/components/ProtectedRoute.tsx](frontend/src/components/ProtectedRoute.tsx))
   - Wraps authenticated pages
   - Redirects to login if not authenticated

4. **Login/Register Pages**
   - [frontend/src/pages/LoginPage.tsx](frontend/src/pages/LoginPage.tsx)
   - [frontend/src/pages/RegisterPage.tsx](frontend/src/pages/RegisterPage.tsx)
   - Form validation and error handling

5. **API Client** ([frontend/src/lib/apiClient.ts](frontend/src/lib/apiClient.ts))
   - Axios instance with automatic token injection
   - Automatic redirect on 401 responses

## Configuration

### Backend Environment Variables

```bash
# Add to backend/.env
SECRET_KEY=your-secret-key-at-least-32-characters-long
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**IMPORTANT**: Change the `SECRET_KEY` in production! Use a strong random string:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Database Migration

Run the Alembic migration to create the users table:

```bash
cd backend
alembic upgrade head
```

## Usage

### Registering a New User

1. Navigate to `/register`
2. Enter email, username, password (min 8 characters)
3. Optionally add full name
4. Click "Create Account"

### Logging In

1. Navigate to `/login`
2. Enter username and password
3. Click "Sign In"
4. You'll be redirected to the home page

### Logging Out

1. Click the user icon in the header
2. Select "Log out" from the dropdown menu

## Security Features

- **Password Hashing**: Passwords are hashed using bcrypt before storage
- **JWT Tokens**: Secure, stateless authentication
- **Token Expiration**: Tokens expire after 30 minutes (configurable)
- **HTTPS Required**: Always use HTTPS in production
- **Protected Endpoints**: All diagnostic code endpoints require authentication

## API Examples

### Register

```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "johndoe",
    "password": "securepassword123",
    "full_name": "John Doe"
  }'
```

### Login

```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=johndoe&password=securepassword123"
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### Get Current User

```bash
curl -X GET "http://localhost:8000/api/v1/auth/me" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Next Steps

Consider these enhancements:

1. **Email Verification**: Verify email addresses during registration
2. **Password Reset**: Allow users to reset forgotten passwords
3. **Refresh Tokens**: Long-lived tokens for better UX
4. **OAuth2**: Social login with Google, GitHub, etc.
5. **Two-Factor Authentication**: Add extra security layer
6. **Role-Based Access Control**: Different permissions for admin users
