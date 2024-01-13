# HonosJS + Supabase Auth

## Built With
- Node.js
- PNPM
- TypeScript
- Supabase
- Drizzle
- Zod
- Vitest
- Biome
- Sentry

## Getting Started

## Installation

Run:
`pnpm install` 

After install all packages, copy the `.env.example` file and rename it to `.env`. Fill in the necessary environment variables.

## Supabase
Create a project in Supabase and put your envs into `.env`: 

- DATABASE_URL
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE

## Sentry
Create a project in Sentry and put your envs into `.env`: 

- SENTRY_DSN


## Database Setup
Run the migration script to set up the database. This can be done by running the migrate script in src/libs/database/migrate.ts.

### start
The server will start and listen on the port specified in your .env file.

## Testing
To run the tests, use the test script in the package.json file:


## Contributing
Provide instructions on how to contribute to your project.

