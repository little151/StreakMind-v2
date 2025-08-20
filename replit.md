# Overview

HabitChat is a personal habit tracking application that combines conversational AI with data visualization. Users can log their daily activities through natural language chat messages, and the system automatically parses and tracks habits like coding, gym sessions, sleep, and reading. The app provides visual dashboards with calendar heatmaps, progress charts, and a gamified points/badges system to encourage consistent habit formation.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side is built with React and TypeScript, using Vite as the build tool. The UI leverages shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling. The application follows a single-page application (SPA) pattern with wouter for client-side routing.

Key architectural decisions:
- **Component Structure**: Modular component design with separate UI components, page components, and business logic components
- **State Management**: TanStack Query for server state management, providing caching, synchronization, and optimistic updates
- **Styling System**: Tailwind CSS with CSS custom properties for theming, allowing dynamic theme switching
- **Type Safety**: Full TypeScript integration with shared types between client and server

## Backend Architecture
The server uses Express.js with TypeScript, following a RESTful API design. The application implements a layered architecture separating routing, business logic, and data access.

Key architectural decisions:
- **API Design**: RESTful endpoints organized by resource type (users, habits, messages, badges)
- **NLP Processing**: Simple pattern-matching algorithm for parsing natural language habit inputs
- **Storage Abstraction**: Interface-based storage layer allowing swapping between in-memory and database implementations
- **Middleware Pipeline**: Request logging, JSON parsing, and error handling middleware

## Data Storage Solutions
The application uses a flexible storage architecture with Drizzle ORM for database operations. Currently configured for PostgreSQL with Neon Database as the provider.

Key architectural decisions:
- **Database Choice**: PostgreSQL for robust relational data handling and JSONB support for flexible metadata
- **ORM Strategy**: Drizzle ORM for type-safe database queries and schema management
- **Schema Design**: Normalized relational structure with JSONB fields for extensible metadata
- **Migration Strategy**: Drizzle Kit for database schema migrations and version control

## Authentication and Authorization
The current implementation uses a simplified approach with session-based authentication, though the infrastructure supports expansion to more robust auth systems.

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL dialect

### Frontend Libraries
- **React**: Core UI library for component-based architecture
- **TanStack Query**: Server state management and caching
- **Radix UI**: Headless UI components for accessibility and customization
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **Wouter**: Lightweight client-side router

### Build and Development Tools
- **Vite**: Fast build tool with hot module replacement
- **TypeScript**: Static type checking and enhanced developer experience
- **ESBuild**: Fast bundling for production builds

### Utility Libraries
- **Zod**: Runtime type validation and schema definition
- **Date-fns**: Date manipulation and formatting
- **Class Variance Authority**: Utility for managing CSS class variants
- **Lucide React**: Icon library with consistent design system