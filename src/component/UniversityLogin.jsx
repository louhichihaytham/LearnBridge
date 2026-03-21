import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import "../CSS/UniversityLogin.css";

const UNIVERSITY_DOMAINS = [
  "utm.tn",
  "u-carthage.tn",
  "u-manar.tn",
  "u-sousse.tn",
  "u-sfax.tn",
  "u-monastir.tn",
  "u-kairouan.tn",
  "u-jendouba.tn",
  "u-gafsa.tn",
  "isimg.rnu.tn",
  "insat.rnu.tn",
];

function isTunisianUniversityEmail(email) {
  const normalized = email.trim().toLowerCase();
  const parts = normalized.split("@");

  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return false;
  }

  const domain = parts[1];
  return domain.endsWith(".rnu.tn") || UNIVERSITY_DOMAINS.includes(domain);
}

function UniversityLogin({ onVerified, isAuthenticated }) {
  const navigate = useNavigate();
  const location = useLocation();
  const targetAfterLogin = location.state?.from || "/certifications/Cloud";

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [studentCard, setStudentCard] = useState(null);
  const [error, setError] = useState("");

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("Enter your username.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (!isTunisianUniversityEmail(email)) {
      setError(
        "Use a valid Tunisian university email (for example: name@something.rnu.tn).",
      );
      return;
    }

    if (!studentCard) {
      setError("Upload your university student card to continue.");
      return;
    }

    const maxSizeBytes = 5 * 1024 * 1024;
    if (studentCard.size > maxSizeBytes) {
      setError("Student card file is too large. Maximum size is 5MB.");
      return;
    }

    onVerified({
      verified: true,
      username: username.trim(),
      email: email.trim(),
      studentCardName: studentCard.name,
      verifiedAt: new Date().toISOString(),
    });

    navigate(targetAfterLogin, { replace: true });
  };

  return (
    <main className="university-login-page">
      <section className="university-login-card">
        <h1>University Sign In</h1>
        <p>
          Access is restricted to Tunisian university students. Sign in with
          your university email and upload your student card for verification.
        </p>

        <form onSubmit={handleSubmit} className="university-login-form">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Your username"
            required
          />

          <label htmlFor="university-email">University Email</label>
          <input
            id="university-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@faculty.rnu.tn"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            required
            minLength={6}
          />

          <label className="inline-option">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(event) => setShowPassword(event.target.checked)}
            />
            Show password
          </label>

          <label htmlFor="student-card">University Student Card</label>
          <input
            id="student-card"
            type="file"
            accept="image/*,.pdf"
            onChange={(event) =>
              setStudentCard(event.target.files?.[0] || null)
            }
            required
          />

          {studentCard ? (
            <small>Selected file: {studentCard.name}</small>
          ) : null}
          {error ? <p className="university-login-error">{error}</p> : null}

          <a
            href="#"
            className="university-login-help"
            onClick={(event) => event.preventDefault()}
          >
            Forgot password?
          </a>

          <button type="submit" className="university-login-submit">
            Verify and Sign In
          </button>
        </form>
      </section>
    </main>
  );
}

export default UniversityLogin;
