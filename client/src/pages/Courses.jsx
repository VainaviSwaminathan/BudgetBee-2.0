import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BookOpen } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import BottomNav from "../components/navigation/BottomNav";
import "./Courses.css";

const courseModules = [
    {
        title: "Budgeting Basics",
        description:
            "Understand how to divide income into spending, saving, and essentials.",
        lesson:
            "A budget helps you decide where your money should go before you spend it. Start by setting aside money for needs, then savings, then wants. A simple rule is to keep expenses below your monthly budget and review spending every week.",
        tasks: [
            "Set your monthly income",
            "Decide a monthly spending limit",
            "Review your budget once a week",
        ],
    },
    {
        title: "Needs vs Wants",
        description:
            "Learn how to spot unnecessary spending before it becomes a habit.",
        lesson:
            "Needs are things you must pay for, like food, rent, education, travel, and bills. Wants are things that improve comfort or enjoyment, like shopping, subscriptions, and eating out. BudgetBee helps you notice when wants start taking over your budget.",
        tasks: [
            "List three essential expenses",
            "List three optional expenses",
            "Pause before making one impulse purchase",
        ],
    },
    {
        title: "Emergency Fund",
        description:
            "Build a safety cushion for unexpected expenses and peace of mind.",
        lesson:
            "An emergency fund is money kept aside for unexpected situations. Even saving a small amount every month can help. Your emergency fund allocation in BudgetBee reminds you to protect your future self.",
        tasks: [
            "Choose an emergency fund amount",
            "Save a small fixed amount this month",
            "Avoid using emergency savings for wants",
        ],
    },
    {
        title: "Subscription Awareness",
        description:
            "Review recurring payments and avoid silent budget leaks.",
        lesson:
            "Subscriptions are easy to forget because they renew automatically. Track every recurring payment and review whether you still use it. Cancel unused subscriptions so they do not quietly reduce your monthly budget.",
        tasks: [
            "Add all active subscriptions",
            "Check renewal dates",
            "Cancel or pause one unused subscription",
        ],
    },
];

const getTaskId = (courseTitle, task) => `${courseTitle}-${task}`;

const Courses = () => {
    const { user } = useAuth();

    const [activeCourse, setActiveCourse] = useState(null);
    const [completedTasks, setCompletedTasks] = useState([]);
    const [progressLoaded, setProgressLoaded] = useState(false);

    const storageKey = user?.email
        ? `budgetbeeCourseProgress-${user.email}`
        : "budgetbeeCourseProgress-guest";

    useEffect(() => {
        setProgressLoaded(false);

        const savedProgress = localStorage.getItem(storageKey);

        if (savedProgress) {
            try {
                const parsedProgress = JSON.parse(savedProgress);
                setCompletedTasks(Array.isArray(parsedProgress) ? parsedProgress : []);
            } catch (error) {
                setCompletedTasks([]);
            }
        } else {
            setCompletedTasks([]);
        }

        setProgressLoaded(true);
    }, [storageKey]);

    useEffect(() => {
        if (!progressLoaded) return;

        localStorage.setItem(storageKey, JSON.stringify(completedTasks));
    }, [completedTasks, storageKey, progressLoaded]);

    const totalTasks = useMemo(() => {
        return courseModules.reduce((sum, module) => sum + module.tasks.length, 0);
    }, []);

    const completedCount = completedTasks.length;
    const progressPercent = totalTasks
        ? Math.round((completedCount / totalTasks) * 100)
        : 0;

    const toggleCourse = (title) => {
        setActiveCourse((prev) => (prev === title ? null : title));
    };

    const toggleTask = (taskId) => {
        setCompletedTasks((prev) => {
            if (prev.includes(taskId)) {
                return prev.filter((id) => id !== taskId);
            }

            return [...prev, taskId];
        });
    };

    return (
        <main className="courses-page">
            <section className="courses-shell">
                <div className="courses-content">
                    <div className="courses-top">
                        <div className="courses-brand">
                            <div className="courses-logo">B</div>
                            <div>
                                <h3>BudgetBee</h3>
                                <span>Learning</span>
                            </div>
                        </div>
                    </div>

                    <section className="courses-heading">
                        <p>Mini financial literacy course</p>
                        <h1>Learn money habits in small steps</h1>
                    </section>

                    <section className="courses-hero-card">
                        <div className="courses-hero-icon">
                            <BookOpen size={22} />
                        </div>

                        <div>
                            <span>Beginner friendly</span>
                            <h2>Finance made simple</h2>
                            <p>
                                Complete small course actions and watch your learning progress
                                grow as you build better money habits.
                            </p>
                        </div>
                    </section>

                    <section className="course-progress-card">
                        <div className="course-progress-header">
                            <div>
                                <span>Course progress</span>
                                <h3>{progressPercent}% complete</h3>
                            </div>
                            <strong>
                                {completedCount}/{totalTasks}
                            </strong>
                        </div>

                        <div className="course-progress-track">
                            <div
                                className="course-progress-fill"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>

                        <p>
                            Tick off the action items after reading each lesson to complete
                            the course.
                        </p>
                    </section>

                    <section className="course-list">
                        {courseModules.map((module) => {
                            const isOpen = activeCourse === module.title;
                            const moduleCompletedCount = module.tasks.filter((task) =>
                                completedTasks.includes(getTaskId(module.title, task))
                            ).length;

                            return (
                                <article
                                    className={isOpen ? "course-card open" : "course-card"}
                                    key={module.title}
                                >
                                    <div className="course-card-main">
                                        <div className="course-left">
                                            <div className="course-icon">
                                                {moduleCompletedCount}/{module.tasks.length}
                                            </div>

                                            <div>
                                                <h3>{module.title}</h3>
                                                <p>{module.description}</p>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            className={isOpen ? "course-action active" : "course-action"}
                                            onClick={() => toggleCourse(module.title)}
                                        >
                                            <ArrowRight size={16} />
                                        </button>
                                    </div>

                                    {isOpen && (
                                        <div className="course-lesson">
                                            <h4>Quick lesson</h4>
                                            <p>{module.lesson}</p>

                                            <div className="course-task-list">
                                                {module.tasks.map((task) => {
                                                    const taskId = getTaskId(module.title, task);
                                                    const isChecked = completedTasks.includes(taskId);

                                                    return (
                                                        <label
                                                            className={
                                                                isChecked
                                                                    ? "course-task checked"
                                                                    : "course-task"
                                                            }
                                                            key={taskId}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={isChecked}
                                                                onChange={() => toggleTask(taskId)}
                                                            />
                                                            <span>{task}</span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </article>
                            );
                        })}
                    </section>

                    <BottomNav />
                </div>
            </section>
        </main>
    );
};

export default Courses;