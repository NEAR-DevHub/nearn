# Cron Jobs

This directory contains cron jobs that run periodically on Render.

## Structure

- `/jobs` - Individual cron job implementations
- `/lib` - Shared utilities for cron jobs
- `/types` - TypeScript types for cron jobs

## How it works

1. Each cron job is defined in `render.yaml`
2. Render hits the specified endpoint at the configured schedule
3. The endpoint executes the corresponding job

## Adding a new cron job

1. Create a new job file in `/jobs`
2. Add the API endpoint in `/app/api/cron/[job-name]/route.ts`
3. Add the cron configuration to `render.yaml`

## Security

All cron endpoints are protected by a `CRON_SECRET` environment variable to prevent unauthorized access.