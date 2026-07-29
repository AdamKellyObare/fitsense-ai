import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Beef, Flame, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useViewport } from "../hooks/useViewport";
import { getAuthStyles } from "./authStyles";
import PhoneMockup from "../components/PhoneMockup";

const rise = {
  hidden: { opacity: 0, y: 10 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.62, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] },
  }),
};

const MotionDiv = motion.div;
const MotionH1 = motion.h1;
const MotionP = motion.p;
const MotionForm = motion.form;

function Register() {
  const { isMobile } = useViewport();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

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
          <MotionDiv style={styles.loginBadge} variants={rise} initial="hidden" animate="visible" custom={0}>
            <Sparkles size={14} strokeWidth={2.6} style={{ marginRight: "6px", verticalAlign: "-2px" }} />
            Create your account
          </MotionDiv>

          <MotionH1 style={styles.loginHeroTitle} variants={rise} initial="hidden" animate="visible" custom={1}>
            Track your calories smarter with FitSense AI
          </MotionH1>

          <MotionP style={styles.loginHeroText} variants={rise} initial="hidden" animate="visible" custom={2}>
            Log meals, monitor macros, track water, view analytics, and get
            AI-powered nutrition insights from one clean dashboard.
          </MotionP>

          <MotionDiv style={styles.trustStats} variants={rise} initial="hidden" animate="visible" custom={3}>
            <span style={styles.trustStatItem}><Flame size={15} strokeWidth={2.6} /> Meal tracking</span>
            <span style={styles.trustStatItem}><Beef size={15} strokeWidth={2.6} /> Macro insights</span>
            <span style={styles.trustStatItem}><Sparkles size={15} strokeWidth={2.6} /> AI coach</span>
          </MotionDiv>

          <MotionForm
            style={styles.loginAccessBox}
            onSubmit={handleSubmit}
            variants={rise}
            initial="hidden"
            animate="visible"
            custom={4}
          >
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
          </MotionForm>
        </div>

        <MotionDiv
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <PhoneMockup styles={styles} />
        </MotionDiv>
      </div>
    </div>
  );
}

export default Register;
