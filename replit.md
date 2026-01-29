# CyberAnt Defense - ACO Threat Simulation

## Overview

CyberAnt Defense is an educational React-based web application that visually demonstrates Ant Colony Optimization (ACO) applied to cybersecurity threat detection. The simulation models a computer network as a 2D graph where nodes represent files/computers, edges represent network connections, and virtual "ants" represent security agents that detect and respond to malware threats through collective behavior and pheromone-based communication.

The application runs entirely client-side for the simulation logic, with a backend that handles preset storage for saving/loading simulation configurations.

## Recent Changes (January 2026)

- Fixed dashboard layout with proper left/right split and scrollable right panel
- Removed Integrity and Live Efficiency stat boxes from the top stats row
- Made simulation canvas fully visible with legend placed below
- Improved node spatial distribution with minimum distance constraints
- Added end-of-cycle analytics showing total infections, threats neutralized, and efficiency formula

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with custom esbuild production bundling
- **Routing**: Wouter (lightweight React router)
- **State Management**: React hooks for local state, TanStack React Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom cyberpunk/dashboard theme using CSS variables
- **Visualization**: HTML5 Canvas for real-time ACO simulation rendering
- **Graph Layout**: d3-force for physics-based network node positioning

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript using ESM modules
- **API Pattern**: REST endpoints under `/api/*` with Zod schema validation
- **Development**: Vite middleware integration for HMR
- **Production**: Static file serving from `dist/public`

### Data Storage
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with drizzle-zod for automatic schema-to-validation conversion
- **Schema Location**: `shared/schema.ts` defines simulation_presets table
- **Migrations**: Drizzle Kit with `db:push` command for schema synchronization

### Key Design Patterns
1. **Shared Schema**: Database types and Zod validation schemas defined once in `shared/` directory, imported by both frontend and backend for type safety
2. **API Route Contracts**: `shared/routes.ts` defines API endpoints with request/response schemas
3. **Client-Side Simulation**: All ACO logic runs in the browser via `client/src/lib/acoLogic.ts` - no server computation needed
4. **Canvas Rendering**: Real-time visualization with configurable display of pheromone trails, ant agents, and infection waves

### Project Structure
```
├── client/               # React frontend
│   ├── src/
│   │   ├── components/   # UI components + shadcn/ui primitives
│   │   ├── hooks/        # Custom React hooks (presets, toast, mobile)
│   │   ├── lib/          # ACO simulation logic, network generator, utilities
│   │   └── pages/        # Route page components (Dashboard, 404)
├── server/               # Express backend
│   ├── routes.ts         # API endpoint handlers
│   ├── storage.ts        # Database access layer
│   └── db.ts             # Drizzle/PostgreSQL connection
├── shared/               # Shared between client and server
│   ├── schema.ts         # Drizzle table definitions
│   └── routes.ts         # API contract definitions
└── script/               # Build tooling
```

## External Dependencies

### Database
- **PostgreSQL**: Primary data store for simulation presets
- **Connection**: Via `DATABASE_URL` environment variable
- **Session Storage**: connect-pg-simple for Express sessions

### Key Frontend Libraries
- **@tanstack/react-query**: Server state management and caching
- **d3-force / d3-scale**: Graph layout physics and color scaling
- **Radix UI**: Accessible primitive components (dialog, tabs, slider, etc.)
- **Tailwind CSS**: Utility-first styling with custom cyberpunk theme

### Build & Development
- **Vite**: Development server with HMR
- **esbuild**: Production bundling for server code
- **Drizzle Kit**: Database schema management