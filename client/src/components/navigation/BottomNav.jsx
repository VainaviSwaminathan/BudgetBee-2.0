import { LayoutDashboard, BookOpen, UserRound } from "lucide-react";
import { NavLink } from "react-router-dom";
import "./BottomNav.css";

const BottomNav = () => {
    return (
        <nav className="bottom-nav">
            <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                    isActive ? "bottom-nav-item active" : "bottom-nav-item"
                }
            >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
            </NavLink>

            <NavLink
                to="/courses"
                className={({ isActive }) =>
                    isActive ? "bottom-nav-item active" : "bottom-nav-item"
                }
            >
                <BookOpen size={18} />
                <span>Courses</span>
            </NavLink>

            <NavLink
                to="/account"
                className={({ isActive }) =>
                    isActive ? "bottom-nav-item active" : "bottom-nav-item"
                }
            >
                <UserRound size={18} />
                <span>Account</span>
            </NavLink>
        </nav>
    );
};

export default BottomNav;