import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import "../styles/form.css";

export default function Login() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = location.state?.from?.pathname || "/";

  const [username, setUsername] = useState(() => localStorage.getItem("lm_saved_user") || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(() => !!localStorage.getItem("lm_saved_user"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // clear server-side error on mount
    setError("");
  }, []);

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!username || !password) {
      setError("Please enter username and password.");
      return;
    }

    setLoading(true);
    try {
      await auth.login({ username, password });
      // remember username if requested
      if (remember) {
        localStorage.setItem("lm_saved_user", username);
      } else {
        localStorage.removeItem("lm_saved_user");
      }
      // navigate to where user wanted to go before login
      navigate(returnTo, { replace: true });
    } catch (err) {
      setError(err?.message || "Sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function fillDemo() {
    setUsername("demo");
    setPassword("demo");
  }

  return (
    <div className="login-page modern-login-page">
      <div className="login-card modern-login-card" role="main" aria-labelledby="signin-title">
        <div className="login-left">
          <div className="login-brand">
            <div className="logo-large">LM</div>
            <h1 id="signin-title">Welcome back</h1>
            <p className="muted">Sign in to access the Leave Manager dashboard</p>
          </div>

          <form className="login-form" onSubmit={submit} noValidate>
            <label className="field">
              <span className="field-label">Username</span>
              <input
                autoComplete="username"
                placeholder="your.name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                aria-label="Username"
                required
              />
            </label>

            <label className="field">
              <span className="field-label">Password</span>
              <div className="password-row">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-label="Password"
                  required
                />
                <button
                  type="button"
                  className="icon-btn"
                  aria-pressed={showPassword}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((s) => !s)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </label>

            <div className="row between">
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                className="btn link"
                onClick={() => alert("Forgot password flow not yet implemented.")}
              >
                Forgot?
              </button>
            </div>

            {error && <div className="form-error" role="alert">{error}</div>}

            <div className="login-actions">
              <button className="btn primary large" type="submit" disabled={loading}>
                {loading ? "Signing in…" : "Sign in"}
              </button>

              <button
                type="button"
                className="btn ghost large"
                onClick={fillDemo}
                aria-label="Fill demo credentials"
                disabled={loading}
              >
                Use demo
              </button>
            </div>
          </form>

          {/* <div className="social-row">
            <div className="or">Or continue with</div>
            <div className="social-buttons">
              <button className="social-btn" onClick={() => alert("Social login not configured (UI only).")}>
                <span className="s-icon">G</span> Google
              </button>
              <button className="social-btn" onClick={() => alert("Social login not configured (UI only).")}>
                <span className="s-icon">S</span> SSO
              </button>
            </div>
          </div> */}

          <div className="login-footer">
            <small className="muted">By signing in you agree to company policies.</small>
          </div>
        </div>

        <div className="login-right" aria-hidden>
          {/* illustrative panel — can be swapped for an illustration image */}
          <div className="promo">
            <h3>Fast approvals</h3>
            <p>Approve, track and export leave reports with a few clicks.</p>
            <ul className="promo-list">
              <li>Team calendar & conflict detection</li>
              <li>One-click approvals</li>
              <li>CSV export & reports</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
