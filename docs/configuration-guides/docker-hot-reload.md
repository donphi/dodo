# Docker Hot Reload Configuration

This document explains how to use the hot reloading feature for the Next.js frontend in Docker, how to switch between development and production modes for Vercel deployment, and how to ensure TypeScript strict mode checking.

## Overview

The Docker configuration has been updated to support two modes:

1. **Development Mode** (default): Enables hot reloading for real-time updates during development with TypeScript strict mode checking
2. **Production Mode**: Optimized for production deployment, similar to Vercel's environment

## How Hot Reloading Works

In development mode, the Docker setup:

1. Mounts the local `frontend` directory into the container
2. Runs Next.js in development mode (`npm run dev`)
3. Automatically reflects changes to components, pages, and other files without restarting the container

This allows you to edit files on your host machine and see the changes immediately in the browser.

## Configuration Details

### Dockerfile.frontend

The Dockerfile now includes multiple stages:

- **development**: Optimized for development with hot reloading
- **builder**: Builds the Next.js application for production
- **production**: Runs the built application in production mode

### docker-compose.yaml

The docker-compose file has been updated to:

- Use the appropriate Dockerfile stage based on the `FRONTEND_TARGET` environment variable
- Mount the frontend directory as a volume in development mode
- Preserve node_modules inside the container

## Usage

### Development Mode (with Hot Reloading and TypeScript Strict Mode)

This is the default mode. Simply run:

```bash
docker-compose up
```

This will:
1. Run TypeScript type checking with strict mode enabled
2. Start the Next.js development server with hot reloading

Any changes you make to files in the `frontend` directory will be immediately reflected in the running application, and TypeScript errors will be reported before the server starts.

### Production Mode

To run in production mode (similar to Vercel deployment):

```bash
FRONTEND_TARGET=production docker-compose up
```

This will:
1. Run TypeScript type checking with strict mode enabled
2. Build the application for production
3. Run it in a way that mimics the Vercel environment

The production build process ensures type safety by running the TypeScript compiler in strict mode before building the application.

## Switching Between Modes

You can easily switch between development and production modes by setting the `FRONTEND_TARGET` environment variable:

- For development with hot reloading: `FRONTEND_TARGET=development` (or omit, as it's the default)
- For production build: `FRONTEND_TARGET=production`

## Vercel Deployment Considerations

When deploying to Vercel:

1. The Docker production mode closely mimics Vercel's environment
2. Testing in production mode locally helps ensure a smooth deployment to Vercel
3. Vercel's build process is similar to our Docker production build stage

## Troubleshooting

### Hot Reloading Not Working

If changes aren't reflecting immediately:

1. Ensure you're running in development mode (`FRONTEND_TARGET` is not set to "production")
2. Check that the volume mounting is working correctly
3. Some types of changes may require a manual refresh in the browser

### TypeScript Errors

If you encounter TypeScript errors when starting the container:

1. The TypeScript compiler is running in strict mode and has detected type issues
2. Fix the reported errors in your code
3. The development server will start once all TypeScript errors are resolved

### Node Modules Issues

If you encounter issues with node modules:

1. The configuration prevents the container's node_modules from being overwritten
2. If you update package.json, you may need to rebuild the container: `docker-compose build frontend`

## Best Practices

1. Use development mode for active development to take advantage of hot reloading and TypeScript strict checking
2. Test in production mode before deploying to Vercel to catch any environment-specific issues
3. Keep your local npm dependencies in sync with the container's dependencies
4. Leverage TypeScript strict mode to catch type errors early in the development process

## TypeScript Strict Mode

The project is configured to use TypeScript's strict mode, which enforces:

1. Strict null checks
2. Strict function types
3. Strict property initialization
4. No implicit any
5. No implicit this

This helps catch common errors during development and ensures type safety throughout the codebase.