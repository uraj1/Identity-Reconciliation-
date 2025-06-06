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
   ```bash
   git clone https://github.com/your-username/bitespeed-identity-reconciliation.git
   cd bitespeed-identity-reconciliation
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment file and update it with your PostgreSQL credentials:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your database credentials:
   ```
   DATABASE_URL="postgresql://postgres:<your-password>@localhost:5432/biteSpeed?schema=public"
   PORT=3000
   NODE_ENV=development
   ```

5. Set up the database with migration:
   ```bash
   npx prisma migrate dev --name init
   ```

6. Generate the Prisma client:
   ```bash
   npm run prisma:generate
   ```

7. Seed the database with sample data (optional):
   ```bash
   npm run prisma:seed
   ```

## Running the Application

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

## API Documentation

### 🔹 POST /identify

This endpoint is used to **reconcile contact identity** using provided email and/or phone number. It links similar contact records under a single primary contact and returns a unified view.

---

### ✅ Request Format

- **Method**: `POST`
- **Endpoint**: `/identify`
- **Headers**:
  ```
  Content-Type: application/json
  ```
- **Body (JSON)**:

```json
{
  "email": "john@example.com",
  "phoneNumber": "9999999999"
}
```

> You must provide at least one of `email` or `phoneNumber`.

---

### 📦 Response Format

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

- `primaryContactId`: The root contact ID that all related contacts are linked under.
- `emails`: All associated emails.
- `phoneNumbers`: All associated phone numbers.
- `secondaryContactIds`: IDs of related contacts that were linked to the primary.

---

## 🧪 How to Test the API

### ▶️ Using Postman

1. Open **Postman**
2. Create a new request:
   - **Method**: `POST`
   - **URL**: `http://localhost:3000/identify`
3. Go to the **Headers** tab and set:
   ```
   Key: Content-Type
   Value: application/json
   ```
4. Go to the **Body** tab:
   - Select **raw**
   - Choose **JSON** from dropdown
   - Enter body:

```json
{
  "email": "john@example.com",
  "phoneNumber": "9999999999"
}
```

5. Click **Send**

### ▶️ Using cURL

```bash
curl -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "phoneNumber": "9999999999"}'
```

---

### 🔄 Test Scenarios

| Scenario | Input | Expected Behavior |
|---------|-------|--------------------|
| Existing email, new phone | Same email with new phone | Phone gets linked to existing contact |
| Existing phone, new email | Same phone with new email | Email gets linked to existing contact |
| Both new | New email and phone | Creates a new primary contact |
| Both existing but in different records | Already stored but in separate contacts | They get linked under one primary |

---

## Deployment

To deploy this application:

1. Set up a PostgreSQL database on your production server
2. Set the `DATABASE_URL` in your production `.env` file
3. Build the application:
   ```bash
   npm run build
   ```
4. Start the server:
   ```bash
   npm start
   ```

---

## Testing

Run the test suite:
```bash
npm test
```

---

## License

This project is licensed under the ISC License.

---

## Contributing

Feel free to open issues or PRs to improve the reconciliation logic or database structure. Contributions are welcome!
