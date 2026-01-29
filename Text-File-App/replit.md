# CyberAnt Defense - ACO Threat Simulation

## Overview

This is a React-based web application that visually demonstrates Ant Colony Optimization (ACO) applied to cybersecurity threat detection. The simulation models a computer network as a graph where nodes represent computers/servers and edges represent network connections. Virtual "ants" act as security agents that respond to local anomalies, with pheromones representing threat confidence levels. The application includes real-time parameter adjustment, preset management, and an interactive HTML5 Canvas visualization.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with custom build script for production
- **Routing**: Wouter (lightweight React router)
- **State Management**: React hooks + TanStack React Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom cyberpunk/dashboard theme
- **Visualization**: HTML5 Canvas for real-time ACO simulation rendering
- **Graph Layout**: d3-force for physics-based network node positioning

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **API Pattern**: REST endpoints under `/api/*`
- **Development**: Vite middleware for HMR during development
- **Production**: Static file serving from built assets

### Data Storage
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with drizzle-zod for schema validation
- **Schema Location**: `shared/schema.ts` (shared between client and server)
- **Migrations**: Drizzle Kit with `db:push` command

### Key Design Patterns
1. **Shared Schema**: Database types and validation schemas are defined once in `shared/` and used by both frontend and backend
2. **API Route Contracts**: `shared/routes.ts` defines API contracts with Zod schemas for type-safe requests/responses
3. **Simulation Engine**: Client-side ACO logic in `client/src/lib/acoLogic.ts` runs entirely in the browser
4. **Network Generation**: D3-force generates graph layouts for the simulation canvas

### Project Structure
```
├── client/           # React frontend
│   ├── src/
│   │   ├── components/   # UI components + shadcn/ui
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # ACO logic, network generator, utilities
│   │   └── pages/        # Route components
├── server/           # Express backend
│   ├── db.ts         # Database connection
│   ├── routes.ts     # API route handlers
│   └── storage.ts    # Data access layer
├── shared/           # Shared types and schemas
│   ├── schema.ts     # Drizzle database schema
│   └── routes.ts     # API contract definitions
└── migrations/       # Database migrations
```

## External Dependencies

### Database
- **PostgreSQL**: Primary data store for simulation presets
- **Connection**: Via `DATABASE_URL` environment variable
- **Session Store**: connect-pg-simple for Express sessions

### Frontend Libraries
- **d3-force**: Physics simulation for network graph layout
- **d3-scale**: Color scales for pheromone visualization
- **@tanstack/react-query**: Server state management and caching
- **Radix UI**: Accessible component primitives (dialog, slider, tabs, etc.)
- **class-variance-authority**: Component variant styling
- **wouter**: Lightweight routing

### Build Tools
- **Vite**: Frontend bundling with React plugin
- **esbuild**: Server bundling for production
- **Drizzle Kit**: Database schema management

### Development Tools
- **@replit/vite-plugin-runtime-error-modal**: Error overlay for development
- **@replit/vite-plugin-cartographer**: Replit-specific development tools