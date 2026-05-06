const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

app.use(
    cors({
        origin: "http://localhost:5174",
        credentials: true,
    })
);

app.use(express.json());

app.get("/", (req, res) => {
    res.send("BudgetBee 2.0 API is running");
});

// Auth routes
app.use("/api/auth", require("./routes/authRoutes"));

// Income routes
app.use("/api/income", require("./routes/incomeRoutes"));

// Expense routes
app.use("/api/expenses", require("./routes/expenseRoutes"));

// Subscription routes
app.use("/api/subscriptions", require("./routes/subscriptionRoutes"));

// Preference routes
app.use("/api/preferences", require("./routes/preferenceRoutes"));

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});