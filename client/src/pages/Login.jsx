import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Mail, LockKeyhole } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

const Login = () => {
    const navigate = useNavigate();
    const { login, isAuthenticated } = useAuth();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

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

            await login(formData);
            navigate("/dashboard");
        } catch (err) {
            setError(err.response?.data?.message || "Login failed. Please try again.");
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
                                <span>Money manager</span>
                            </div>
                        </div>

                        <div className="auth-pill">v2.0</div>
                    </div>

                    <div className="auth-heading">
                        <h1>
                            Welcome back to your{" "}
                            <span className="auth-highlight">BudgetBee</span>
                        </h1>
                        <p>
                            Track income, expenses, and subscriptions from one clean dashboard.
                        </p>
                    </div>

                    {error && <div className="auth-error">{error}</div>}

                    <form onSubmit={handleSubmit} className="auth-form">
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
                                    placeholder="Enter your password"
                                />
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="auth-btn">
                            {loading ? "Logging in..." : "Login"}
                        </button>
                    </form>

                    <p className="auth-footer">
                        New to BudgetBee? <Link to="/signup">Create an account</Link>
                    </p>

                    <div className="auth-insight-card">
                        <div className="auth-insight-icon">↗</div>
                        <p>
                            <strong>Simple money clarity.</strong> BudgetBee keeps finance
                            tracking calm, minimal, and student-friendly.
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Login;