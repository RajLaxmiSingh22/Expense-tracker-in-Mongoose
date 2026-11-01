# Expense Tracker in Mongoose

A full-stack day-to-day expense tracker built with **Node.js, Express, MongoDB (Mongoose)** and plain HTML/CSS/JavaScript.
Users can sign up, track their expenses, buy a premium membership, see a leaderboard, download reports and get AI-powered category suggestions.

## Features

- **Authentication**: sign up and log in with JWT; passwords are hashed with bcrypt.
- **Expenses**: add, list (paginated, newest first) and delete expenses.
- **Filter API**: filter expenses by category and date range, with the total amount, in a single aggregation.
- **AI category suggestion**: type a description (e.g. "petrol for car") and Google Gemini picks the category.
- **Premium membership**: payments through Cashfree (sandbox).
- **Leaderboard** (premium): top 10 users by total spending.
- **Download report** (premium): expenses exported to CSV, uploaded to Cloudinary, with download history.
- **Forgot password**: reset link by email (Nodemailer + Gmail); links expire after 1 hour.

## Tech stack

| Layer | Technology |
| --- | --- |
| Backend | Node.js, Express (ES modules) |
| Database | MongoDB with Mongoose |
| Auth | JSON Web Tokens, bcrypt |
| Payments | Cashfree |
| File storage | Cloudinary |
| Email | Nodemailer (Gmail SMTP) |
| AI | Google Gemini API |
| Frontend | HTML, CSS, JavaScript, Axios |

## Project structure

```
├── app.js              # Express app, routes, MongoDB connection
├── controller/         # Request handlers (user, expense, password)
├── middleware/auth.js  # JWT verification for protected routes
├── models/             # Mongoose schemas: User, Expense, Order, Downloaded, ForgotPasswordRequest
├── routes/             # Express routers
├── services/           # Cloudinary, Cashfree, email and Gemini AI helpers
├── templet/form.js     # HTML form for resetting the password
├── views/              # HTML pages
└── Public/             # Frontend CSS and JavaScript
```

## Getting started

### Prerequisites

- Node.js 20+
- A MongoDB **replica set** or **MongoDB Atlas** cluster (adding and deleting expenses use transactions, which a standalone MongoDB does not support)

### Setup

```bash
git clone https://github.com/RajLaxmiSingh22/Expense-tracker-in-Mongoose.git
cd Expense-tracker-in-Mongoose
npm install
cp .env.example .env   # then fill in your own values
npm start
```

Open **http://localhost:9000** in your browser.

### Environment variables

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | MongoDB connection string |
| `PORT` | Server port (default `9000`) |
| `JWT_SECRET` | Secret used to sign login tokens |
| `SALT` | bcrypt salt rounds (e.g. `10`) |
| `Cashfree_ID`, `Cashfree_Secret_Key` | Cashfree payment credentials |
| `CLOUDINARY_URL` | Cloudinary credentials for report uploads |
| `GEMINI_API_KEY` | Google Gemini key for category suggestions |
| `GEMINI_MODEL` | Optional; defaults to `gemini-3.5-flash-lite` |
| `EMAIL`, `PASSWORD` | Gmail address and App Password; if empty, reset emails are printed to the console |

## API reference

Routes marked 🔒 need the header `Authorization: Bearer <token>`.

### User (`/user`)

| Method | Route | Description |
| --- | --- | --- |
| POST | `/user/sing-in` | Create an account |
| POST | `/user/login` | Log in and receive a JWT |
| POST | `/user/protected-route` 🔒 | Get the logged-in user's details |
| POST | `/user/buy-premium` 🔒 | Create a Cashfree payment order |
| POST | `/user/update-order` 🔒 | Confirm payment and activate premium |
| GET | `/user/leader-board` 🔒 | Top 10 users by total expense |
| GET | `/user/download-history` 🔒 | Previously downloaded reports |

### Expense (`/expense`)

| Method | Route | Description |
| --- | --- | --- |
| POST | `/expense/createExpense` 🔒 | Add an expense |
| GET | `/expense/getExpenses?page=&limit=` 🔒 | Paginated expenses, newest first |
| GET | `/expense/filter?category=&from=&to=&page=&limit=` 🔒 | Filtered expenses with total amount |
| POST | `/expense/suggest-category` 🔒 | AI category suggestion from a description |
| GET | `/expense/download` 🔒 | Export expenses as CSV (Cloudinary link) |
| DELETE | `/expense/:id` 🔒 | Delete an expense |

### Password (`/password`)

| Method | Route | Description |
| --- | --- | --- |
| POST | `/password/forgot-password` | Send a reset link by email |
| GET | `/password/reset-password/:uuid` | Open the reset form |
| POST | `/password/update-password/:uuid` | Save the new password |

## Design notes

- **Transactions**: adding or deleting an expense and updating the user's `totalExpense` happen in one transaction, so both succeed or both fail.
- **Atomic updates**: `totalExpense` is changed with `$inc`, so two requests at the same time cannot overwrite each other.
- **Indexes**: `{ userId: 1, createdAt: -1 }` on expenses for fast "my latest expenses" queries, and `{ totalExpense: -1 }` on users for the leaderboard.
- **Single-query filtering**: the filter API uses `$match` + `$facet` to return a page of results and the total in one database round trip.
- **Token expiry**: password reset requests use a TTL index, so MongoDB deletes them after 1 hour; a link can only be used once.
- **Case-insensitive email**: emails are stored and searched in lowercase.
- **Safe AI output**: the Gemini answer is only accepted if it is one of the app's categories, and the API key stays on the server.
