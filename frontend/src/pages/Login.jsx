import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAuthStyles } from "./authStyles";
import PhoneMockup from "../components/PhoneMockup";

function Login() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const styles = getAuthStyles(isMobile);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setSubmitting(true);
    setError("");

    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.detail || "Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.loginPage}>
      <div style={styles.loginNav}>
        <div style={styles.loginBrand}>
          <div style={styles.loginBrandIcon}>F</div>
          <span>FitSense AI</span>
        </div>
      </div>

      <div style={styles.loginHero}>
        <div style={styles.loginLeft}>
          <div style={styles.loginBadge}>⭐ Welcome back</div>

          <h1 style={styles.loginHeroTitle}>
            Track your calories smarter with FitSense AI
          </h1>

          <p style={styles.loginHeroText}>
            Log meals, monitor macros, track water, view analytics, and get
            AI-powered nutrition insights from one clean dashboard.
          </p>

          <div style={styles.trustStats}>
            <span>🔥 Meal tracking</span>
            <span>🥩 Macro insights</span>
            <span>🤖 AI coach</span>
          </div>

          <form style={styles.loginAccessBox} onSubmit={handleSubmit}>
            <label style={styles.loginLabel}>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              style={styles.loginInput}
            />

            <label style={styles.loginLabel}>Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              style={styles.loginInput}
            />

            <button
              type="submit"
              disabled={submitting}
              style={{
                ...styles.loginButton,
                ...(submitting ? styles.loginButtonDisabled : {}),
              }}
            >
              {submitting ? "Signing in..." : "Sign In"}
            </button>

            {error && <div style={styles.errorBox}>{error}</div>}

            <div style={styles.switchLine}>
              Don't have an account?{" "}
              <Link to="/register" style={styles.switchLink}>
                Sign up
              </Link>
            </div>
          </form>
        </div>

        <PhoneMockup styles={styles} />
      </div>
    </div>
  );
}

export default Login;
