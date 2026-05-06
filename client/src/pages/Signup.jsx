import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Mail, LockKeyhole, UserRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./Signup.css";

const Signup = () => {
    const navigate = useNavigate();
    const { signup, isAuthenticated } = useAuth();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [signupCompleted, setSignupCompleted] = useState(false);

    if (signupCompleted) {
        return <Navigate to="/onboarding" replace />;
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            setError("");

            await signup(formData);
            setSignupCompleted(true);
        } catch (err) {
            setError(err.response?.data?.message || "Signup failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">
            <section className="auth-app-box">
                <div className="auth-content">
                    <div className="auth-top-bar">
                        <div className="auth-brand">
                            <div className="auth-logo">B</div>
                            <div className="auth-brand-text">
                                <h3>BudgetBee</h3>
                                <span>Personal finance</span>
                            </div>
                        </div>

                        <div className="auth-pill">Secure</div>
                    </div>

                    <div className="auth-heading">
                        <h1>
                            Start building better{" "}
                            <span className="auth-highlight">habits</span>
                        </h1>
                        <p>
                            Create your account and manage income, expenses, subscriptions,
                            and insights in one polished app.
                        </p>
                    </div>

                    {error && <div className="auth-error">{error}</div>}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="auth-field">
                            <label>Full name</label>
                            <div className="auth-input-wrap">
                                <UserRound className="auth-input-icon" size={17} />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="Your name"
                                />
                            </div>
                        </div>

                        <div className="auth-field">
                            <label>Email address</label>
                            <div className="auth-input-wrap">
                                <Mail className="auth-input-icon" size={17} />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div className="auth-field">
                            <label>Password</label>
                            <div className="auth-input-wrap">
                                <LockKeyhole className="auth-input-icon" size={17} />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength={6}
                                    placeholder="Minimum 6 characters"
                                />
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="auth-btn">
                            {loading ? "Creating account..." : "Create account"}
                        </button>
                    </form>

                    <p className="auth-footer">
                        Already have an account? <Link to="/login">Login</Link>
                    </p>

                    <div className="auth-insight-card">
                        <div className="auth-insight-icon">✓</div>
                        <p>
                            <strong>Built for everyday clarity.</strong> BudgetBee helps you
                            track spending, save better, and understand your money simply.
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Signup;