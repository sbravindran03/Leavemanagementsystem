// // src/pages/AddEmployee.jsx
// import React, { useState } from "react";
// import { useAuth } from "../auth/AuthProvider";

// /**
//  * Modern AddEmployee page (manager only)
//  * - POST /api/auth/register with { username, password, name, role:'employee', managerId }
//  * - Shows success UI with copy-to-clipboard for credentials
//  */

// function generatePassword(len = 12) {
//   const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*()-_+";
//   let out = "";
//   for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
//   return out;
// }

// export default function AddEmployee() {
//   const { apiFetch, user } = useAuth();

//   const [username, setUsername] = useState("");
//   const [name, setName] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [created, setCreated] = useState(null);

//   function normalizeUsername(v) {
//     return v.trim().toLowerCase();
//   }

//   function validate() {
//     const u = normalizeUsername(username);
//     if (!u) return "Username is required";
//     if (!/^[a-z0-9._-]{3,32}$/.test(u)) {
//       return "Username must be 3–32 chars: lowercase letters, numbers, dot, underscore or hyphen";
//     }
//     if (!password) return "Password is required (use generate if you want)";
//     if (password.length < 6) return "Password must be at least 6 characters";
//     return null;
//   }

//   async function handleSubmit(e) {
//     e.preventDefault();
//     setError("");
//     setCreated(null);

//     const v = validate();
//     if (v) {
//       setError(v);
//       return;
//     }

//     setLoading(true);
//     try {
//       const payload = {
//         username: normalizeUsername(username),
//         password,
//         name: name.trim(),
//         role: "employee",
//         managerId: user?.id || null,
//       };

//       const res = await apiFetch("/api/auth/register", {
//         method: "POST",
//         body: JSON.stringify(payload),
//       });

//       // res expected to contain { id, username, name, role }
//       setCreated({
//         id: res.id || (res._id || null),
//         username: res.username || payload.username,
//         password: password,
//         name: res.name || payload.name,
//       });

//       // clear form but keep password in created state
//       setUsername("");
//       setName("");
//       setPassword("");
//     } catch (err) {
//       console.error("AddEmployee error:", err);
//       setError(err?.message || "Failed to create employee");
//     } finally {
//       setLoading(false);
//     }
//   }

//   function handleGenerate() {
//     const p = generatePassword(10);
//     setPassword(p);
//     setShowPassword(true);
//   }

//   function handleCopyCredentials() {
//     const text = `Username: ${created.username}\nPassword: ${created.password}`;
//     navigator.clipboard?.writeText(text).then(
//       () => alert("Credentials copied to clipboard"),
//       () => alert("Copy failed — please copy manually")
//     );
//   }

//   if (!user) {
//     return (
//       <div className="page">
//         <h2>Add employee</h2>
//         <div className="muted">You must be signed in as a manager to add employees.</div>
//       </div>
//     );
//   }

//   // optional: block if not manager (UI level; backend still enforces)
//   if (user.role !== "manager") {
//     return (
//       <div className="page">
//         <h2>Restricted</h2>
//         <div className="muted">Only managers can create employee accounts.</div>
//       </div>
//     );
//   }

//   return (
//     <div className="page add-employee-page">
//       <div className="page-header">
//         <h2>Create Employee Account</h2>
//         <p className="muted">Create login credentials for a new employee. The employee will be assigned to you as manager.</p>
//       </div>

//       <div className="grid-row">
//         <form className="card form-card modern-form" onSubmit={handleSubmit}>
//           <div className="form-grid">
//             <label className="field">
//               <span className="label">Username</span>
//               <input
//                 value={username}
//                 onChange={(e) => setUsername(e.target.value)}
//                 placeholder="e.g. ravi.k"
//                 autoComplete="username"
//                 disabled={loading}
//                 inputMode="latin"
//               />
//               <small className="muted">Lowercase, 3–32 chars. Letters, numbers, dot, underscore or hyphen.</small>
//             </label>

//             <label className="field">
//               <span className="label">Full name</span>
//               <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ravi Kumar" disabled={loading} />
//             </label>

//             <label className="field">
//               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
//                 <span className="label">Temporary password</span>
//                 <div style={{ display: "flex", gap: 8 }}>
//                   <button
//                     type="button"
//                     className="btn ghost tiny"
//                     onClick={() => { setPassword(""); setShowPassword(false); }}
//                     disabled={loading}
//                     title="Clear"
//                   >
//                     Clear
//                   </button>
//                   <button type="button" className="btn ghost tiny" onClick={handleGenerate} disabled={loading} title="Generate strong password">
//                     Generate
//                   </button>
//                 </div>
//               </div>

//               <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
//                 <input
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   placeholder="Enter a temporary password or press Generate"
//                   disabled={loading}
//                   type={showPassword ? "text" : "password"}
//                   style={{ flex: 1 }}
//                   autoComplete="new-password"
//                 />
//                 <button
//                   type="button"
//                   className="icon-btn"
//                   onClick={() => setShowPassword((s) => !s)}
//                   disabled={loading || !password}
//                   aria-label={showPassword ? "Hide password" : "Show password"}
//                   title={showPassword ? "Hide" : "Show"}
//                 >
//                   {showPassword ? "🙈" : "👁️"}
//                 </button>
//               </div>

//               <small className="muted">Employee can change password later (not implemented). Use a secure temporary password.</small>
//             </label>
//           </div>

//           {error && <div className="form-error">{error}</div>}
//           <div className="form-actions">
//             <button className="btn primary" type="submit" disabled={loading}>
//               {loading ? "Creating…" : "Create employee"}
//             </button>
//             <button
//               type="button"
//               className="btn ghost"
//               onClick={() => { setUsername(""); setName(""); setPassword(""); setShowPassword(false); setError(""); setCreated(null); }}
//               disabled={loading}
//             >
//               Reset
//             </button>
//           </div>
//         </form>

//         <aside className="side-info">
//           <div className="info-card">
//             <h4>Tip</h4>
//             <p>Use the <strong>Generate</strong> button to create a secure temporary password. Copy and share the credentials with the employee securely.</p>
//           </div>

//           {created && (
//             <div className="success-card">
//               <h4>Employee created</h4>
//               <div className="cred">
//                 <div><strong>Username:</strong> <span className="mono">{created.username}</span></div>
//                 <div><strong>Password:</strong> <span className="mono">{created.password}</span></div>
//                 {created.id && <div><strong>ID:</strong> <span className="mono">{created.id}</span></div>}
//               </div>

//               <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
//                 <button className="btn primary" onClick={handleCopyCredentials}>Copy credentials</button>
//                 <button
//                   className="btn ghost"
//                   onClick={() => {
//                     setCreated(null);
//                   }}
//                 >
//                   Done
//                 </button>
//               </div>
//             </div>
//           )}
//         </aside>
//       </div>

//       <style>{`
//         .add-employee-page { padding-bottom: 28px; }
//         .page-header h2 { margin: 0 0 6px; font-size: 22px; }
//         .page-header .muted { color: #64748b; margin: 0 0 14px; }

//         .grid-row { display: grid; grid-template-columns: 1fr 360px; gap: 18px; align-items: start; }
//         .form-card { padding: 18px; border-radius: 12px; box-shadow: 0 10px 30px rgba(12,18,40,0.06); background: linear-gradient(180deg,#fff,#fbfdff); border: 1px solid rgba(15,23,42,0.04); }
//         .modern-form .form-grid { display:flex; flex-direction:column; gap:12px; }

//         .field { display:flex; flex-direction:column; gap:8px; }
//         .label { font-weight:700; font-size:13px; color:#0f172a; }
//         input[type="text"], input[type="password"], input[type="date"], select, textarea {
//           padding:10px 12px; border-radius:10px; border:1px solid rgba(15,23,42,0.06); font-size:14px; outline:none; background:white;
//         }
//         input:focus { box-shadow: 0 8px 28px rgba(99,102,241,0.06); border-color:#7c3aed; }

//         .muted { color:#64748b; font-size:13px; }
//         .form-actions { display:flex; gap:10px; margin-top:8px; }

//         .btn { padding:8px 12px; border-radius:10px; font-weight:700; cursor:pointer; border: none; }
//         .btn.primary { background: linear-gradient(90deg,#7c3aed,#0ea5e9); color:white; box-shadow: 0 8px 24px rgba(99,102,241,0.12); }
//         .btn.ghost { background: transparent; border:1px solid rgba(15,23,42,0.06); color:#0f172a; }
//         .btn.tiny { padding:6px 8px; font-size:13px; border-radius:8px; }

//         .icon-btn { padding:8px 10px; border-radius:10px; border:1px solid rgba(15,23,42,0.06); background:transparent; cursor:pointer; }

//         .side-info { display:flex; flex-direction:column; gap:12px; }
//         .info-card, .success-card { padding:14px; border-radius:12px; background: linear-gradient(180deg,#ffffff,#fbfdff); border:1px solid rgba(15,23,42,0.04); box-shadow: 0 8px 20px rgba(12,18,40,0.04); }
//         .info-card h4, .success-card h4 { margin:0 0 8px; font-size:16px; }
//         .cred { display:flex; flex-direction:column; gap:6px; font-size:14px; }
//         .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", monospace; background:#f8fafc; padding:4px 8px; border-radius:6px; }

//         .form-error { margin-top:8px; color:#9f1239; background:#fff1f2; padding:8px 10px; border-radius:8px; border:1px solid #fecaca; }
//       `}</style>
//     </div>
//   );
// }


// src/pages/AddEmployee.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthProvider";

/**
 * Modern — polished AddEmployee page
 *
 * - Uses apiFetch('/api/auth/register')
 * - Shows non-blocking toast on success with copy-to-clipboard
 * - Has password generator and strength meter
 * - Manager-only UI (UI-level guard; backend still enforces)
 */

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*()-_+";
function generatePassword(len = 12) {
  let out = "";
  for (let i = 0; i < len; i++) out += CHARS[Math.floor(Math.random() * CHARS.length)];
  return out;
}

function passwordStrengthScore(pw = "") {
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (pw.length >= 12) score += 1;
  if (/[A-Z]/.test(pw)) score += 1;
  if (/[0-9]/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;
  return score; // 0..5
}
function strengthLabel(score) {
  if (score <= 1) return "Very weak";
  if (score === 2) return "Weak";
  if (score === 3) return "OK";
  if (score === 4) return "Good";
  return "Strong";
}

export default function AddEmployee() {
  const { apiFetch, user } = useAuth();

  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState(""); // single-line error for form-level
  const [fieldHints, setFieldHints] = useState({}); // per-field hints

  const [created, setCreated] = useState(null); // { username, password, id }
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    if (toastVisible) {
      const t = setTimeout(() => setToastVisible(false), 6000);
      return () => clearTimeout(t);
    }
  }, [toastVisible]);

  // Field-level validation
  useEffect(() => {
    const hints = {};
    const u = (username || "").trim().toLowerCase();
    if (u && !/^[a-z0-9._-]{3,32}$/.test(u)) {
      hints.username = "Lowercase letters, numbers, dot, underscore or hyphen (3–32 chars)";
    }
    if (password && password.length < 6) {
      hints.password = "Password should be at least 6 characters";
    }
    setFieldHints(hints);
  }, [username, password]);

  const pwScore = useMemo(() => passwordStrengthScore(password), [password]);

  function normalizeUsername(v) {
    return v.trim().toLowerCase();
  }

  function validate() {
    const u = normalizeUsername(username);
    if (!u) return { ok: false, msg: "Username is required" };
    if (!/^[a-z0-9._-]{3,32}$/.test(u)) {
      return { ok: false, msg: "Username invalid: lowercase letters, numbers, ., _ or - (3–32)" };
    }
    if (!password) return { ok: false, msg: "Password is required (or generate one)" };
    if (password.length < 6) return { ok: false, msg: "Password must be at least 6 characters" };
    return { ok: true };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFieldError("");
    setCreated(null);

    const v = validate();
    if (!v.ok) {
      setFieldError(v.msg);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        username: normalizeUsername(username),
        password,
        name: name.trim(),
        role: "employee",
        managerId: user?.id || null
      };
      const res = await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      const createdObj = {
        id: res.id || res._id || null,
        username: res.username || payload.username,
        password: payload.password,
        name: res.name || payload.name
      };
      setCreated(createdObj);
      setToastVisible(true);
      // clear fields while keeping created credentials for copy
      setUsername("");
      setName("");
      setPassword("");
      setShowPassword(false);
    } catch (err) {
      console.error("AddEmployee error:", err);
      setFieldError(err?.message || "Failed to create employee");
    } finally {
      setLoading(false);
    }
  }

  function handleGenerate() {
    const p = generatePassword(10);
    setPassword(p);
    setShowPassword(true);
  }

  async function copyCredentials() {
    if (!created) return;
    const text = `Username: ${created.username}\nPassword: ${created.password}`;
    try {
      await navigator.clipboard.writeText(text);
      setToastVisible(true);
    } catch {
      alert("Copy failed — please copy manually");
    }
  }

  if (!user) {
    return (
      <div className="page">
        <h2>Add employee</h2>
        <div className="muted">Sign in as manager to create employees.</div>
      </div>
    );
  }

  if (user.role !== "manager") {
    return (
      <div className="page">
        <h2>Access denied</h2>
        <div className="muted">Only managers can create employee accounts.</div>
      </div>
    );
  }

  return (
    <div className="page add-employee-modern">
      <div className="grid">
        <main className="left">
          <div className="header">
            <div className="title">Create employee account</div>
            <div className="subtitle">Quickly provision a new employee and share credentials securely.</div>
          </div>

          <form className="card form" onSubmit={handleSubmit} noValidate>
            <div className="row">
              <label className="field">
                <div className="label">Username</div>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. ravi.k"
                  autoComplete="username"
                  disabled={loading}
                />
                <div className="hint">
                  <small className="muted">{fieldHints.username || "Lowercase - 3 to 32 chars"}</small>
                </div>
              </label>

              <label className="field">
                <div className="label">Full name</div>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ravi Kumar" disabled={loading} />
                <div className="hint"><small className="muted">Optional</small></div>
              </label>
            </div>

            <div className="row">
              <label className="field password-field">
                <div className="label">Temporary password</div>

                <div className="pw-row">
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Type or generate a strong password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    disabled={loading}
                  />
                  <div className="pw-actions">
                    <button type="button" className="btn ghost tiny" onClick={() => { setPassword(""); setShowPassword(false); }} disabled={loading}>
                      Clear
                    </button>
                    <button type="button" className="btn ghost tiny" onClick={handleGenerate} disabled={loading}>
                      Generate
                    </button>
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                <div className="pw-meta">
                  <div className="strength">
                    <div className={`bar b-${pwScore}`} style={{ width: `${(pwScore / 5) * 100}%` }} />
                  </div>
                  <div className="strength-label">{password ? strengthLabel(pwScore) : "No password"}</div>
                  <div className="hint"><small className="muted">{fieldHints.password || "Use 8+ chars for stronger password"}</small></div>
                </div>
              </label>
            </div>

            {fieldError && <div className="form-error">{fieldError}</div>}

            <div className="actions">
              <button className="btn primary" type="submit" disabled={loading}>
                {loading ? "Creating…" : "Create employee"}
              </button>
              <button
                type="button"
                className="btn ghost"
                onClick={() => { setUsername(""); setName(""); setPassword(""); setShowPassword(false); setFieldError(""); setCreated(null); }}
                disabled={loading}
              >
                Reset
              </button>
            </div>
          </form>

          {/* Recent created info (below form) */}
          {created && (
            <div className="created-card">
              <div className="cc-left">
                <div className="cc-title">Employee created</div>
                <div className="cc-items">
                  <div><strong>Username:</strong> <span className="mono">{created.username}</span></div>
                  <div><strong>Password:</strong> <span className="mono">{created.password}</span></div>
                  {created.id && <div><strong>ID:</strong> <span className="mono">{created.id}</span></div>}
                </div>
              </div>

              <div className="cc-actions">
                <button className="btn primary" onClick={copyCredentials}>Copy credentials</button>
                <button className="btn ghost" onClick={() => setCreated(null)}>Done</button>
              </div>
            </div>
          )}
        </main>

        <aside className="right">
          <div className="info-card">
            <h4>Manager tools</h4>
            <ul>
              <li>Generated password is temporary — advise employee to change it.</li>
              <li>Username should be unique and lowercase.</li>
              <li>You can create multiple employees quickly with Generate + Create.</li>
            </ul>
          </div>

          <div className="visual-card">
            <div className="glow" />
            <div className="visual-title">Secure by default</div>
            <p className="muted">Passwords are generated client-side. Use a secure channel to share credentials.</p>
          </div>
        </aside>
      </div>

      {/* Toast */}
      <div className={`toast ${toastVisible ? "show" : ""}`} role="status" aria-live="polite">
        <div className="toast-content">
          <div>Credentials ready to share</div>
          <div className="toast-actions">
            <button className="btn ghost tiny" onClick={copyCredentials}>Copy</button>
            <button className="btn ghost tiny" onClick={() => setToastVisible(false)}>Close</button>
          </div>
        </div>
      </div>

      <style>{`
/* Layout */
.add-employee-modern { padding-bottom: 28px; }
.grid { display:grid; grid-template-columns: 1fr 320px; gap:20px; align-items:start; }
.left .header { margin-bottom:12px; }
.title { font-size:22px; font-weight:800; color: #0f172a; }
.subtitle { font-size:13px; color:#64748b; margin-top:6px; }

/* Card / form */
.card.form { padding:18px; border-radius:14px; background: linear-gradient(180deg, rgba(255,255,255,0.96), rgba(250,250,255,0.98)); border:1px solid rgba(15,23,42,0.04); box-shadow: 0 14px 40px rgba(16,24,40,0.06); }
.row { display:flex; gap:12px; margin-bottom:12px; }
.field { flex:1; display:flex; flex-direction:column; gap:8px; }
.label { font-weight:700; color:#0b1220; font-size:13px; }
input { padding:10px 12px; border-radius:10px; border:1px solid rgba(15,23,42,0.06); background:white; font-size:14px; outline:none; transition: box-shadow .18s ease, border-color .18s ease; }
input:focus { box-shadow: 0 10px 30px rgba(99,102,241,0.06); border-color:#7c3aed; }

/* pw row */
.pw-row { display:flex; gap:8px; align-items:center; }
.pw-actions { display:flex; gap:8px; }
.btn { padding:8px 12px; border-radius:10px; font-weight:700; cursor:pointer; border: none; }
.btn.primary { background: linear-gradient(90deg,#7c3aed,#0ea5e9); color:white; box-shadow: 0 10px 28px rgba(99,102,241,0.12); }
.btn.ghost { background:transparent; border:1px solid rgba(15,23,42,0.06); color:#0f172a; }
.btn.tiny { padding:6px 8px; font-size:13px; border-radius:8px; }
.icon-btn { padding:8px 10px; border-radius:10px; border:1px solid rgba(15,23,42,0.06); background:transparent; cursor:pointer; }

/* pw strength */
.pw-meta { display:flex; align-items:center; gap:12px; margin-top:8px; }
.strength { width:130px; height:8px; background: linear-gradient(90deg, rgba(15,23,42,0.04), rgba(15,23,42,0.02)); border-radius:8px; overflow:hidden; }
.strength .bar { height:100%; background: linear-gradient(90deg,#f97316,#7c3aed); transition: width 400ms cubic-bezier(.2,.9,.2,1); }
.strength-label { font-size:13px; color:#334155; font-weight:700; }

/* hints */
.hint .muted { color:#94a3b8; font-size:13px; }

/* actions */
.actions { display:flex; gap:10px; margin-top:8px; justify-content:flex-start; }

/* created card */
.created-card { margin-top:12px; padding:12px; border-radius:12px; background: linear-gradient(180deg,#ffffff,#fbfdff); border:1px solid rgba(15,23,42,0.04); display:flex; justify-content:space-between; align-items:center; gap:12px; box-shadow: 0 10px 30px rgba(16,24,40,0.04); }
.created-card .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", monospace; background:#f8fafc; padding:4px 8px; border-radius:8px; }

/* right side */
.right { display:flex; flex-direction:column; gap:12px; }
.info-card, .visual-card { padding:16px; border-radius:12px; background: linear-gradient(180deg,#fff,#fbfdff); border:1px solid rgba(15,23,42,0.04); box-shadow: 0 10px 30px rgba(16,24,40,0.04); }
.info-card h4 { margin:0 0 8px; }
.info-card ul { margin:0; padding-left:18px; color:#475569; }
.visual-card { position:relative; overflow:hidden; display:flex; flex-direction:column; gap:8px; }
.visual-card .glow { position:absolute; right:-40px; top:-40px; width:220px; height:220px; background: radial-gradient(circle at 30% 30%, rgba(124,58,237,0.14), transparent 30%); transform: rotate(12deg); pointer-events:none; }
.visual-title { font-weight:800; color:#0f172a; }

/* toast */
.toast { position: fixed; right: 20px; bottom: 20px; transform: translateY(14px) scale(.98); opacity:0; pointer-events:none; transition: all 240ms ease; z-index: 60; }
.toast.show { transform: translateY(0) scale(1); opacity:1; pointer-events:auto; }
.toast .toast-content { padding:12px 14px; border-radius:12px; background: linear-gradient(90deg,#0ea5e9,#7c3aed); color:white; display:flex; gap:12px; align-items:center; justify-content:space-between; min-width:220px; box-shadow: 0 12px 36px rgba(12,18,40,0.16); }
.toast .toast-actions { display:flex; gap:8px; }

/* form error */
.form-error { margin-top:12px; background:#fff1f2; color:#9f1239; padding:8px 10px; border-radius:10px; border:1px solid #fecaca; }

/* responsive */
@media (max-width: 980px) {
  .grid { grid-template-columns: 1fr; }
  .right { order: 2; }
  .left { order: 1; }
}
      `}</style>
    </div>
  );
}
    