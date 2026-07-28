import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAuthStyles } from "./authStyles";
import PhoneMockup from "../components/PhoneMockup";

function Register() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
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

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await register(email, password, name);
      navigate("/");
    } catch (err) {
      setError(err.detail || "Could not create your account.");
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
          <div style={styles.loginBadge}>⭐ Create your account</div>

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
            <label style={styles.loginLabel}>Name</label>
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              style={styles.loginInput}
            />

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
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
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
              {submitting ? "Creating account..." : "Create Account"}
            </button>

            {error && <div style={styles.errorBox}>{error}</div>}

            <div style={styles.switchLine}>
              Already have an account?{" "}
              <Link to="/login" style={styles.switchLink}>
                Sign in
              </Link>
            </div>
          </form>
        </div>

        <PhoneMockup styles={styles} />
      </div>
    </div>
  );
}

export default Register;
