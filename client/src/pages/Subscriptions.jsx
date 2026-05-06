import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Bell, CreditCard, Plus, Trash2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
    addSubscription,
    deleteSubscription,
    getSubscriptions,
} from "../services/subscriptionService";
import "./Subscriptions.css";

const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
};

const billingCycles = ["Monthly", "Yearly", "Weekly", "Quarterly"];

const subscriptionCategories = [
    "Entertainment",
    "Education",
    "Productivity",
    "Fitness",
    "Food",
    "Shopping",
    "Other",
];

const Subscriptions = () => {
    const navigate = useNavigate();

    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        amount: "",
        billingCycle: "Monthly",
        renewalDate: new Date().toISOString().split("T")[0],
        category: "Entertainment",
        reminderEnabled: true,
        notes: "",
    });

    const fetchSubscriptions = async () => {
        try {
            const data = await getSubscriptions();
            setSubscriptions(data || []);
        } catch (err) {
            console.error("Fetch subscriptions error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const totalMonthlyCost = useMemo(() => {
        return subscriptions.reduce((sum, item) => {
            const amount = Number(item.amount || 0);

            if (item.billingCycle === "Yearly") {
                return sum + amount / 12;
            }

            if (item.billingCycle === "Weekly") {
                return sum + amount * 4;
            }

            if (item.billingCycle === "Quarterly") {
                return sum + amount / 3;
            }

            return sum + amount;
        }, 0);
    }, [subscriptions]);

    const upcomingSubscriptions = useMemo(() => {
        return [...subscriptions]
            .sort((a, b) => new Date(a.renewalDate) - new Date(b.renewalDate))
            .slice(0, 3);
    }, [subscriptions]);

    const openModal = () => {
        setFormData({
            name: "",
            amount: "",
            billingCycle: "Monthly",
            renewalDate: new Date().toISOString().split("T")[0],
            category: "Entertainment",
            reminderEnabled: true,
            notes: "",
        });
        setError("");
        setIsModalOpen(true);
    };

    const closeModal = () => {
        if (!saving) {
            setIsModalOpen(false);
            setError("");
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));

        setError("");
    };

    const handleAddSubscription = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            setError("Subscription name is required.");
            return;
        }

        if (!formData.amount || Number(formData.amount) <= 0) {
            setError("Please enter a valid amount.");
            return;
        }

        if (!formData.renewalDate) {
            setError("Renewal date is required.");
            return;
        }

        const payload = {
            name: formData.name,
            amount: Number(formData.amount),
            billingCycle: formData.billingCycle,
            renewalDate: formData.renewalDate,
            category: formData.category,
            reminderEnabled: formData.reminderEnabled,
            notes: formData.notes,
        };

        try {
            setSaving(true);
            setError("");

            const data = await addSubscription(payload);

            setSubscriptions((prev) => [data.subscription, ...prev]);
            setIsModalOpen(false);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Could not add subscription. Please try again."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteSubscription = async (subscriptionId) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this subscription?"
        );

        if (!confirmDelete) return;

        try {
            await deleteSubscription(subscriptionId);

            setSubscriptions((prev) =>
                prev.filter((subscription) => subscription._id !== subscriptionId)
            );
        } catch (err) {
            console.error("Delete subscription error:", err);
            alert("Could not delete subscription. Please try again.");
        }
    };

    const formatDate = (dateValue) => {
        if (!dateValue) return "No date";

        return new Date(dateValue).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    if (loading) {
        return <div className="subscriptions-loading">Loading subscriptions...</div>;
    }

    return (
        <main className="subscriptions-page">
            <section className="subscriptions-shell">
                <div className="subscriptions-content">
                    <div className="subscriptions-top">
                        <button
                            type="button"
                            className="subscriptions-icon-btn"
                            onClick={() => navigate("/account")}
                        >
                            <ArrowLeft size={18} />
                        </button>

                        <div className="subscriptions-brand">
                            <div className="subscriptions-logo">B</div>
                            <div>
                                <h3>BudgetBee</h3>
                                <span>Subscriptions</span>
                            </div>
                        </div>
                    </div>

                    <section className="subscriptions-heading">
                        <p>Recurring payments</p>
                        <h1>Manage subscriptions</h1>
                    </section>

                    <section className="subscription-summary-card">
                        <div className="summary-icon">
                            <CreditCard size={20} />
                        </div>

                        <div>
                            <span>Estimated monthly cost</span>
                            <h2>{formatCurrency(totalMonthlyCost)}</h2>
                            <p>
                                Based on monthly equivalent of your saved subscriptions.
                            </p>
                        </div>
                    </section>

                    <button className="add-subscription-btn" onClick={openModal}>
                        <Plus size={17} />
                        Add subscription
                    </button>

                    <section className="subscriptions-section-card">
                        <div className="subscriptions-section-header">
                            <h3>Upcoming renewals</h3>
                            <small>{upcomingSubscriptions.length} items</small>
                        </div>

                        {upcomingSubscriptions.length > 0 ? (
                            <div className="subscriptions-list">
                                {upcomingSubscriptions.map((subscription) => (
                                    <div className="subscription-item" key={subscription._id}>
                                        <div className="subscription-left">
                                            <div className="subscription-dot">
                                                {subscription.name?.charAt(0)?.toUpperCase() || "S"}
                                            </div>

                                            <div>
                                                <h4>{subscription.name}</h4>
                                                <span>
                                                    {subscription.category} ·{" "}
                                                    {formatDate(subscription.renewalDate)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="subscription-actions">
                                            <strong>{formatCurrency(subscription.amount)}</strong>
                                            <button
                                                type="button"
                                                className="subscription-delete-btn"
                                                onClick={() =>
                                                    handleDeleteSubscription(subscription._id)
                                                }
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="subscriptions-empty-text">
                                No subscriptions added yet. Add your first recurring payment to
                                track renewals.
                            </p>
                        )}
                    </section>

                    <section className="subscriptions-section-card">
                        <div className="subscriptions-section-header">
                            <h3>All subscriptions</h3>
                            <small>{subscriptions.length} total</small>
                        </div>

                        {subscriptions.length > 0 ? (
                            <div className="subscriptions-list">
                                {subscriptions.map((subscription) => (
                                    <div className="subscription-item" key={subscription._id}>
                                        <div className="subscription-left">
                                            <div className="subscription-dot soft">
                                                <Bell size={15} />
                                            </div>

                                            <div>
                                                <h4>{subscription.name}</h4>
                                                <span>
                                                    {subscription.billingCycle} · {subscription.category}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="subscription-actions">
                                            <strong>{formatCurrency(subscription.amount)}</strong>
                                            <button
                                                type="button"
                                                className="subscription-delete-btn"
                                                onClick={() =>
                                                    handleDeleteSubscription(subscription._id)
                                                }
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="subscriptions-empty-text">
                                Your subscription list is empty for now.
                            </p>
                        )}
                    </section>
                </div>
            </section>

            {isModalOpen && (
                <div className="subscription-modal-backdrop" onClick={closeModal}>
                    <div
                        className="subscription-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="subscription-modal-header">
                            <div>
                                <span>Add new</span>
                                <h3>Subscription</h3>
                            </div>

                            <button className="subscription-close-btn" onClick={closeModal}>
                                <X size={18} />
                            </button>
                        </div>

                        {error && <div className="subscription-modal-error">{error}</div>}

                        <form
                            className="subscription-form"
                            onSubmit={handleAddSubscription}
                        >
                            <div className="subscription-field">
                                <label>Subscription name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="Netflix, Spotify, Notion..."
                                />
                            </div>

                            <div className="subscription-field">
                                <label>Amount</label>
                                <input
                                    type="number"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    min="1"
                                    required
                                    placeholder="199"
                                />
                            </div>

                            <div className="subscription-field">
                                <label>Billing cycle</label>
                                <select
                                    name="billingCycle"
                                    value={formData.billingCycle}
                                    onChange={handleChange}
                                >
                                    {billingCycles.map((cycle) => (
                                        <option value={cycle} key={cycle}>
                                            {cycle}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="subscription-field">
                                <label>Renewal date</label>
                                <input
                                    type="date"
                                    name="renewalDate"
                                    value={formData.renewalDate}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="subscription-field">
                                <label>Category</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                >
                                    {subscriptionCategories.map((category) => (
                                        <option value={category} key={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <label className="subscription-checkbox-row">
                                <input
                                    type="checkbox"
                                    name="reminderEnabled"
                                    checked={formData.reminderEnabled}
                                    onChange={handleChange}
                                />
                                <span>Enable renewal reminder</span>
                            </label>

                            <div className="subscription-field">
                                <label>Notes</label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows="3"
                                    placeholder="Student plan, shared account, renewal details..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="subscription-submit-btn"
                            >
                                {saving ? "Saving subscription..." : "Save subscription"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
};

export default Subscriptions;