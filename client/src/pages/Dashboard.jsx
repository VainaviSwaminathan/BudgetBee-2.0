import { useEffect, useMemo, useState } from "react";
import {
    ArrowDownLeft,
    ArrowUpRight,
    Bell,
    Wallet,
    Plus,
    X,
} from "lucide-react";
import {
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
} from "recharts";
import jsPDF from "jspdf";
import { useAuth } from "../context/AuthContext";
import { getIncome } from "../services/incomeService";
import {
    getExpenses,
    addExpense,
    deleteExpense,
} from "../services/expenseService";
import { getSubscriptions } from "../services/subscriptionService";
import { getPreferences } from "../services/preferenceService";
import BottomNav from "../components/navigation/BottomNav";
import "./Dashboard.css";

const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
};

const defaultCategories = [
    "Food",
    "Travel",
    "Shopping",
    "Rent",
    "Bills",
    "Entertainment",
    "Education",
    "Health",
    "Subscriptions",
    "Other",
];

const paymentMethods = ["UPI", "Cash", "Card", "Net Banking", "Other"];

const chartColors = [
    "#f4c542",
    "#9fd8b5",
    "#a7dde0",
    "#f4a261",
    "#d8c8a4",
    "#c9d7c3",
];

const isCurrentMonth = (dateValue) => {
    if (!dateValue) return false;

    const date = new Date(dateValue);
    const now = new Date();

    return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
    );
};

const getCurrentMonthLabel = () => {
    return new Date().toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
    });
};

const Dashboard = () => {
    const { user } = useAuth();

    const [income, setIncome] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [subscriptions, setSubscriptions] = useState([]);
    const [preferences, setPreferences] = useState(null);
    const [loading, setLoading] = useState(true);

    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [expenseLoading, setExpenseLoading] = useState(false);
    const [expenseError, setExpenseError] = useState("");

    const [expenseForm, setExpenseForm] = useState({
        amount: "",
        category: "Food",
        paymentMethod: "UPI",
        date: new Date().toISOString().split("T")[0],
        notes: "",
    });

    const fetchDashboardData = async () => {
        try {
            const [incomeData, expenseData, subscriptionData, preferenceData] =
                await Promise.all([
                    getIncome(),
                    getExpenses(),
                    getSubscriptions(),
                    getPreferences().catch(() => null),
                ]);

            setIncome(incomeData || []);
            setExpenses(expenseData || []);
            setSubscriptions(subscriptionData || []);
            setPreferences(preferenceData?.preferences || null);
        } catch (error) {
            console.error("Dashboard fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const currentMonthLabel = useMemo(() => getCurrentMonthLabel(), []);

    const monthlyIncome = useMemo(() => {
        return income.filter((item) => isCurrentMonth(item.date || item.createdAt));
    }, [income]);

    const monthlyExpenses = useMemo(() => {
        return expenses.filter((item) => isCurrentMonth(item.date || item.createdAt));
    }, [expenses]);

    const monthlySubscriptions = useMemo(() => {
        return subscriptions.filter((item) =>
            isCurrentMonth(item.renewalDate || item.createdAt)
        );
    }, [subscriptions]);

    const categories =
        preferences?.spendingCategories?.length > 0
            ? preferences.spendingCategories.filter((item) => item !== "Savings")
            : defaultCategories;

    const handleExpenseChange = (e) => {
        const { name, value } = e.target;

        setExpenseForm((prev) => ({
            ...prev,
            [name]: value,
        }));

        setExpenseError("");
    };

    const openExpenseModal = () => {
        setExpenseForm({
            amount: "",
            category: categories[0] || "Food",
            paymentMethod: "UPI",
            date: new Date().toISOString().split("T")[0],
            notes: "",
        });
        setExpenseError("");
        setIsExpenseModalOpen(true);
    };

    const closeExpenseModal = () => {
        if (!expenseLoading) {
            setIsExpenseModalOpen(false);
            setExpenseError("");
        }
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();

        if (!expenseForm.amount || Number(expenseForm.amount) <= 0) {
            setExpenseError("Please enter a valid expense amount.");
            return;
        }

        if (!expenseForm.category) {
            setExpenseError("Please select an expense category.");
            return;
        }

        const payload = {
            amount: Number(expenseForm.amount),
            category: expenseForm.category,
            paymentMethod: expenseForm.paymentMethod,
            date: expenseForm.date,
            notes: expenseForm.notes,
        };

        try {
            setExpenseLoading(true);
            setExpenseError("");

            const data = await addExpense(payload);

            setExpenses((prev) => [data.expense, ...prev]);
            setIsExpenseModalOpen(false);
        } catch (err) {
            setExpenseError(
                err.response?.data?.message || "Could not add expense. Please try again."
            );
        } finally {
            setExpenseLoading(false);
        }
    };

    const handleDeleteExpense = async (expenseId) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this expense?"
        );

        if (!confirmDelete) return;

        try {
            await deleteExpense(expenseId);

            setExpenses((prev) =>
                prev.filter((expense) => expense._id !== expenseId)
            );
        } catch (err) {
            console.error("Delete expense error:", err);
            alert("Could not delete expense. Please try again.");
        }
    };

    const totals = useMemo(() => {
        const loggedIncomeTotal = monthlyIncome.reduce(
            (sum, item) => sum + Number(item.amount || 0),
            0
        );

        const preferenceMonthlyIncome = Number(preferences?.monthlyIncome || 0);

        const totalIncome =
            loggedIncomeTotal > 0 ? loggedIncomeTotal : preferenceMonthlyIncome;

        const totalExpenses = monthlyExpenses.reduce(
            (sum, item) => sum + Number(item.amount || 0),
            0
        );

        const totalSubscriptions = monthlySubscriptions.reduce(
            (sum, item) => sum + Number(item.amount || 0),
            0
        );

        const totalOutflow = totalExpenses + totalSubscriptions;
        const balance = totalIncome - totalOutflow;
        const monthlyBudget = Number(preferences?.monthlyBudget || 0);
        const budgetRemaining = monthlyBudget - totalOutflow;

        return {
            totalIncome,
            totalExpenses,
            totalSubscriptions,
            totalOutflow,
            balance,
            budgetRemaining,
        };
    }, [monthlyIncome, monthlyExpenses, monthlySubscriptions, preferences]);

    const budgetUsedPercent = useMemo(() => {
        const budget = Number(preferences?.monthlyBudget || 0);

        if (!budget) return 0;

        return Math.min(Math.round((totals.totalOutflow / budget) * 100), 100);
    }, [preferences, totals.totalOutflow]);

    const recentActivity = useMemo(() => {
        const expenseItems = monthlyExpenses.map((item) => ({
            id: item._id,
            title: item.category,
            subtitle: item.notes || "Expense",
            amount: item.amount,
            type: "expense",
            date: item.date || item.createdAt,
        }));

        const subscriptionItems = monthlySubscriptions.map((item) => ({
            id: item._id,
            title: item.name,
            subtitle: "Subscription",
            amount: item.amount,
            type: "subscription",
            date: item.renewalDate || item.createdAt,
        }));

        return [...expenseItems, ...subscriptionItems]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 3);
    }, [monthlyExpenses, monthlySubscriptions]);

    const categorySpending = useMemo(() => {
        const categoryTotals = monthlyExpenses.reduce((acc, item) => {
            const category = item.category || "Other";
            acc[category] = (acc[category] || 0) + Number(item.amount || 0);
            return acc;
        }, {});

        return Object.entries(categoryTotals)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [monthlyExpenses]);

    const budgetTone =
        budgetUsedPercent >= 90
            ? "danger"
            : budgetUsedPercent >= Number(preferences?.budgetAlertLimit || 75)
                ? "alert"
                : budgetUsedPercent >= 50
                    ? "warning"
                    : "safe";

    const budgetInsight = useMemo(() => {
        const alertLimit = Number(preferences?.budgetAlertLimit || 75);
        const topCategory = categorySpending[0];

        if (!preferences?.monthlyBudget) {
            return {
                tone: "safe",
                title: "Budget setup needed.",
                message:
                    "Complete your preferences to unlock personalized BudgetBee insights.",
            };
        }

        if (totals.totalOutflow === 0) {
            return {
                tone: "safe",
                title: "Fresh start.",
                message:
                    "No spending logged yet. Your budget is untouched and ready for the month.",
            };
        }

        if (budgetUsedPercent < 50) {
            return {
                tone: "safe",
                title: "Looking steady.",
                message: topCategory
                    ? `Your top spend is ${topCategory.name} at ${formatCurrency(
                        topCategory.value
                    )}, but you're still comfortably within budget.`
                    : "You are safely within your monthly budget.",
            };
        }

        if (budgetUsedPercent < alertLimit) {
            return {
                tone: "warning",
                title: "Budget check-in.",
                message: topCategory
                    ? `${topCategory.name} is taking the lead at ${formatCurrency(
                        topCategory.value
                    )}. Keep an eye on it before it quietly steals the spotlight.`
                    : `You have used ${budgetUsedPercent}% of your monthly budget. Still manageable, but worth watching.`,
            };
        }

        if (budgetUsedPercent < 90) {
            return {
                tone: "alert",
                title: "Slow the spending buzz.",
                message: topCategory
                    ? `Time to channel your inner planner. ${topCategory.name} spending is at ${formatCurrency(
                        topCategory.value
                    )}, and you've used ${budgetUsedPercent}% of your budget.`
                    : `You've used ${budgetUsedPercent}% of your budget. Time to pause and plan the next few spends.`,
            };
        }

        return {
            tone: "danger",
            title: "High budget alert.",
            message: topCategory
                ? `Time to channel your inner chef, deal-hunter, or homebody. ${topCategory.name} is your biggest spend at ${formatCurrency(
                    topCategory.value
                )}, and your budget is almost maxed.`
                : `You've used ${budgetUsedPercent}% of your budget. This is the final stretch, spend carefully.`,
        };
    }, [preferences, budgetUsedPercent, categorySpending, totals.totalOutflow]);

    const handleDownloadInsights = () => {
        const doc = new jsPDF();

        const generatedDate = new Date().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });

        const topCategory = categorySpending[0];

        const budgetStatus =
            budgetUsedPercent >= 90
                ? "High Risk"
                : budgetUsedPercent >= Number(preferences?.budgetAlertLimit || 75)
                    ? "Alert Zone"
                    : budgetUsedPercent >= 50
                        ? "Watch Zone"
                        : "Healthy";

        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(32, 33, 36);
        doc.text("BudgetBee", 20, 22);

        doc.setFontSize(14);
        doc.setTextColor(120, 120, 120);
        doc.text("Monthly Insights Report", 20, 32);

        doc.setDrawColor(244, 197, 66);
        doc.setLineWidth(1);
        doc.line(20, 38, 190, 38);

        doc.setTextColor(32, 33, 36);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);

        let y = 52;

        doc.text(`Generated on: ${generatedDate}`, 20, y);
        y += 8;
        doc.text(`Month: ${currentMonthLabel}`, 20, y);
        y += 8;
        doc.text(`User: ${user?.name || "BudgetBee User"}`, 20, y);
        y += 8;
        doc.text(`Email: ${user?.email || "Not available"}`, 20, y);

        y += 16;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(15);
        doc.text("Financial Summary", 20, y);

        y += 10;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);

        const summaryRows = [
            ["Monthly Income", formatCurrency(totals.totalIncome)],
            ["Monthly Budget", formatCurrency(preferences?.monthlyBudget)],
            ["Total Expenses", formatCurrency(totals.totalExpenses)],
            ["Subscription Renewals", formatCurrency(totals.totalSubscriptions)],
            ["Total Spent", formatCurrency(totals.totalOutflow)],
            ["Budget Remaining", formatCurrency(totals.budgetRemaining)],
            ["Budget Used", `${budgetUsedPercent}%`],
            ["Budget Status", budgetStatus],
        ];

        summaryRows.forEach(([label, value]) => {
            doc.setFont("helvetica", "bold");
            doc.text(`${label}:`, 20, y);

            doc.setFont("helvetica", "normal");
            doc.text(String(value), 82, y);

            y += 8;
        });

        y += 8;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(15);
        doc.text("Spending Insights", 20, y);

        y += 10;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);

        const topCategoryText = topCategory
            ? `${topCategory.name} - ${formatCurrency(topCategory.value)}`
            : "No expenses logged this month";

        doc.text(`Top Spending Category: ${topCategoryText}`, 20, y);

        y += 10;

        doc.setFont("helvetica", "bold");
        doc.text("BudgetBee Insight:", 20, y);

        y += 8;

        doc.setFont("helvetica", "normal");

        const insightText = `${budgetInsight.title} ${budgetInsight.message}`;
        const splitInsight = doc.splitTextToSize(insightText, 170);
        doc.text(splitInsight, 20, y);

        y += splitInsight.length * 7 + 8;

        if (categorySpending.length > 0) {
            doc.setFont("helvetica", "bold");
            doc.text("Category Breakdown:", 20, y);

            y += 8;

            doc.setFont("helvetica", "normal");

            categorySpending.slice(0, 6).forEach((item) => {
                doc.text(`${item.name}: ${formatCurrency(item.value)}`, 25, y);
                y += 7;
            });
        }

        doc.setFontSize(10);
        doc.setTextColor(120, 120, 120);
        doc.text(
            "This report is generated from your BudgetBee monthly dashboard data.",
            20,
            285
        );

        doc.save(`BudgetBee-${currentMonthLabel}-Insights.pdf`);
    };

    if (loading) {
        return <div className="dashboard-loading">Loading BudgetBee...</div>;
    }

    return (
        <main className="dashboard-page">
            <section className="dashboard-shell">
                <div className="dashboard-content">
                    <div className="dashboard-top">
                        <div className="dashboard-brand">
                            <div className="dashboard-logo">B</div>
                            <div>
                                <h3>BudgetBee</h3>
                                <span>{currentMonthLabel}</span>
                            </div>
                        </div>
                        <div className="dashboard-month-pill">{currentMonthLabel}</div>
                    </div>

                    <section className="dashboard-greeting">
                        <p>Welcome back, {user?.name || "there"}</p>
                        <h1>This month’s money overview</h1>
                    </section>

                    <section className="balance-card">
                        <span>Budget remaining</span>
                        <h2>{formatCurrency(totals.budgetRemaining)}</h2>
                        <p>
                            Your monthly budget minus this month’s expenses and renewals.
                        </p>
                    </section>

                    <section className="quick-actions">
                        <button className="quick-action-btn primary" onClick={openExpenseModal}>
                            <Plus size={17} />
                            Add expense
                        </button>

                        <button
                            className="quick-action-btn secondary"
                            onClick={handleDownloadInsights}
                        >
                            Download insights
                        </button>
                    </section>

                    <section className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon income">
                                <ArrowDownLeft size={17} />
                            </div>
                            <span>Income</span>
                            <h3>{formatCurrency(totals.totalIncome)}</h3>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon expense">
                                <ArrowUpRight size={17} />
                            </div>
                            <span>Expenses</span>
                            <h3>{formatCurrency(totals.totalExpenses)}</h3>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon subscription">
                                <Bell size={17} />
                            </div>
                            <span>Subs</span>
                            <h3>{formatCurrency(totals.totalSubscriptions)}</h3>
                        </div>
                    </section>

                    <section className="section-card">
                        <div className="section-card-header">
                            <h3>Monthly budget</h3>
                            <small>{budgetUsedPercent}% used</small>
                        </div>

                        <div className="progress-track">
                            <div
                                className={`progress-fill ${budgetTone}`}
                                style={{ width: `${budgetUsedPercent}%` }}
                            />
                        </div>

                        <div className="budget-row">
                            <span>Spent {formatCurrency(totals.totalOutflow)}</span>
                            <span>Budget {formatCurrency(preferences?.monthlyBudget)}</span>
                        </div>
                    </section>

                    <section className={`insight-card ${budgetInsight.tone}`}>
                        <div className="insight-icon">
                            <Wallet size={18} />
                        </div>
                        <p>
                            <strong>{budgetInsight.title}</strong> {budgetInsight.message}
                        </p>
                    </section>

                    <section className="section-card">
                        <div className="section-card-header">
                            <h3>Savings setup</h3>
                            <small>{formatCurrency(preferences?.emergencyFund)}</small>
                        </div>

                        <p className="empty-text">
                            Emergency fund allocation:{" "}
                            <strong>{formatCurrency(preferences?.emergencyFund)}</strong>
                            <br />
                            Goal:{" "}
                            <strong>
                                {preferences?.savingsGoalName || "No savings goal added"}
                            </strong>{" "}
                            {preferences?.savingsGoalAmount
                                ? `· ${formatCurrency(preferences.savingsGoalAmount)}`
                                : ""}
                        </p>
                    </section>

                    <section className="section-card">
                        <div className="section-card-header">
                            <h3>Recent activity</h3>
                            <small>{recentActivity.length} items</small>
                        </div>

                        {recentActivity.length > 0 ? (
                            <div className="recent-list">
                                {recentActivity.map((item) => (
                                    <div className="recent-item" key={`${item.type}-${item.id}`}>
                                        <div className="recent-left">
                                            <div className="recent-dot">
                                                {item.type === "subscription" ? "S" : "E"}
                                            </div>
                                            <div>
                                                <h4>{item.title}</h4>
                                                <span>{item.subtitle}</span>
                                            </div>
                                        </div>

                                        <div className="recent-actions">
                                            <div className="recent-amount">
                                                -{formatCurrency(item.amount)}
                                            </div>

                                            {item.type === "expense" && (
                                                <button
                                                    type="button"
                                                    className="recent-delete-btn"
                                                    onClick={() => handleDeleteExpense(item.id)}
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="empty-text">
                                No expenses or subscriptions yet. Once added, your latest
                                activity will appear here.
                            </p>
                        )}
                    </section>

                    <section className="section-card spending-chart-card">
                        <div className="section-card-header">
                            <h3>Category spending</h3>
                            <small>{categorySpending.length} categories</small>
                        </div>

                        {categorySpending.length > 0 ? (
                            <>
                                <div className="chart-wrap">
                                    <ResponsiveContainer width="100%" height={190}>
                                        <PieChart>
                                            <Pie
                                                data={categorySpending}
                                                dataKey="value"
                                                nameKey="name"
                                                innerRadius={52}
                                                outerRadius={78}
                                                paddingAngle={3}
                                            >
                                                {categorySpending.map((entry, index) => (
                                                    <Cell
                                                        key={entry.name}
                                                        fill={chartColors[index % chartColors.length]}
                                                    />
                                                ))}
                                            </Pie>

                                            <Tooltip
                                                formatter={(value) => formatCurrency(value)}
                                                contentStyle={{
                                                    borderRadius: "14px",
                                                    border: "1px solid var(--border)",
                                                    fontSize: "12px",
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="chart-legend">
                                    {categorySpending.slice(0, 5).map((item, index) => (
                                        <div className="legend-row" key={item.name}>
                                            <div className="legend-left">
                                                <span
                                                    className="legend-dot"
                                                    style={{
                                                        background: chartColors[index % chartColors.length],
                                                    }}
                                                />
                                                <span>{item.name}</span>
                                            </div>

                                            <strong>{formatCurrency(item.value)}</strong>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <p className="empty-text">
                                Add expenses to see how your spending is distributed across
                                categories.
                            </p>
                        )}
                    </section>

                    <BottomNav />
                </div>
            </section>

            {isExpenseModalOpen && (
                <div className="modal-backdrop" onClick={closeExpenseModal}>
                    <div className="expense-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <span>Add new</span>
                                <h3>Expense</h3>
                            </div>

                            <button className="modal-close-btn" onClick={closeExpenseModal}>
                                <X size={18} />
                            </button>
                        </div>

                        {expenseError && <div className="modal-error">{expenseError}</div>}

                        <form className="expense-form" onSubmit={handleAddExpense}>
                            <div className="expense-field">
                                <label>Amount</label>
                                <input
                                    type="number"
                                    name="amount"
                                    value={expenseForm.amount}
                                    onChange={handleExpenseChange}
                                    min="1"
                                    required
                                    placeholder="250"
                                />
                            </div>

                            <div className="expense-field">
                                <label>Category</label>
                                <select
                                    name="category"
                                    value={expenseForm.category}
                                    onChange={handleExpenseChange}
                                    required
                                >
                                    {categories.map((category) => (
                                        <option value={category} key={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="expense-field">
                                <label>Payment method</label>
                                <select
                                    name="paymentMethod"
                                    value={expenseForm.paymentMethod}
                                    onChange={handleExpenseChange}
                                >
                                    {paymentMethods.map((method) => (
                                        <option value={method} key={method}>
                                            {method}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="expense-field">
                                <label>Date</label>
                                <input
                                    type="date"
                                    name="date"
                                    value={expenseForm.date}
                                    onChange={handleExpenseChange}
                                />
                            </div>

                            <div className="expense-field full">
                                <label>Notes</label>
                                <textarea
                                    name="notes"
                                    value={expenseForm.notes}
                                    onChange={handleExpenseChange}
                                    placeholder="Lunch, auto ride, groceries..."
                                    rows="3"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={expenseLoading}
                                className="modal-submit-btn"
                            >
                                {expenseLoading ? "Saving expense..." : "Save expense"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
};

export default Dashboard;