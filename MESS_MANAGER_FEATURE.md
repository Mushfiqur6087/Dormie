# Mess Manager Feature

This document describes the new Mess Manager feature implemented in the Dorm-E system.

## Overview

The Mess Manager feature allows for efficient management of dining hall operations through a structured workflow involving Provosts, students, and mess managers.

## Backend Implementation

### Database Entities
- `MessManagerCall` - Recruitment calls for mess manager positions
- `MessManagerApplication` - Student applications for mess manager positions
- `MessManager` - Active mess manager assignments
- `MessMenu` - Daily menu management
- `FundRequest` - Financial requests from mess managers

### REST API Endpoints

#### Mess Manager Calls
- `GET /api/mess-manager-calls` - List all calls
- `POST /api/mess-manager-calls` - Create new call (Provost/Admin)
- `GET /api/mess-manager-calls/active` - Get active calls
- `GET /api/mess-manager-calls/{id}` - Get call details
- `PATCH /api/mess-manager-calls/{id}/close` - Close call (Provost/Admin)

#### Applications
- `POST /api/mess-manager-applications/call/{callId}` - Apply to call (Student)
- `GET /api/mess-manager-applications` - List all applications (Provost/Admin)
- `GET /api/mess-manager-applications/my-applications` - Get user's applications (Student)
- `PATCH /api/mess-manager-applications/{id}` - Update application status (Provost/Admin)

#### Mess Managers
- `POST /api/mess-managers/assign` - Assign mess manager (Provost/Admin)
- `GET /api/mess-managers` - List all managers (Provost/Admin)
- `GET /api/mess-managers/active` - Get active managers
- `GET /api/mess-managers/my-assignments` - Get user's assignments (Student)
- `PATCH /api/mess-managers/{id}/terminate` - Terminate assignment (Provost/Admin)

#### Menu Management
- `GET /api/mess-menus` - List menus
- `POST /api/mess-menus` - Create menu (Mess Manager)
- `GET /api/mess-menus/today` - Get today's menu
- `GET /api/mess-menus/week` - Get current week's menus
- `PUT /api/mess-menus/{id}` - Update menu (Mess Manager)
- `DELETE /api/mess-menus/{id}` - Delete menu (Mess Manager/Admin)

#### Fund Requests
- `GET /api/fund-requests` - List all requests (Provost/Admin)
- `POST /api/fund-requests` - Create request (Mess Manager)
- `GET /api/fund-requests/my-requests` - Get user's requests (Mess Manager)
- `PATCH /api/fund-requests/{id}/review` - Review request (Provost/Admin)

## Frontend Implementation

### Provost Dashboard (`/authoritycorner/provost/mess-manager`)
- Create and manage mess manager recruitment calls
- Review and approve/reject applications
- Assign mess managers
- Review fund requests
- Monitor active managers

#### Key Features:
- **Call Management**: Create calls with title, description, deadline, and requirements
- **Application Review**: Approve/reject applications with bulk actions
- **Fund Approval**: Review and approve/reject funding requests with comments
- **Manager Oversight**: View active managers and terminate if needed

### Student Interface (`/studentscorner/mess-manager`)
- View available mess manager calls
- Apply to open positions
- Track application status
- Manage menus (when assigned as mess manager)
- Submit fund requests (when assigned as mess manager)

#### Key Features:
- **Application System**: Apply with motivation and track status
- **Menu Management**: Create daily menus with breakfast, lunch, dinner
- **Fund Requests**: Request funds for mess operations with urgency levels
- **Assignment Tracking**: View current and past assignments

## Security & Authorization

- **Role-based Access Control**: Different features available based on user roles (PROVOST, STUDENT, ADMIN)
- **JWT Authentication**: All API endpoints protected with JWT tokens
- **Method-level Security**: `@PreAuthorize` annotations on sensitive operations
- **Resource Access Control**: Users can only access their own applications/assignments

## Workflow

1. **Call Creation**: Provost creates mess manager call for specific month/year
2. **Application Phase**: Students apply with motivation during open period
3. **Selection**: Provost reviews applications and approves suitable candidates
4. **Assignment**: Approved applicants automatically assigned as mess managers
5. **Operations**: Mess managers create menus and submit fund requests
6. **Oversight**: Provost monitors operations and approves funding

## Database Schema

### Key Relationships
- `MessManagerCall` → `MessManagerApplication` (One-to-Many)
- `MessManagerApplication` → `MessManager` (One-to-One when approved)
- `MessManager` → `MessMenu` (One-to-Many)
- `MessManager` → `FundRequest` (One-to-Many)

### Important Fields
- **Status Enums**: ACTIVE/CLOSED for calls, PENDING/APPROVED/REJECTED for applications
- **Date Ranges**: Start/end dates for manager assignments
- **Audit Fields**: Created/updated timestamps, user tracking
- **Month/Year Tracking**: Ensures proper temporal organization

## Installation & Configuration

1. **Database**: Run migrations to create new tables
2. **Backend**: Restart Spring Boot application to load new controllers
3. **Frontend**: New routes automatically available through React Router
4. **Navigation**: Updated layouts include mess manager menu items

## Testing

- All controllers include comprehensive error handling
- Form validation on both frontend and backend
- Role-based access testing recommended
- Database constraints prevent invalid data states

## Future Enhancements

- **Notifications**: Email/SMS alerts for application status changes
- **Analytics**: Dashboard with mess manager performance metrics
- **Integration**: Connect with inventory management systems
- **Mobile App**: Dedicated mobile interface for mess managers
- **Reporting**: Generate reports on mess operations and finances
