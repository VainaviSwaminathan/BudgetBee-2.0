import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { savePreferences } from "../services/preferenceService";
import "./Onboarding.css";

const categories = [
    "Food",
    "Travel",
    "Shopping",
    "Rent",
    "Bills",
    "Entertainment",
    "Education",
    "Health",
    "Subscriptions",
    "Savings",
    "Other",
];

const Onboarding = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        monthlyIncome: "",
        monthlyBudget: "",
        emergencyFund: "",
        savingsGoalName: "",
        savingsGoalAmount: "",
        budgetAlertLimit: "75",
    });

    const [selectedCategories, setSelectedCategories] = useState([
        "Food",
        "Travel",
        "Shopping",
    ]);

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setError("");
    };

    const toggleCategory = (category) => {
        setSelectedCategories((prev) => {
            if (prev.includes(category)) {
                return prev.filter((item) => item !== category);
            }

            return [...prev, category];
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.monthlyIncome || !formData.monthlyBudget) {
            setError("Monthly income and monthly budget are required.");
            return;
        }

        if (selectedCategories.length === 0) {
            setError("Please select at least one spending category.");
            return;
        }

        const payload = {
            monthlyIncome: Number(formData.monthlyIncome),
            monthlyBudget: Number(formData.monthlyBudget),
            emergencyFund: Number(formData.emergencyFund || 0),
            spendingCategories: selectedCategories,
            savingsGoalName: formData.savingsGoalName,
            savingsGoalAmount: Number(formData.savingsGoalAmount || 0),
            budgetAlertLimit: Number(formData.budgetAlertLimit || 75),
        };

        try {
            setLoading(true);
            setError("");

            await savePreferences(payload);

            navigate("/dashboard");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Could not save preferences. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="onboarding-page">
            <section className="onboarding-shell">
                <header className="onboarding-header">
                    <div className="onboarding-top">
                        <div className="onboarding-brand">
                            <div className="onboarding-logo">B</div>
                            <div>
                                <h3>BudgetBee</h3>
                                <span>Personal setup</span>
                            </div>
                        </div>

                        <div className="onboarding-step-pill">Setup</div>
                    </div>

                    <div className="onboarding-title">
                        <h1>Personalize your BudgetBee experience</h1>
                        <p>
                            Add a few budget preferences so your dashboard, alerts, and
                            insights can feel more useful from the start.
                        </p>
                    </div>
                </header>

                <form onSubmit={handleSubmit} className="onboarding-form">
                    {error && <div className="onboarding-error">{error}</div>}

                    <div className="onboarding-grid">
                        <div className="onboarding-field">
                            <label>Monthly income</label>
                            <input
                                type="number"
                                name="monthlyIncome"
                                value={formData.monthlyIncome}
                                onChange={handleChange}
                                min="0"
                                required
                                placeholder="25000"
                            />
                        </div>

                        <div className="onboarding-field">
                            <label>Total monthly budget</label>
                            <input
                                type="number"
                                name="monthlyBudget"
                                value={formData.monthlyBudget}
                                onChange={handleChange}
                                min="0"
                                required
                                placeholder="15000"
                            />
                        </div>

                        <div className="onboarding-field">
                            <label>Emergency fund allocation</label>
                            <input
                                type="number"
                                name="emergencyFund"
                                value={formData.emergencyFund}
                                onChange={handleChange}
                                min="0"
                                placeholder="2000"
                            />
                        </div>

                        <div className="onboarding-field">
                            <label>Budget alert limit</label>
                            <select
                                name="budgetAlertLimit"
                                value={formData.budgetAlertLimit}
                                onChange={handleChange}
                            >
                                <option value="50">Alert at 50% budget usage</option>
                                <option value="75">Alert at 75% budget usage</option>
                                <option value="90">Alert at 90% budget usage</option>
                            </select>
                        </div>

                        <div className="onboarding-field">
                            <label>Savings goal name</label>
                            <input
                                type="text"
                                name="savingsGoalName"
                                value={formData.savingsGoalName}
                                onChange={handleChange}
                                placeholder="Laptop, travel, course fees..."
                            />
                        </div>

                        <div className="onboarding-field">
                            <label>Savings goal amount</label>
                            <input
                                type="number"
                                name="savingsGoalAmount"
                                value={formData.savingsGoalAmount}
                                onChange={handleChange}
                                min="0"
                                placeholder="50000"
                            />
                        </div>
                    </div>

                    <section className="category-section">
                        <h3>Where do you usually spend?</h3>
                        <p>Select the categories you want BudgetBee to track closely.</p>

                        <div className="category-grid">
                            {categories.map((category) => (
                                <button
                                    type="button"
                                    key={category}
                                    className={
                                        selectedCategories.includes(category)
                                            ? "category-chip active"
                                            : "category-chip"
                                    }
                                    onClick={() => toggleCategory(category)}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </section>

                    <div className="onboarding-actions">
                        <button type="submit" disabled={loading} className="onboarding-btn">
                            {loading ? "Saving setup..." : "Save and continue"}
                        </button>
                    </div>
                </form>
            </section>
        </main>
    );
};

export default Onboarding;