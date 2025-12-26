# Advanced Features Implementation

This document describes the newly implemented advanced features for the Diagnostic Code Assistant.

## 1. Advanced Search with Autocomplete

### Backend Features
- **Autocomplete Endpoint** (`/api/v1/search/autocomplete`): Real-time suggestions as you type
- **Advanced Search** (`/api/v1/search/advanced`): Full-featured search with:
  - Fuzzy matching using `SequenceMatcher` for similarity scoring
  - Relevance ranking based on match position and type
  - HTML highlighting with `<mark>` tags
  - Filter support (category, severity, is_active)
- **Recent Searches** (`/api/v1/search/recent`): Track and retrieve last 50 searches per user
- **Saved Searches** (`/api/v1/search/saved`): Create reusable search presets with filters

### Database Tables
- `recent_searches`: User search history (auto-pruned to 50 entries)
- `saved_searches`: Named search presets with filter configurations

### Frontend Features
- `useAutocomplete` hook with debouncing (300ms default)
- Services for all search operations
- Ready for integration into HomePage search bar

### Usage Example
```python
# Backend
results = await searchService.advanced_search(
    query="diabetes",
    fuzzy=True,
    highlight=True,
    category="Endocrine",
    limit=20
)

# Frontend
const { suggestions, loading } = useAutocomplete(searchQuery);
```

## 2. Audit Logging System

### Backend Features
- **Comprehensive Tracking**: All CRUD operations logged with:
  - User ID and IP address
  - Action type (create, update, delete, login, logout)
  - Resource type and ID
  - Before/after values in `changes` JSON field
  - User agent and custom metadata
- **Automatic Integration**: Audit logs created in:
  - Diagnostic code create/update/delete
  - User login events
- **Query API** (`/api/v1/audit`):
  - `/audit` - All logs (superuser only)
  - `/audit/me` - Current user's activity
  - Filters: action, resource_type, resource_id, date range
  - Pagination support

### Database Table
- `audit_logs`: Comprehensive audit trail with 6 indexes for fast querying

### Frontend Features
- **AuditLogPage**: Full audit log viewer with:
  - Tabbed interface (My Activity / All Activity)
  - Action and resource type filters
  - Color-coded badges for action types
  - JSON diff viewer for changes
  - Pagination controls
  - Admin-only access to all logs

### Usage Example
```python
# Log a code update
AuditService.log_code_update(
    db=db,
    code_id=123,
    user_id=current_user.id,
    old_data={"code": "E11.9", "description": "Old desc"},
    new_data={"description": "New desc"},
    ip=request.client.host
)
```

## 3. Role-Based Access Control (RBAC)

### Roles Hierarchy
1. **viewer**: Read-only access to diagnostic codes
2. **user**: Can read and modify diagnostic codes (default)
3. **manager**: User permissions + can manage team members
4. **admin**: Full access including user management

### Backend Implementation
- **Role Column**: Added to `users` table with default "user"
- **RoleChecker Dependency**: Reusable FastAPI dependency
  ```python
  from app.core.rbac import require_editor, require_admin
  
  @router.post("/codes")
  async def create_code(
      current_user: User = Depends(require_editor)
  ):
      ...
  ```
- **Pre-built Dependencies**:
  - `require_admin`: Admin only
  - `require_manager`: Admin or manager
  - `require_editor`: Admin, manager, or user
  - `require_viewer`: Any authenticated user
- **User Management API** (`/api/v1/users`): Admin-only endpoints for:
  - List all users
  - Get/update/delete users
  - Update user roles

### Protected Endpoints
- **Diagnostic Codes**:
  - GET (read): `require_viewer` - All authenticated users
  - POST/PUT/DELETE (write): `require_editor` - Users, managers, admins
- **Analytics**: `require_viewer` - All authenticated users
- **Audit Logs**:
  - `/audit/me`: All users can see their own activity
  - `/audit`: Admin only for all logs
- **User Management**: `require_admin` - Admin only

### Database Migration
- Migration 004: Adds `role` column with default "user"
- Migration 005: Adds search tables

### Frontend Integration
- User role displayed in user menu
- Role-based UI elements (conditionally show admin features)
- Updated UserResponse schema includes role field

## Database Migrations

### Migration 004: Audit Logs and RBAC
```bash
# Creates:
# - audit_logs table with 6 indexes
# - role column in users table
```

### Migration 005: Search Tables
```bash
# Creates:
# - recent_searches table
# - saved_searches table
```

## API Summary

### New Endpoints

#### Search
- `GET /api/v1/search/autocomplete?query={q}` - Get autocomplete suggestions
- `GET /api/v1/search/advanced?query={q}&fuzzy=true` - Advanced search
- `GET /api/v1/search/recent` - Get recent searches
- `DELETE /api/v1/search/recent` - Clear recent searches
- `GET /api/v1/search/saved` - Get saved search presets
- `POST /api/v1/search/saved` - Create saved search
- `DELETE /api/v1/search/saved/{id}` - Delete saved search

#### Audit
- `GET /api/v1/audit?action={a}&resource_type={r}` - Get all audit logs (admin)
- `GET /api/v1/audit/me` - Get my audit logs

#### Users (Admin)
- `GET /api/v1/users` - List all users
- `GET /api/v1/users/{id}` - Get user details
- `PUT /api/v1/users/{id}` - Update user
- `DELETE /api/v1/users/{id}` - Delete user
- `PUT /api/v1/users/{id}/role?role={role}` - Update user role

## Security Considerations

1. **Audit Logs**: Immutable trail of all actions for compliance
2. **RBAC**: Principle of least privilege - users only get necessary permissions
3. **IP Tracking**: Login and action IP addresses logged
4. **User Agent**: Browser/client information captured
5. **Admin Protection**: Cannot delete or change own role
6. **Viewer Role**: Perfect for read-only access (e.g., auditors, stakeholders)

## Next Steps

To use these features:

1. **Run Migrations**:
   ```bash
   cd backend
   alembic upgrade head
   ```

2. **Test RBAC**:
   - Create users with different roles
   - Test endpoint access based on roles
   - Verify admin-only features

3. **Frontend Integration**:
   - Add search bar with autocomplete to HomePage
   - Link "Audit Logs" in navigation (already added)
   - Create user management page for admins

4. **Seed Data** (Optional):
   - Create test users with different roles
   - Add sample audit log entries
   - Create sample saved searches
