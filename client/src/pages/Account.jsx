import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    CreditCard,
    LogOut,
    Mail,
    Save,
    UserRound,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import BottomNav from "../components/navigation/BottomNav";
import "./Account.css";

const Account = () => {
    const navigate = useNavigate();
    const { user, updateProfile, logout } = useAuth();

    const [formData, setFormData] = useState({
        name: user?.name || "",
        email: user?.email || "",
    });

    const [editing, setEditing] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                email: user.email || "",
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setMessage("");
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const trimmedFormData = {
            name: formData.name.trim(),
            email: formData.email.trim().toLowerCase(),
        };

        if (!trimmedFormData.name || !trimmedFormData.email) {
            setError("Name and email are required.");
            return;
        }

        try {
            setSaving(true);
            setError("");
            setMessage("");

            const data = await updateProfile(trimmedFormData);

            setFormData({
                name: data.user.name || "",
                email: data.user.email || "",
            });

            setMessage("Account details updated successfully.");
            setEditing(false);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Could not update account. Please try again."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleStartEditing = () => {
        setMessage("");
        setError("");
        setEditing(true);
    };

    const handleCancelEditing = () => {
        setFormData({
            name: user?.name || "",
            email: user?.email || "",
        });
        setMessage("");
        setError("");
        setEditing(false);
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <main className="account-page">
            <section className="account-shell">
                <div className="account-content">
                    <div className="account-top">
                        <button
                            type="button"
                            className="account-icon-btn"
                            onClick={() => navigate("/dashboard")}
                        >
                            <ArrowLeft size={18} />
                        </button>

                        <div className="account-brand">
                            <div className="account-logo">B</div>
                            <div>
                                <h3>BudgetBee</h3>
                                <span>Account</span>
                            </div>
                        </div>
                    </div>

                    <section className="account-heading">
                        <p>Your profile</p>
                        <h1>Account details</h1>
                    </section>

                    <section className="account-profile-card">
                        <div className="account-avatar">
                            {user?.name?.charAt(0)?.toUpperCase() || "B"}
                        </div>

                        <div>
                            <h2>{user?.name || "BudgetBee User"}</h2>
                            <p>{user?.email || "No email found"}</p>
                        </div>
                    </section>

                    {message && <div className="account-success">{message}</div>}
                    {error && <div className="account-error">{error}</div>}

                    <form onSubmit={handleSubmit} className="account-form">
                        <div className="account-field">
                            <label>Full name</label>
                            <div className="account-input-wrap">
                                <UserRound size={17} className="account-input-icon" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    disabled={!editing}
                                    placeholder="Your name"
                                />
                            </div>
                        </div>

                        <div className="account-field">
                            <label>Email address</label>
                            <div className="account-input-wrap">
                                <Mail size={17} className="account-input-icon" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={!editing}
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        {editing ? (
                            <div className="account-edit-actions">
                                <button type="submit" disabled={saving} className="account-main-btn">
                                    <Save size={17} />
                                    {saving ? "Saving..." : "Save changes"}
                                </button>

                                <button
                                    type="button"
                                    disabled={saving}
                                    className="account-secondary-btn"
                                    onClick={handleCancelEditing}
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                className="account-main-btn"
                                onClick={handleStartEditing}
                            >
                                Edit account
                            </button>
                        )}
                    </form>

                    <section className="account-actions">
                        <Link to="/subscriptions" className="account-action-card">
                            <div className="account-action-icon">
                                <CreditCard size={18} />
                            </div>

                            <div>
                                <h3>View subscriptions</h3>
                                <p>Manage monthly and recurring payments.</p>
                            </div>
                        </Link>

                        <button className="account-action-card danger" onClick={handleLogout}>
                            <div className="account-action-icon">
                                <LogOut size={18} />
                            </div>

                            <div>
                                <h3>Logout</h3>
                                <p>Sign out of your BudgetBee account.</p>
                            </div>
                        </button>
                    </section>

                    <BottomNav />
                </div>
            </section>
        </main>
    );
};

export default Account;