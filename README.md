# Bitespeed Identity Reconciliation API

This project implements the Bitespeed Backend Task for Identity Reconciliation. It provides a REST API endpoint that handles contact information and reconciles identities across multiple records.

## Features

- REST endpoint for contact identity management
- PostgreSQL database with Prisma ORM
- Contact reconciliation algorithm
- Input validation
- Error handling
- Seeding for test data

## Tech Stack

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Copy the environment file and update it with your PostgreSQL credentials:
   ```
   cp .env.example .env
   ```
4. Set up the database:
   ```
   npx prisma migrate dev --name init
   ```
5. Generate Prisma client:
   ```
   npm run prisma:generate
   ```
6. Seed the database (optional):
   ```
   npm run prisma:seed
   ```

## Running the Application

Development mode:
```
npm run dev
```

Production mode:
```
npm run build
npm start
```

## API Documentation

### POST /identify

Identifies and reconciles contact information.

**Request Body:**
```json
{
  "email": "john@example.com",
  "phoneNumber": "9999999999"
}
```

Both fields are optional, but at least one must be provided.

**Response:**
```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["john@example.com", "john.alt@example.com"],
    "phoneNumbers": ["9999999999", "8888888888"],
    "secondaryContactIds": [2, 3]
  }
}
```

## Deployment

To deploy this application:

1. Set up a PostgreSQL database
2. Set the `DATABASE_URL` in your environment variables
3. Build the application: `npm run build`
4. Start the server: `npm start`

## Testing

Run the test suite:
```
npm test
```

## License

This project is licensed under the ISC License.