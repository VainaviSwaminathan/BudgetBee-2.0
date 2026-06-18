# 🐝 BudgetBee

BudgetBee is a full-stack personal finance and expense tracking application designed to help users manage their money, track spending habits, monitor subscriptions, and improve financial literacy through an intuitive and engaging interface.

---

## ✨ Features

### 🔐 Authentication
- User Signup & Login
- JWT-based Authentication
- Secure user sessions

### 💰 Budget Management
- Set monthly budget
- Track remaining budget
- Budget overview dashboard

### 📝 Expense Tracking
- Add expenses with categories
- View recent transactions
- Delete expenses
- Expense history management

### 📊 Reports & Insights
- Spending breakdown by category
- Interactive charts and visualizations
- Monthly spending analysis

### 📺 Subscription Tracker
- Add recurring subscriptions
- Enable/disable subscriptions
- Subscription costs automatically included in budget calculations
- Persistent storage using MongoDB

### 🎓 Financial Literacy Course
- Beginner-friendly money management lessons
- Course progress tracking
- Progress saved across sessions

### 👤 Account Management
- View profile information
- Edit account details
- Manage personal preferences

---

## 🛠️ Tech Stack

### Frontend
- React
- Vite
- React Router
- CSS3
- Axios

### Backend
- Node.js
- Express.js
- JWT Authentication

### Database
- MongoDB
- Mongoose

### Development Tools
- Git & GitHub
- Postman
- MongoDB Compass

---

## 📂 Project Structure

```text
BudgetBee/
│
├── client/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── assets/
│   │   └── App.jsx
│   │
│   └── package.json
│
├── server/
│   ├── models/
│   ├── routes/
│   ├── db.js
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Clone Repository

```bash
git clone https://github.com/yourusername/budgetbee.git
cd budgetbee
```

---

### Backend Setup

```bash
cd server
npm install
```

Create a `.env` file:

```env
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/budgetbee
JWT_SECRET=your_secret_key
```

Run backend:

```bash
node server.js
```

---

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

Backend runs on:

```text
http://localhost:5001
```

---

## 📸 Screens

- Login & Signup
- Dashboard
- Expense Tracking
- Reports
- Subscription Manager
- Financial Literacy Courses
- Account Settings

---

## 🎯 Future Improvements

- AI-powered spending insights
- Expense prediction system
- Savings goal tracking
- Recurring expense automation
- Notification system
- Export reports as PDF

---

## 👩‍💻 Team

Developed as a full-stack finance management project using React, Node.js, Express, and MongoDB.

---

## 📄 License

This project is intended for educational and portfolio purposes.
