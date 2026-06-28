# AURA Management System

## Web Portal for Sports Academies

### Athlete • Unified • Resistence • Ambitious

---

## Vision

Creating seamless connections between clubs, coaches, and trainees through intuitive digital experiences. AURA makes sports academy management feel simple, modern, and accessible for everyone.

## Mission

To build strong relationships and deep trust between clubs and their trainees by delivering intuitive tools that help administrators, coaches, and athletes focus on what matters — performance and growth.

---

## Product Overview

AURA Management System is a modern web-based portal for managing sports academy operations. Built with a focus on user experience, it provides comprehensive tools for managing trainees, coaches, employees, schedules, enrollments, and more — all in one unified interface.

---

## Key Features

| Category | Features |
|----------|----------|
| **Dashboard** | Real-time insights, quick stats, notifications |
| **Trainee Management** | Registration, profiles, sports assignment, progress tracking |
| **Employee Management** | Staff profiles, roles, performance tracking |
| **Coach Management** | Coach profiles, specializations, assigned groups |
| **Enrollments** | New enrollments, renewal tracking, subscription management |
| **Attendance** | Per-session tracking, attendance rates, reports |
| **Scheduling** | Group schedules, session occurrences, calendar view |
| **Sports** | Sport catalog, pricing, availability per branch |
| **Branches** | Multi-branch management, location settings |
| **Groups** | Trainee groups by skill level, capacity management |
| **AI Chat** | AI-powered assistant for quick answers and support |
| **Video Analysis** | Upload videos for pose/movement analysis with AI feedback |
| **Notifications** | Real-time alerts and updates via SignalR |

---

## User Roles

| Role | Description |
|------|-------------|
| **Admin** | Full system access across all branches |
| **Manager** | Branch-level operations and oversight |
| **Coach** | Manage trainee groups and attendance |
| **HR** | Employee management |
| **Accountant** | Financial tracking and reports |
| **IT** | System configuration |
| **Trainee** | Self-service profile and schedule viewing |

---

## Page Overview

| Page | Purpose |
|------|---------|
| `Dashboard.tsx` | Overview with stats, charts, recent activity |
| `Trainees.tsx` | Trainee list, search, filters, CRUD operations |
| `TraineeProfile.tsx` | Individual trainee details and history |
| `Employees.tsx` | Employee list with search and management |
| `EmployeeProfile.tsx` | Employee details and assignments |
| `Coaches.tsx` | Coach list with specializations |
| `CoachProfile.tsx` | Coach profile and assigned groups |
| `Enrollments.tsx` | Active enrollments management |
| `EnrollmentProfile.tsx` | Individual enrollment details |
| `Attendance.tsx` | Session attendance tracking and history |
| `Sessions.tsx` | Session occurrence management |
| `SessionOccurrences.tsx` | Detailed session tracking |
| `TraineeGroups.tsx` | Group management (skill levels, capacity) |
| `TraineeGroupProfile.tsx` | Group details and member list |
| `Sports.tsx` | Sport catalog and pricing |
| `SportProfile.tsx` | Sport details and availability |
| `Branches.tsx` | Branch management |
| `BranchProfile.tsx` | Branch details and settings |
| `UsersRoles.tsx` | User role management |
| `VideoAnalysis.tsx` | Video upload and AI analysis |
| `NotificationsPage.tsx` | Notification center |
| `Login.tsx` / `Register.tsx` | Authentication |

---

## Technology Stack

| Category | Technology |
|----------|------------|
| **Framework** | React 18 |
| **Language** | TypeScript |
| **Build Tool** | Vite |
| **State Management** | TanStack Query |
| **Routing** | React Router v6 |
| **UI Components** | Radix UI |
| **Styling** | Tailwind CSS |
| **Forms** | React Hook Form + Zod |
| **HTTP Client** | Fetch API (custom wrapper) |
| **Real-time** | Microsoft SignalR |
| **Testing** | Vitest |
| **Linting** | ESLint |

---

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=https://localhost:7000
VITE_ENABLE_DEV_LOGIN=false
VITE_ENABLE_SIGNALR=false
```

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend API base URL |
| `VITE_ENABLE_DEV_LOGIN` | Enable development mock login |
| `VITE_ENABLE_SIGNALR` | Enable real-time notifications |

### CORS Configuration

The backend allows requests from:
- `http://localhost:8080`
- `https://localhost:8080`
- `http://localhost:8081`
- `https://localhost:8081`

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or bun

### Install Dependencies

```bash
npm install
# or
bun install
```

### Development

```bash
npm run dev
```

Starts the development server with hot-reloading at `http://localhost:5173`

### Production Build

```bash
npm run build
```

Builds for production with minification

### Linting

```bash
npm run lint
```

### Testing

```bash
npm run test        # Run tests
npm run test:watch  # Watch mode
```

---

## API Integration

The frontend communicates with the AURA Backend API at `VITE_API_BASE_URL`. All API calls are handled through a centralized service layer in `src/services/`.

### Service Modules

| Service | Purpose |
|---------|---------|
| `auth.services.ts` | Authentication (login, register, profile) |
| `trainee.service.ts` | Trainee CRUD and search |
| `employee.service.ts` | Employee management |
| `coaches.service.ts` | Coach management |
| `enrollment.services.ts` | Enrollment operations |
| `attendance.services.ts` | Attendance tracking |
| `session.services.ts` | Session management |
| `traineeGroup.services.ts` | Group management |
| `sport.services.ts` | Sport catalog |
| `branch.services.ts` | Branch management |
| `notifications.service.ts` | Notifications |
| `videoAnalysis.services.ts` | Video analysis |

> **Full API Documentation**: Available at the backend Swagger UI (`/swagger`) when the API is running

---

## Roadmap

| Priority | Feature | Description |
|----------|---------|-------------|
| **High** | Multi-Branch Support | Enhanced branch switching and isolation |
| **High** | Advanced Reporting | Charts, analytics dashboards for admins |
| **Medium** | Payment Portal | Online payment interface for trainees |
| **Medium** | PWA Support | Progressive Web App for mobile access |
| **Low** | Dark Mode | Full dark theme support |
| **Low** | Mobile Responsive Improvements | Better mobile UX |

---

## Project Structure

```
src/
├── auth/              # Authentication context and dev-login
├── components/       # Reusable UI components
│   ├── dashboard/    # Dashboard-specific components
│   ├── layout/       # Layout components (sidebar, header)
│   ├── modals/       # Modal dialogs
│   ├── navigation/   # Navigation components
│   ├── notifications/ # Notification components
│   ├── profile/     # Profile-related components
│   └── ui/          # Base UI components
├── contexts/         # React contexts (Auth, App)
├── hooks/           # Custom React hooks
├── lib/             # Utilities (API client, utils)
├── pages/           # Page components
├── services/        # API service modules
├── types/           # TypeScript type definitions
└── realtime/        # SignalR connection handling
```

---

## License

MIT License