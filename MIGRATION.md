# Migration from Nuxt/Vue to Next.js/React

This project has been successfully migrated from **Nuxt 3 + Vue 3** to **Next.js 15 + React 19**.

## What Has Been Migrated

### Core Infrastructure
- ✅ **Package Manager**: Migrated from pnpm to npm (bun installation unavailable)
- ✅ **Build Tool**: Next.js 15 with App Router
- ✅ **Framework**: React 19
- ✅ **TypeScript**: Configured for Next.js
- ✅ **Styling**: Tailwind CSS 3.4
- ✅ **Linting/Formatting**: Biome instead of ESLint/Prettier

### Application Structure
- ✅ **Root Layout**: Migrated with Header/Footer components
- ✅ **Firebase**: Client and Admin SDK configured
- ✅ **State Management**: Zustand store for user authentication
- ✅ **Navigation**: Navigation config and routing setup

### Components Migrated
- ✅ `Header` - Main navigation header with auth support
- ✅ `Footer` - Footer with links
- ✅ `AuthProvider` - Authentication state provider

### Pages Migrated
- ✅ `/` - Home page with hero section and product showcase
- ✅ `/about` - About page
- ✅ `/apps` - Applications listing page
- ✅ `/login` - Login page with email/password and Google auth

## Setup Instructions

### 1. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 2. Environment Variables
Create a \`.env.local\` file in the root directory with your Firebase credentials:

\`\`\`env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Server-side only
FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
FIREBASE_STORAGE_BUCKET=your_project.appspot.com

# Optional
OPENAI_API_KEY=your_openai_key
\`\`\`

### 3. Development
\`\`\`bash
npm run dev
\`\`\`

### 4. Build
\`\`\`bash
npm run build
npm start
\`\`\`

### 5. Linting
\`\`\`bash
npm run lint
npm run format
\`\`\`

## What Still Needs Migration

### High Priority
- **Admin Pages**: All `/admin/*` pages need to be migrated
- **Remaining Public Pages**:
  - `/contact`
  - `/privacy`
  - `/terms`
  - `/cookies`
  - `/careers`
  - `/technologies`
  - `/community`
  - `/settings`
  - `/instructions/*`
  - `/magic-link`

### Components
- **AdminChat** - Admin chat component with AI integration
- **AppDetailsEdit** - App details editor
- **AppEmails** - Email management
- **AppMediaPublisher** - Media publisher
- **AppResources** - Resources manager
- **AppReviews** - Reviews management
- **MilkdownEditor** - Markdown editor (needs React alternative)
- **Toast** - Toast notifications

### Features
- **Server Actions/API Routes**:
  - Chat API endpoints
  - Admin CRUD operations
  - File upload handling

- **State Stores**: Need to migrate remaining Pinia stores to Zustand:
  - `adminUsers`
  - `adminChat`
  - `resources`
  - `reviews`
  - `media`
  - `emails`
  - `apps`
  - `toast`

### Firebase Integration
- **Firestore**: Implement data fetching and mutations
- **Storage**: File upload/download
- **Authentication**: Complete auth flow integration

## Key Differences

### Routing
- **Before**: File-based routing with `.vue` files in `/pages`
- **After**: App Router with `page.tsx` files in `/app` folders

### State Management
- **Before**: Pinia stores
- **After**: Zustand stores

### Components
- **Before**: Vue SFCs with `<template>`, `<script>`, `<style>`
- **After**: React functional components with JSX/TSX

### Styling
- **Before**: UnoCSS with atomic CSS
- **After**: Tailwind CSS with utility classes

### Icons
- **Before**: UnoCSS icons (e.g., `i-carbon-home`)
- **After**: Unicode/emoji or icon library (need to install react-icons or similar)

## Migration Pattern

When migrating a Vue page to React:

1. **Create the folder structure**: `app/[route]/page.tsx`
2. **Convert template to JSX**: Replace Vue directives with React patterns
3. **Convert script to hooks**: Replace `ref`, `computed`, `onMounted` with React hooks
4. **Update styling**: Convert UnoCSS classes to Tailwind
5. **Replace icons**: Use appropriate React icon library
6. **Update state**: Use Zustand instead of Pinia
7. **Update navigation**: Use Next.js `Link` and `useRouter`

## Notes

- The old Nuxt files have been removed
- Firebase credentials must be set in environment variables before building
- The build will fail without proper Firebase configuration
- Biome is configured for code quality and formatting
