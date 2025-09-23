
/**
 * Settings page (dynamic)
 * - Update profile (name)
 * - Change password (oldPassword -> newPassword)
 * - Notification preferences (client-side store + server save)
 * - Theme toggle (persist to localStorage and add body class)
 * - Export data (download JSON)
 * - Delete account (confirmed)
 *
 * Expects backend endpoints:
 * - PATCH /api/auth/profile       { name }
 * - POST  /api/auth/change-password { oldPassword, newPassword }
 * - POST  /api/preferences        { notifications: { email:true } }  (optional)
 * - GET   /api/auth/me            (optional refresh)
 * - DELETE /api/auth/me
 *
 * Uses apiFetch from AuthProvider which attaches auth token.
 */

// export default function Settings() {
//   const { user, apiFetch, logout } = useAuth();
//   const navigate = useNavigate();

//   // Profile
//   const [name, setName] = useState(user?.name || "");
//   const [username] = useState(user?.username || user?.name || "");
//   const [savingProfile, setSavingProfile] = useState(false);

//   // Password
//   const [oldPassword, setOldPassword] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [changing, setChanging] = useState(false);

//   // Preferences
//   const [prefs, setPrefs] = useState({
//     emailNotifications: true,
//   });
//   const [savingPrefs, setSavingPrefs] = useState(false);

//   // Theme
//   const [theme, setTheme] = useState(() => localStorage.getItem("lm_theme") || "light");

//   useEffect(() => {
//     // sync user.name into field if user changes
//     setName(user?.name || "");
//   }, [user?.name]);

//   useEffect(() => {
//     document.documentElement.dataset.theme = theme;
//     if (theme === "dark") document.body.classList.add("theme-dark");
//     else document.body.classList.remove("theme-dark");
//     localStorage.setItem("lm_theme", theme);
//   }, [theme]);

//   // load preferences from server (optional)
//   useEffect(() => {
//     let mounted = true;
//     (async () => {
//       try {
//         const res = await apiFetch("/api/preferences");
//         if (!mounted) return;
//         if (res && res.notifications) {
//           setPrefs({ emailNotifications: !!res.notifications.email });
//         }
//       } catch (e) {
//         // ignore if endpoint not present
//       }
//     })();
//     return () => { mounted = false; };
//   }, [apiFetch]);

//   // Profile save
//   async function saveProfile(e) {
//     e.preventDefault();
//     setSavingProfile(true);
//     try {
//       const payload = { name: name.trim() };
//       await apiFetch("/api/auth/profile", { method: "PATCH", body: JSON.stringify(payload) });
//       toast.success("Profile updated");
//       // optionally refresh user info in AuthProvider - if your AuthProvider exposes a refresh function call it here.
//     } catch (err) {
//       console.error("Save profile error", err);
//       toast.error(err?.message || "Failed to update profile");
//     } finally {
//       setSavingProfile(false);
//     }
//   }

//   // Change password
//   async function changePassword(e) {
//     e.preventDefault();
//     if (!oldPassword || !newPassword) return toast.error("Enter old and new password");
//     if (newPassword !== confirmPassword) return toast.error("New passwords do not match");
//     if (newPassword.length < 6) return toast.error("New password must be at least 6 characters");

//     setChanging(true);
//     try {
//       await apiFetch("/api/auth/change-password", {
//         method: "POST",
//         body: JSON.stringify({ oldPassword, newPassword })
//       });
//       toast.success("Password changed — please sign in again");
//       // log out the user to force re-login
//       setTimeout(() => {
//         logout();
//         navigate("/login", { replace: true });
//       }, 900);
//     } catch (err) {
//       console.error("Change pwd error", err);
//       toast.error(err?.message || "Failed to change password");
//     } finally {
//       setChanging(false);
//       setOldPassword("");
//       setNewPassword("");
//       setConfirmPassword("");
//     }
//   }

//   // Save preferences (server-side optional)
//   async function savePrefs() {
//     setSavingPrefs(true);
//     try {
//       await apiFetch("/api/preferences", { method: "POST", body: JSON.stringify({ notifications: { email: prefs.emailNotifications } }) });
//       toast.success("Preferences saved");
//     } catch (err) {
//       console.warn("Save prefs error", err);
//       toast.error("Failed to save preferences (server may not support it)");
//     } finally {
//       setSavingPrefs(false);
//     }
//   }

//   // Export user data (client triggers API then downloads)
//   async function exportData() {
//     toast.loading("Preparing export...");
//     try {
//       const data = await apiFetch("/api/export"); // optional endpoint - fallback: create client side
//       if (data) {
//         const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
//         const url = URL.createObjectURL(blob);
//         const a = document.createElement("a");
//         a.href = url;
//         a.download = `leave-manager-export-${user?.username || "me"}-${new Date().toISOString().slice(0,10)}.json`;
//         a.click();
//         URL.revokeObjectURL(url);
//       } else {
//         toast.error("Export endpoint not available");
//       }
//       toast.dismiss();
//       toast.success("Export ready");
//     } catch (err) {
//       toast.dismiss();
//       console.error("Export failed", err);
//       toast.error("Export failed");
//     }
//   }

//   // Delete account
//   async function deleteAccount() {
//     const ok = confirm("This will permanently delete your account and all personal data. This cannot be undone. Type DELETE to confirm.");
//     const typed = ok ? prompt("Type DELETE to confirm deletion") : null;
//     if (!typed || typed !== "DELETE") return toast("Cancelled");
//     try {
//       await apiFetch("/api/auth/me", { method: "DELETE" });
//       toast.success("Account deleted");
//       // redirect to signup or homepage
//       setTimeout(() => {
//         logout();
//         navigate("/login", { replace: true });
//       }, 800);
//     } catch (err) {
//       console.error("Delete account error", err);
//       toast.error(err?.message || "Failed to delete account");
//     }
//   }

//   return (
//     <div className="page settings-page">
//       <div className="page-header">
//         <h2>Settings</h2>
//         <p className="muted">Manage your profile, password, preferences and account.</p>
//       </div>

//       <div className="settings-grid">
//         <section className="card">
//           <h3>Profile</h3>
//           <form onSubmit={saveProfile} className="form">
//             <label>
//               <div className="label">Username</div>
//               <input value={username} disabled />
//               <small className="muted">Username cannot be changed here.</small>
//             </label>

//             <label>
//               <div className="label">Display name</div>
//               <input value={name} onChange={(e) => setName(e.target.value)} />
//             </label>

//             <div className="actions">
//               <button className="btn primary" disabled={savingProfile}>{savingProfile ? "Saving…" : "Save profile"}</button>
//             </div>
//           </form>
//         </section>

//         <section className="card">
//           <h3>Change password</h3>
//           <form onSubmit={changePassword} className="form">
//             <label>
//               <div className="label">Current password</div>
//               <input value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} type="password" />
//             </label>

//             <label>
//               <div className="label">New password</div>
//               <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password" />
//             </label>

//             <label>
//               <div className="label">Confirm new password</div>
//               <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" />
//             </label>

//             <div className="hint muted">After successful password change you'll be signed out.</div>

//             <div className="actions">
//               <button className="btn primary" disabled={changing}>{changing ? "Changing…" : "Change password"}</button>
//             </div>
//           </form>
//         </section>

//         <section className="card">
//           <h3>Preferences</h3>
//           <div className="form">
//             <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//               <div>
//                 <div className="label">Email notifications</div>
//                 <div className="muted">Receive email summaries and alerts.</div>
//               </div>
//               <input type="checkbox" checked={prefs.emailNotifications} onChange={(e) => setPrefs(p => ({ ...p, emailNotifications: e.target.checked }))} />
//             </label>

//             <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
//               <div>
//                 <div className="label">Theme</div>
//                 <div className="muted">Switch between light and dark theme.</div>
//               </div>
//               <div>
//                 <button type="button" className="btn ghost tiny" onClick={() => setTheme(t => t === "light" ? "dark" : "light")}>
//                   {theme === "light" ? "Switch to dark" : "Switch to light"}
//                 </button>
//               </div>
//             </label>

//             <div style={{ marginTop: 12 }} className="actions">
//               <button className="btn primary" disabled={savingPrefs} onClick={savePrefs}>{savingPrefs ? "Saving…" : "Save preferences"}</button>
//             </div>
//           </div>
//         </section>

//         <section className="card danger">
//           <h3>Account</h3>
//           <div className="form">
//             <div className="muted">Export your personal data or delete your account.</div>

//             <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
//               <button className="btn ghost" onClick={exportData}>Export data</button>
//               <button className="btn" onClick={() => { navigator.clipboard?.writeText(user?.username || ""); toast.success("Username copied"); }}>Copy username</button>
//               <button className="btn primary" onClick={() => { toast.success("Coming soon: account transfer") }}>Transfer account</button>
//             </div>

//             <hr style={{ margin: "12px 0", border: "none", borderTop: "1px solid rgba(15,23,42,0.04)" }} />

//             <div className="muted">Delete your account permanently</div>
//             <div style={{ marginTop: 8 }}>
//               <button className="btn ghost" onClick={deleteAccount} style={{ background: "#fff1f2", borderColor: "#fecaca" }}>Delete account</button>
//             </div>
//           </div>
//         </section>
//       </div>

//       <style>{`
//         .settings-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
//         .card { padding: 16px; border-radius: 12px; background: linear-gradient(180deg,#fff,#fbfdff); border:1px solid rgba(15,23,42,0.04); box-shadow: 0 10px 30px rgba(12,18,40,0.04); }
//         .card.danger { background: linear-gradient(180deg,#fff7f7,#fff) }
//         .form { display:flex; flex-direction:column; gap:10px; }
//         label { display:flex; flex-direction:column; gap:6px; }
//         .label { font-weight:700; color:#0b1220; font-size:13px; }
//         input[type="text"], input[type="password"], select, textarea { padding:10px 12px; border-radius:10px; border:1px solid rgba(15,23,42,0.06); font-size:14px; }
//         .muted { color:#64748b; font-size:13px; }
//         .hint { font-size: 13px; color: #475569; }
//         .actions { margin-top:8px; display:flex; gap:8px; }
//         .btn { padding:8px 12px; border-radius:10px; font-weight:700; cursor:pointer; border:none; }
//         .btn.primary { background: linear-gradient(90deg,#7c3aed,#0ea5e9); color:white; }
//         .btn.ghost { background:transparent; border:1px solid rgba(15,23,42,0.06); }
//         .btn.tiny { padding:6px 8px; font-size:13px; border-radius:8px; }
//         hr { opacity: 0.6 }
//         @media (max-width: 980px) {
//           .settings-grid { grid-template-columns: 1fr; }
//         }
//       `}</style>
//     </div>
//   );
// }



// src/pages/Settings.jsx
// import React, { useEffect, useState } from "react";
// import { useAuth } from "../auth/AuthProvider";
// import { useNavigate } from "react-router-dom";
// import toast from "react-hot-toast";

// /**
//  * Settings page
//  */

// export default function Settings() {
//   const { user, apiFetch, logout } = useAuth();
//   const navigate = useNavigate();

//   // Profile
//   const [name, setName] = useState(user?.name || "");
//   const [username] = useState(user?.username || user?.name || "");
//   const [savingProfile, setSavingProfile] = useState(false);

//   // Password
//   const [oldPassword, setOldPassword] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [changing, setChanging] = useState(false);

//   // Preferences
//   const [prefs, setPrefs] = useState({
//     emailNotifications: true,
//   });
//   const [savingPrefs, setSavingPrefs] = useState(false);

//   // Theme
//   const [theme, setTheme] = useState(() => localStorage.getItem("lm_theme") || "light");

//   useEffect(() => {
//     setName(user?.name || "");
//   }, [user?.name]);

//   useEffect(() => {
//     document.documentElement.dataset.theme = theme;
//     if (theme === "dark") document.body.classList.add("theme-dark");
//     else document.body.classList.remove("theme-dark");
//     localStorage.setItem("lm_theme", theme);
//   }, [theme]);

//   // load preferences from server (optional)
//   useEffect(() => {
//     let mounted = true;
//     (async () => {
//       try {
//         const res = await apiFetch("/api/preferences");
//         if (!mounted) return;
//         if (res && res.notifications) {
//           setPrefs({ emailNotifications: !!res.notifications.email });
//         }
//       } catch (e) {
//         // ignore if endpoint not present
//       }
//     })();
//     return () => { mounted = false; };
//   }, [apiFetch]);

//   // Profile save
//   async function saveProfile(e) {
//     e.preventDefault();
//     setSavingProfile(true);
//     try {
//       const payload = { name: name.trim() };
//       await apiFetch("/api/auth/profile", { method: "PATCH", body: JSON.stringify(payload) });
//       toast.success("Profile updated");
//     } catch (err) {
//       console.error("Save profile error", err);
//       toast.error(err?.message || "Failed to update profile");
//     } finally {
//       setSavingProfile(false);
//     }
//   }

//   // Change password - improved
//   async function changePassword(e) {
//     e.preventDefault();

//     // client-side validation
//     if (!oldPassword || !newPassword) {
//       return toast.error("Enter current and new password");
//     }
//     if (newPassword !== confirmPassword) {
//       return toast.error("New passwords do not match");
//     }
//     if (newPassword.length < 6) {
//       return toast.error("New password must be at least 6 characters");
//     }

//     setChanging(true);
//     try {
//       // apiFetch will attach Authorization header and Content-Type
//       await apiFetch("/api/auth/change-password", {
//         method: "POST",
//         body: JSON.stringify({ oldPassword, newPassword })
//       });

//       toast.success("Password changed — you'll be signed out to re-authenticate");

//       // Immediately log out and navigate to login
//       logout();
//       navigate("/login", { replace: true });

//     } catch (err) {
//       console.error("Change pwd error", err);

//       // If apiFetch threw a response-like error with body, it should be on err.body
//       if (err && err.body && (err.body.message || err.body.error)) {
//         return toast.error(err.body.message || err.body.error);
//       }

//       toast.error(err?.message || "Failed to change password");
//     } finally {
//       setChanging(false);
//       setOldPassword("");
//       setNewPassword("");
//       setConfirmPassword("");
//     }
//   }

//   // Save preferences (server-side optional)
//   async function savePrefs() {
//     setSavingPrefs(true);
//     try {
//       await apiFetch("/api/preferences", { method: "POST", body: JSON.stringify({ notifications: { email: prefs.emailNotifications } }) });
//       toast.success("Preferences saved");
//     } catch (err) {
//       console.warn("Save prefs error", err);
//       toast.error("Failed to save preferences (server may not support it)");
//     } finally {
//       setSavingPrefs(false);
//     }
//   }

//   // Export user data (client triggers API then downloads)
//   async function exportData() {
//     toast.loading("Preparing export...");
//     try {
//       const data = await apiFetch("/api/export"); // optional endpoint - fallback: create client side
//       if (data) {
//         const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
//         const url = URL.createObjectURL(blob);
//         const a = document.createElement("a");
//         a.href = url;
//         a.download = `leave-manager-export-${user?.username || "me"}-${new Date().toISOString().slice(0,10)}.json`;
//         a.click();
//         URL.revokeObjectURL(url);
//         toast.dismiss();
//         toast.success("Export ready");
//       } else {
//         toast.dismiss();
//         toast.error("Export endpoint not available");
//       }
//     } catch (err) {
//       toast.dismiss();
//       console.error("Export failed", err);
//       toast.error("Export failed");
//     }
//   }

//   // Delete account
//   async function deleteAccount() {
//     const ok = confirm("This will permanently delete your account and all personal data. This cannot be undone. Type DELETE to confirm.");
//     const typed = ok ? prompt("Type DELETE to confirm deletion") : null;
//     if (!typed || typed !== "DELETE") return toast("Cancelled");
//     try {
//       await apiFetch("/api/auth/me", { method: "DELETE" });
//       toast.success("Account deleted");
//       logout();
//       navigate("/login", { replace: true });
//     } catch (err) {
//       console.error("Delete account error", err);
//       toast.error(err?.message || "Failed to delete account");
//     }
//   }

//   return (
//     <div className="page settings-page">
//       <div className="page-header">
//         <h2>Settings</h2>
//         <p className="muted">Manage your profile, password, preferences and account.</p>
//       </div>

//       <div className="settings-grid">
//         <section className="card">
//           <h3>Profile</h3>
//           <form onSubmit={saveProfile} className="form">
//             <label>
//               <div className="label">Username</div>
//               <input value={username} disabled />
//               <small className="muted">Username cannot be changed here.</small>
//             </label>

//             <label>
//               <div className="label">Display name</div>
//               <input value={name} onChange={(e) => setName(e.target.value)} />
//             </label>

//             <div className="actions">
//               <button className="btn primary" disabled={savingProfile}>{savingProfile ? "Saving…" : "Save profile"}</button>
//             </div>
//           </form>
//         </section>

//         <section className="card">
//           <h3>Change password</h3>
//           <form onSubmit={changePassword} className="form">
//             <label>
//               <div className="label">Current password</div>
//               <input value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} type="password" />
//             </label>

//             <label>
//               <div className="label">New password</div>
//               <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password" />
//             </label>

//             <label>
//               <div className="label">Confirm new password</div>
//               <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" />
//             </label>

//             <div className="hint muted">After successful password change you'll be signed out.</div>

//             <div className="actions">
//               <button className="btn primary" disabled={changing}>{changing ? "Changing…" : "Change password"}</button>
//             </div>
//           </form>
//         </section>

//         <section className="card">
//           <h3>Preferences</h3>
//           <div className="form">
//             <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//               <div>
//                 <div className="label">Email notifications</div>
//                 <div className="muted">Receive email summaries and alerts.</div>
//               </div>
//               <input type="checkbox" checked={prefs.emailNotifications} onChange={(e) => setPrefs(p => ({ ...p, emailNotifications: e.target.checked }))} />
//             </label>

//             <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
//               <div>
//                 <div className="label">Theme</div>
//                 <div className="muted">Switch between light and dark theme.</div>
//               </div>
//               <div>
//                 <button type="button" className="btn ghost tiny" onClick={() => setTheme(t => t === "light" ? "dark" : "light")}>
//                   {theme === "light" ? "Switch to dark" : "Switch to light"}
//                 </button>
//               </div>
//             </label>

//             <div style={{ marginTop: 12 }} className="actions">
//               <button className="btn primary" disabled={savingPrefs} onClick={savePrefs}>{savingPrefs ? "Saving…" : "Save preferences"}</button>
//             </div>
//           </div>
//         </section>

//         <section className="card danger">
//           <h3>Account</h3>
//           <div className="form">
//             <div className="muted">Export your personal data or delete your account.</div>

//             <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
//               <button className="btn ghost" onClick={exportData}>Export data</button>
//               <button className="btn" onClick={() => { navigator.clipboard?.writeText(user?.username || ""); toast.success("Username copied"); }}>Copy username</button>
//               <button className="btn primary" onClick={() => { toast.success("Coming soon: account transfer") }}>Transfer account</button>
//             </div>

//             <hr style={{ margin: "12px 0", border: "none", borderTop: "1px solid rgba(15,23,42,0.04)" }} />

//             <div className="muted">Delete your account permanently</div>
//             <div style={{ marginTop: 8 }}>
//               <button className="btn ghost" onClick={deleteAccount} style={{ background: "#fff1f2", borderColor: "#fecaca" }}>Delete account</button>
//             </div>
//           </div>
//         </section>
//       </div>

//       <style>{`
//         .settings-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
//         .card { padding: 16px; border-radius: 12px; background: linear-gradient(180deg,#fff,#fbfdff); border:1px solid rgba(15,23,42,0.04); box-shadow: 0 10px 30px rgba(12,18,40,0.04); }
//         .card.danger { background: linear-gradient(180deg,#fff7f7,#fff) }
//         .form { display:flex; flex-direction:column; gap:10px; }
//         label { display:flex; flex-direction:column; gap:6px; }
//         .label { font-weight:700; color:#0b1220; font-size:13px; }
//         input[type="text"], input[type="password"], select, textarea { padding:10px 12px; border-radius:10px; border:1px solid rgba(15,23,42,0.06); font-size:14px; }
//         .muted { color:#64748b; font-size:13px; }
//         .hint { font-size: 13px; color: #475569; }
//         .actions { margin-top:8px; display:flex; gap:8px; }
//         .btn { padding:8px 12px; border-radius:10px; font-weight:700; cursor:pointer; border:none; }
//         .btn.primary { background: linear-gradient(90deg,#7c3aed,#0ea5e9); color:white; }
//         .btn.ghost { background:transparent; border:1px solid rgba(15,23,42,0.06); }
//         .btn.tiny { padding:6px 8px; font-size:13px; border-radius:8px; }
//         hr { opacity: 0.6 }
//         @media (max-width: 980px) {
//           .settings-grid { grid-template-columns: 1fr; }
//         }
//       `}</style>
//     </div>
//   );
// }


// src/pages/Settings.jsx
// import React, { useEffect, useState } from "react";
// import { useAuth } from "../auth/AuthProvider";
// import { useNavigate } from "react-router-dom";
// import toast from "react-hot-toast";

// /**
//  * Settings page
//  * - Profile (PATCH /api/auth/profile)
//  * - Change password (POST /api/auth/change-password)
//  * - Preferences (POST /api/preferences) - optional
//  * - Export, copy username, transfer (UI), delete account (DELETE /api/auth/me)
//  *
//  * Note: overwrite the entire file to avoid duplicate imports / declarations.
//  */

// export default function Settings() {
//   const { user, apiFetch, logout } = useAuth();
//   const navigate = useNavigate();

//   // Profile
//   const [name, setName] = useState(user?.name || "");
//   const [username] = useState(user?.username || user?.name || "");
//   const [savingProfile, setSavingProfile] = useState(false);

//   // Password
//   const [oldPassword, setOldPassword] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [changing, setChanging] = useState(false);

//   // Preferences
//   const [prefs, setPrefs] = useState({
//     emailNotifications: true,
//   });
//   const [savingPrefs, setSavingPrefs] = useState(false);

//   // Theme
//   const [theme, setTheme] = useState(() => localStorage.getItem("lm_theme") || "light");

//   useEffect(() => {
//     setName(user?.name || "");
//   }, [user?.name]);

//   useEffect(() => {
//     document.documentElement.dataset.theme = theme;
//     if (theme === "dark") document.body.classList.add("theme-dark");
//     else document.body.classList.remove("theme-dark");
//     localStorage.setItem("lm_theme", theme);
//   }, [theme]);

//   // load preferences from server (optional)
//   useEffect(() => {
//     let mounted = true;
//     (async () => {
//       try {
//         const res = await apiFetch("/api/preferences");
//         if (!mounted) return;
//         if (res && res.notifications) {
//           setPrefs({ emailNotifications: !!res.notifications.email });
//         }
//       } catch (e) {
//         // endpoint optional - ignore
//       }
//     })();
//     return () => { mounted = false; };
//   }, [apiFetch]);

//   // Profile save
//   async function saveProfile(e) {
//     e.preventDefault();
//     setSavingProfile(true);
//     try {
//       const payload = { name: name.trim() };
//       await apiFetch("/api/auth/profile", { method: "PATCH", body: JSON.stringify(payload) });
//       toast.success("Profile updated");
//     } catch (err) {
//       console.error("Save profile error", err);
//       toast.error(err?.message || "Failed to update profile");
//     } finally {
//       setSavingProfile(false);
//     }
//   }

//   // Change password
//   async function changePassword(e) {
//     e.preventDefault();

//     if (!oldPassword || !newPassword) return toast.error("Enter current and new password");
//     if (newPassword !== confirmPassword) return toast.error("New passwords do not match");
//     if (newPassword.length < 6) return toast.error("New password must be at least 6 characters");

//     setChanging(true);
//     try {
//       const resp = await apiFetch("/api/auth/change-password", {
//         method: "POST",
//         body: JSON.stringify({ oldPassword, newPassword })
//       });

//       // On success, server returns { ok: true } or { ok: true, message: 'Password changed' }
//       toast.success((resp && resp.message) ? resp.message : "Password changed — please sign in again");

//       // Immediately log out and redirect to login
//       logout();
//       navigate("/login", { replace: true });
//     } catch (err) {
//       console.error("Change pwd error", err);
//       // apiFetch sets err.body for JSON error responses
//       if (err && err.body && (err.body.message || err.body.error)) {
//         return toast.error(err.body.message || err.body.error);
//       }
//       toast.error(err?.message || "Failed to change password");
//     } finally {
//       setChanging(false);
//       setOldPassword("");
//       setNewPassword("");
//       setConfirmPassword("");
//     }
//   }

//   // Save preferences (server-side optional)
//   async function savePrefs() {
//     setSavingPrefs(true);
//     try {
//       await apiFetch("/api/preferences", { method: "POST", body: JSON.stringify({ notifications: { email: prefs.emailNotifications } }) });
//       toast.success("Preferences saved");
//     } catch (err) {
//       console.warn("Save prefs error", err);
//       toast.error("Failed to save preferences (server may not support it)");
//     } finally {
//       setSavingPrefs(false);
//     }
//   }

//   // Export user data (client triggers API then downloads)
//   async function exportData() {
//     toast.loading("Preparing export...");
//     try {
//       const data = await apiFetch("/api/export");
//       if (data) {
//         const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
//         const url = URL.createObjectURL(blob);
//         const a = document.createElement("a");
//         a.href = url;
//         a.download = `leave-manager-export-${user?.username || "me"}-${new Date().toISOString().slice(0,10)}.json`;
//         a.click();
//         URL.revokeObjectURL(url);
//         toast.dismiss();
//         toast.success("Export ready");
//       } else {
//         toast.dismiss();
//         toast.error("Export endpoint not available");
//       }
//     } catch (err) {
//       toast.dismiss();
//       console.error("Export failed", err);
//       toast.error("Export failed");
//     }
//   }

//   // Delete account
//   async function deleteAccount() {
//     const ok = confirm("This will permanently delete your account and all personal data. This cannot be undone. Type DELETE to confirm.");
//     const typed = ok ? prompt("Type DELETE to confirm deletion") : null;
//     if (!typed || typed !== "DELETE") return toast("Cancelled");
//     try {
//       await apiFetch("/api/auth/me", { method: "DELETE" });
//       toast.success("Account deleted");
//       logout();
//       navigate("/login", { replace: true });
//     } catch (err) {
//       console.error("Delete account error", err);
//       toast.error(err?.message || "Failed to delete account");
//     }
//   }

//   return (
//     <div className="page settings-page">
//       <div className="page-header">
//         <h2>Settings</h2>
//         <p className="muted">Manage your profile, password, preferences and account.</p>
//       </div>

//       <div className="settings-grid">
//         <section className="card">
//           <h3>Profile</h3>
//           <form onSubmit={saveProfile} className="form">
//             <label>
//               <div className="label">Username</div>
//               <input value={username} disabled />
//               <small className="muted">Username cannot be changed here.</small>
//             </label>

//             <label>
//               <div className="label">Display name</div>
//               <input value={name} onChange={(e) => setName(e.target.value)} />
//             </label>

//             <div className="actions">
//               <button className="btn primary" disabled={savingProfile}>{savingProfile ? "Saving…" : "Save profile"}</button>
//             </div>
//           </form>
//         </section>

//         <section className="card">
//           <h3>Change password</h3>
//           <form onSubmit={changePassword} className="form">
//             <label>
//               <div className="label">Current password</div>
//               <input value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} type="password" />
//             </label>

//             <label>
//               <div className="label">New password</div>
//               <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password" />
//             </label>

//             <label>
//               <div className="label">Confirm new password</div>
//               <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" />
//             </label>

//             <div className="hint muted">After successful password change you'll be signed out.</div>

//             <div className="actions">
//               <button className="btn primary" disabled={changing}>{changing ? "Changing…" : "Change password"}</button>
//             </div>
//           </form>
//         </section>

//         <section className="card">
//           <h3>Preferences</h3>
//           <div className="form">
//             <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//               <div>
//                 <div className="label">Email notifications</div>
//                 <div className="muted">Receive email summaries and alerts.</div>
//               </div>
//               <input type="checkbox" checked={prefs.emailNotifications} onChange={(e) => setPrefs(p => ({ ...p, emailNotifications: e.target.checked }))} />
//             </label>

//             <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
//               <div>
//                 <div className="label">Theme</div>
//                 <div className="muted">Switch between light and dark theme.</div>
//               </div>
//               <div>
//                 <button type="button" className="btn ghost tiny" onClick={() => setTheme(t => t === "light" ? "dark" : "light")}>
//                   {theme === "light" ? "Switch to dark" : "Switch to light"}
//                 </button>
//               </div>
//             </label>

//             <div style={{ marginTop: 12 }} className="actions">
//               <button className="btn primary" disabled={savingPrefs} onClick={savePrefs}>{savingPrefs ? "Saving…" : "Save preferences"}</button>
//             </div>
//           </div>
//         </section>

//         <section className="card danger">
//           <h3>Account</h3>
//           <div className="form">
//             <div className="muted">Export your personal data or delete your account.</div>

//             <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
//               <button className="btn ghost" onClick={exportData}>Export data</button>
//               <button className="btn" onClick={() => { navigator.clipboard?.writeText(user?.username || ""); toast.success("Username copied"); }}>Copy username</button>
//               <button className="btn primary" onClick={() => { toast.success("Coming soon: account transfer") }}>Transfer account</button>
//             </div>

//             <hr style={{ margin: "12px 0", border: "none", borderTop: "1px solid rgba(15,23,42,0.04)" }} />

//             <div className="muted">Delete your account permanently</div>
//             <div style={{ marginTop: 8 }}>
//               <button className="btn ghost" onClick={deleteAccount} style={{ background: "#fff1f2", borderColor: "#fecaca" }}>Delete account</button>
//             </div>
//           </div>
//         </section>
//       </div>

//       <style>{`
//         .settings-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
//         .card { padding: 16px; border-radius: 12px; background: linear-gradient(180deg,#fff,#fbfdff); border:1px solid rgba(15,23,42,0.04); box-shadow: 0 10px 30px rgba(12,18,40,0.04); }
//         .card.danger { background: linear-gradient(180deg,#fff7f7,#fff) }
//         .form { display:flex; flex-direction:column; gap:10px; }
//         label { display:flex; flex-direction:column; gap:6px; }
//         .label { font-weight:700; color:#0b1220; font-size:13px; }
//         input[type="text"], input[type="password"], select, textarea { padding:10px 12px; border-radius:10px; border:1px solid rgba(15,23,42,0.06); font-size:14px; }
//         .muted { color:#64748b; font-size:13px; }
//         .hint { font-size: 13px; color: #475569; }
//         .actions { margin-top:8px; display:flex; gap:8px; }
//         .btn { padding:8px 12px; border-radius:10px; font-weight:700; cursor:pointer; border:none; }
//         .btn.primary { background: linear-gradient(90deg,#7c3aed,#0ea5e9); color:white; }
//         .btn.ghost { background:transparent; border:1px solid rgba(15,23,42,0.06); }
//         .btn.tiny { padding:6px 8px; font-size:13px; border-radius:8px; }
//         hr { opacity: 0.6 }
//         @media (max-width: 980px) {
//           .settings-grid { grid-template-columns: 1fr; }
//         }
//       `}</style>
//     </div>
//   );
// }


// src/pages/Settings.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

/**
 * Settings page
 * - Profile (PATCH /api/auth/profile)
 * - Change password (POST /api/auth/change-password)
 * - Preferences (POST /api/preferences) - optional
 * - Export, copy username, transfer (UI), delete account (DELETE /api/auth/me)
 *
 * This version replaces native confirm/prompt with an in-app modal for account deletion.
 */

export default function Settings() {
  const { user, apiFetch, logout } = useAuth();
  const navigate = useNavigate();

  // Profile
  const [name, setName] = useState(user?.name || "");
  const [username] = useState(user?.username || user?.name || "");
  const [savingProfile, setSavingProfile] = useState(false);

  // Password
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changing, setChanging] = useState(false);

  // Preferences
  const [prefs, setPrefs] = useState({
    emailNotifications: true,
  });
  const [savingPrefs, setSavingPrefs] = useState(false);

  // Theme
  const [theme, setTheme] = useState(() => localStorage.getItem("lm_theme") || "light");

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setName(user?.name || "");
  }, [user?.name]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    if (theme === "dark") document.body.classList.add("theme-dark");
    else document.body.classList.remove("theme-dark");
    localStorage.setItem("lm_theme", theme);
  }, [theme]);

  // load preferences from server (optional)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await apiFetch("/api/preferences");
        if (!mounted) return;
        if (res && res.notifications) {
          setPrefs({ emailNotifications: !!res.notifications.email });
        }
      } catch (e) {
        // endpoint optional - ignore
      }
    })();
    return () => { mounted = false; };
  }, [apiFetch]);

  // Profile save
  async function saveProfile(e) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const payload = { name: name.trim() };
      await apiFetch("/api/auth/profile", { method: "PATCH", body: JSON.stringify(payload) });
      toast.success("Profile updated");
    } catch (err) {
      console.error("Save profile error", err);
      toast.error(err?.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  }

  // Change password
  async function changePassword(e) {
    e.preventDefault();

    if (!oldPassword || !newPassword) return toast.error("Enter current and new password");
    if (newPassword !== confirmPassword) return toast.error("New passwords do not match");
    if (newPassword.length < 6) return toast.error("New password must be at least 6 characters");

    setChanging(true);
    try {
      const resp = await apiFetch("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ oldPassword, newPassword })
      });

      toast.success((resp && resp.message) ? resp.message : "Password changed — please sign in again");

      logout();
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Change pwd error", err);
      if (err && err.body && (err.body.message || err.body.error)) {
        return toast.error(err.body.message || err.body.error);
      }
      toast.error(err?.message || "Failed to change password");
    } finally {
      setChanging(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  }

  // Save preferences (server-side optional)
  async function savePrefs() {
    setSavingPrefs(true);
    try {
      await apiFetch("/api/preferences", { method: "POST", body: JSON.stringify({ notifications: { email: prefs.emailNotifications } }) });
      toast.success("Preferences saved");
    } catch (err) {
      console.warn("Save prefs error", err);
      toast.error("Failed to save preferences (server may not support it)");
    } finally {
      setSavingPrefs(false);
    }
  }

  // Export user data (client triggers API then downloads)
  async function exportData() {
    toast.loading("Preparing export...");
    try {
      const data = await apiFetch("/api/export");
      if (data) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `leave-manager-export-${user?.username || "me"}-${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.dismiss();
        toast.success("Export ready");
      } else {
        toast.dismiss();
        toast.error("Export endpoint not available");
      }
    } catch (err) {
      toast.dismiss();
      console.error("Export failed", err);
      toast.error("Export failed");
    }
  }

  // Show delete confirmation modal
  function openDeleteModal() {
    setDeleteConfirmText("");
    setShowDeleteModal(true);
  }

  function closeDeleteModal() {
    if (deleting) return; // prevent closing while deleting
    setShowDeleteModal(false);
    setDeleteConfirmText("");
  }

  // Delete account via UI modal
  async function confirmDeleteAccount() {
    if (deleteConfirmText !== "DELETE") {
      return toast.error('Type "DELETE" in the box to confirm account deletion.');
    }
    setDeleting(true);
    try {
      await apiFetch("/api/auth/me", { method: "DELETE" });
      toast.success("Account deleted");
      setShowDeleteModal(false);
      logout();
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Delete account error", err);
      toast.error(err?.message || "Failed to delete account");
    } finally {
      setDeleting(false);
      setDeleteConfirmText("");
    }
  }

  return (
    <div className="page settings-page">
      <div className="page-header">
        <h2>Settings</h2>
        <p className="muted">Manage your profile, password, preferences and account.</p>
      </div>

      <div className="settings-grid">
        <section className="card">
          <h3>Profile</h3>
          <form onSubmit={saveProfile} className="form">
            <label>
              <div className="label">Username</div>
              <input value={username} disabled />
              <small className="muted">Username cannot be changed here.</small>
            </label>

            <label>
              <div className="label">Display name</div>
              <input value={name} onChange={(e) => setName(e.target.value)} />
            </label>

            <div className="actions">
              <button className="btn primary" disabled={savingProfile}>{savingProfile ? "Saving…" : "Save profile"}</button>
            </div>
          </form>
        </section>

        <section className="card">
          <h3>Change password</h3>
          <form onSubmit={changePassword} className="form">
            <label>
              <div className="label">Current password</div>
              <input value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} type="password" />
            </label>

            <label>
              <div className="label">New password</div>
              <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password" />
            </label>

            <label>
              <div className="label">Confirm new password</div>
              <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" />
            </label>

            <div className="hint muted">After successful password change you'll be signed out.</div>

            <div className="actions">
              <button className="btn primary" disabled={changing}>{changing ? "Changing…" : "Change password"}</button>
            </div>
          </form>
        </section>

        <section className="card">
          <h3>Preferences</h3>
          <div className="form">
            <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div className="label">Email notifications</div>
                <div className="muted">Receive email summaries and alerts.</div>
              </div>
              <input type="checkbox" checked={prefs.emailNotifications} onChange={(e) => setPrefs(p => ({ ...p, emailNotifications: e.target.checked }))} />
            </label>

            <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
              <div>
                <div className="label">Theme</div>
                <div className="muted">Switch between light and dark theme.</div>
              </div>
              <div>
                <button type="button" className="btn ghost tiny" onClick={() => setTheme(t => t === "light" ? "dark" : "light")}>
                  {theme === "light" ? "Switch to dark" : "Switch to light"}
                </button>
              </div>
            </label>

            <div style={{ marginTop: 12 }} className="actions">
              <button className="btn primary" disabled={savingPrefs} onClick={savePrefs}>{savingPrefs ? "Saving…" : "Save preferences"}</button>
            </div>
          </div>
        </section>

        <section className="card danger">
          <h3>Account</h3>
          <div className="form">
            <div className="muted">Export your personal data or delete your account.</div>

            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button className="btn ghost" onClick={exportData}>Export data</button>
              <button className="btn" onClick={() => { navigator.clipboard?.writeText(user?.username || ""); toast.success("Username copied"); }}>Copy username</button>
              <button className="btn primary" onClick={() => { toast.success("Coming soon: account transfer") }}>Transfer account</button>
            </div>

            <hr style={{ margin: "12px 0", border: "none", borderTop: "1px solid rgba(15,23,42,0.04)" }} />

            <div className="muted">Delete your account permanently</div>
            <div style={{ marginTop: 8 }}>
              <button className="btn ghost" onClick={openDeleteModal} style={{ background: "#fff1f2", borderColor: "#fecaca" }}>Delete account</button>
            </div>
          </div>
        </section>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
          <div className="modal">
            <h3 id="delete-modal-title">Delete account</h3>
            <p className="muted">This will permanently delete your account and all personal data. This cannot be undone.</p>

            <p style={{ marginTop: 8 }}>To confirm, type <strong>DELETE</strong> below and click <em>Delete permanently</em>.</p>

            <input
              aria-label="Type DELETE to confirm"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder='Type "DELETE" to confirm'
              style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid rgba(15,23,42,0.08)", marginTop: 8, width: "100%" }}
            />

            <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "flex-end" }}>
              <button className="btn ghost" onClick={closeDeleteModal} disabled={deleting}>Cancel</button>
              <button
                className="btn"
                onClick={confirmDeleteAccount}
                disabled={deleting || deleteConfirmText !== "DELETE"}
                style={{ background: "#fecaca", borderColor: "#fca5a5" }}
              >
                {deleting ? "Deleting…" : "Delete permanently"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .settings-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        .card { padding: 16px; border-radius: 12px; background: linear-gradient(180deg,#fff,#fbfdff); border:1px solid rgba(15,23,42,0.04); box-shadow: 0 10px 30px rgba(12,18,40,0.04); }
        .card.danger { background: linear-gradient(180deg,#fff7f7,#fff) }
        .form { display:flex; flex-direction:column; gap:10px; }
        label { display:flex; flex-direction:column; gap:6px; }
        .label { font-weight:700; color:#0b1220; font-size:13px; }
        input[type="text"], input[type="password"], select, textarea { padding:10px 12px; border-radius:10px; border:1px solid rgba(15,23,42,0.06); font-size:14px; }
        .muted { color:#64748b; font-size:13px; }
        .hint { font-size: 13px; color: #475569; }
        .actions { margin-top:8px; display:flex; gap:8px; }
        .btn { padding:8px 12px; border-radius:10px; font-weight:700; cursor:pointer; border:none; }
        .btn.primary { background: linear-gradient(90deg,#7c3aed,#0ea5e9); color:white; }
        .btn.ghost { background:transparent; border:1px solid rgba(15,23,42,0.06); }
        .btn.tiny { padding:6px 8px; font-size:13px; border-radius:8px; }
        hr { opacity: 0.6 }

        /* modal */
        .modal-backdrop {
          position: fixed;
          inset: 0;
          display:flex;
          align-items:center;
          justify-content:center;
          background: rgba(2,6,23,0.5);
          z-index: 60;
          padding: 20px;
        }
        .modal {
          width: 100%;
          max-width: 520px;
          background: white;
          padding: 18px;
          border-radius: 12px;
          box-shadow: 0 20px 50px rgba(2,6,23,0.3);
        }

        @media (max-width: 980px) {
          .settings-grid { grid-template-columns: 1fr; }
          .modal { max-width: 92%; }
        }
      `}</style>
    </div>
  );
}
