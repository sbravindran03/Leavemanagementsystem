// import React, { createContext, useContext, useEffect, useState } from 'react'
// import { useNavigate } from 'react-router-dom'

// const AuthContext = createContext(null)
// export function useAuth() { return useContext(AuthContext) }

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null)
//   const navigate = useNavigate()

//   useEffect(() => {
//     const token = localStorage.getItem('lm_token')
//     const name = localStorage.getItem('lm_user')
//     if (token && name) setUser({ name })
//   }, [])

//   function login({ username, password }) {
//     return new Promise((res, rej) => {
//       setTimeout(() => {
//         if (!username || !password) return rej(new Error('Missing credentials'))
//         localStorage.setItem('lm_token', 'fake-jwt-token')
//         localStorage.setItem('lm_user', username)
//         setUser({ name: username })
//         res({ name: username })
//       }, 300)
//     })
//   }

//   function logout() {
//     localStorage.removeItem('lm_token')
//     localStorage.removeItem('lm_user')
//     setUser(null)
//     navigate('/login', { replace: true })
//   }

//   return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
// }

// src/auth/AuthProvider.jsx
// src/auth/AuthProvider.jsx  (replace file)


// import React, { createContext, useContext, useEffect, useState } from 'react'
// import { useNavigate } from 'react-router-dom'

// const AuthContext = createContext(null)
// export function useAuth() { return useContext(AuthContext) }

// const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null)
//   const [token, setToken] = useState(null)
//   const navigate = useNavigate()

//   useEffect(() => {
//     const t = localStorage.getItem('lm_token')
//     const u = localStorage.getItem('lm_user')
//     if (t) setToken(t)
//     if (u) {
//       try { setUser(JSON.parse(u)) }
//       catch { setUser({ name: u }) }
//     }
//   }, [])

//   async function login({ username, password }) {
//     if (!username || !password) throw new Error('Missing credentials')
//     try {
//       const res = await fetch(`${API_BASE}/api/auth/login`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ username, password })
//       })

//       let body = null
//       const ct = res.headers.get('content-type') || ''
//       if (ct.includes('application/json')) {
//         body = await res.json()
//       } else {
//         const text = await res.text()
//         try { body = JSON.parse(text) } catch { body = { message: text } }
//       }

//       console.log('Auth login response status:', res.status, 'body:', body)

//       if (!res.ok) {
//         // surface backend message if present
//         const msg = (body && (body.message || body.error)) || `Login failed (${res.status})`
//         throw new Error(msg)
//       }

//       // backend expected shape: { token, user }
//       // be permissive: token might be body.token or body.accessToken etc.
//       const jwt = body?.token || body?.accessToken || body?.jwt || null
//       const userObj = body?.user || body?.data || null

//       if (!jwt) {
//         // sometimes backend returns token directly as string
//         if (typeof body === 'string' && body.split('.').length === 3) {
//           localStorage.setItem('lm_token', body)
//           setToken(body)
//         } else {
//           throw new Error('Login succeeded but no token returned')
//         }
//       } else {
//         localStorage.setItem('lm_token', jwt)
//         setToken(jwt)
//       }

//       if (userObj) {
//         localStorage.setItem('lm_user', JSON.stringify(userObj))
//         setUser(userObj)
//       } else {
//         // if no user object returned, attempt to decode from token (lightweight)
//         try {
//           const parts = (jwt || '').split('.')
//           if (parts.length === 3) {
//             const payload = JSON.parse(atob(parts[1]))
//             const inferred = { id: payload.sub || payload.id, name: payload.name || payload.username, role: payload.role || payload.r }
//             localStorage.setItem('lm_user', JSON.stringify(inferred))
//             setUser(inferred)
//           }
//         } catch (e) {
//           // ignore decode errors
//         }
//       }

//       return userObj || { name: username }
//     } catch (err) {
//       console.error('AuthProvider.login error:', err)
//       throw err
//     }
//   }

//   function logout() {
//     localStorage.removeItem('lm_token')
//     localStorage.removeItem('lm_user')
//     setToken(null)
//     setUser(null)
//     navigate('/login', { replace: true })
//   }

//   async function apiFetch(path, opts = {}) {
//     const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) }
//     const t = localStorage.getItem('lm_token') || token
//     if (t) headers['Authorization'] = `Bearer ${t}`
//     const res = await fetch(`${API_BASE}${path}`, { ...opts, headers })
//     const ct = res.headers.get('content-type') || ''
//     const body = ct.includes('application/json') ? await res.json() : null
//     if (!res.ok) {
//       const msg = (body && body.message) || `Request failed: ${res.status}`
//       const e = new Error(msg); e.status = res.status; e.body = body; throw e
//     }
//     return body
//   }

//   const value = { user, token, login, logout, apiFetch, apiBase: API_BASE }
//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
// }


// src/auth/AuthProvider.jsx---------------------------------------
// import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
// import { useNavigate } from "react-router-dom";

// const AuthContext = createContext(null);
// export function useAuth() { return useContext(AuthContext); }

// const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

// function safeParseJSON(str) {
//   try { return JSON.parse(str); } catch { return null; }
// }

// // lightweight JWT payload decode (no dependency)
// function decodeJwtPayload(token) {
//   if (!token) return null;
//   try {
//     const parts = token.split(".");
//     if (parts.length !== 3) return null;
//     const payload = parts[1];
//     // atob may throw for url-safe base64, so normalize
//     const b64 = payload.replace(/-/g, "+").replace(/_/g, "/");
//     const padded = b64.padEnd(Math.ceil(b64.length / 4) * 4, "=");
//     const json = atob(padded);
//     return safeParseJSON(json);
//   } catch {
//     return null;
//   }
// }

// export function AuthProvider({ children }) {
//   const navigate = useNavigate();

//   // initialize from localStorage
//   const [token, setToken] = useState(() => localStorage.getItem("lm_token") || null);
//   const [user, setUser] = useState(() => {
//     const s = localStorage.getItem("lm_user");
//     if (!s) return null;
//     try { return JSON.parse(s); } catch { return { name: s }; }
//   });
//   const [loading, setLoading] = useState(false);

//   // keep localStorage in sync
//   useEffect(() => {
//     if (token) localStorage.setItem("lm_token", token);
//     else localStorage.removeItem("lm_token");
//   }, [token]);

//   useEffect(() => {
//     if (user) localStorage.setItem("lm_user", JSON.stringify(user));
//     else localStorage.removeItem("lm_user");
//   }, [user]);

//   // logout: clear storage and navigate to login
//   const logout = useCallback(() => {
//     setToken(null);
//     setUser(null);
//     localStorage.removeItem("lm_token");
//     localStorage.removeItem("lm_user");
//     // navigate to login
//     try { navigate("/login", { replace: true }); } catch {}
//   }, [navigate]);

//   // refreshUser: optional endpoint /api/auth/me to get latest user profile
//   const refreshUser = useCallback(async () => {
//     if (!token) return null;
//     try {
//       const res = await fetch(`${API_BASE}/api/auth/me`, {
//         method: "GET",
//         headers: { "Authorization": `Bearer ${token}` }
//       });
//       if (!res.ok) {
//         // don't force logout on non-401 small errors; if 401 -> logout
//         if (res.status === 401) { logout(); }
//         return null;
//       }
//       const data = await res.json();
//       if (data) {
//         setUser(data.user || data);
//         return data.user || data;
//       }
//       return null;
//     } catch (err) {
//       console.warn("refreshUser error", err);
//       return null;
//     }
//   }, [token, logout]);

//   // main login — calls backend and stores token & user
//   async function login({ username, password }) {
//     if (!username || !password) throw new Error("Missing credentials");
//     setLoading(true);
//     try {
//       const res = await fetch(`${API_BASE}/api/auth/login`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ username, password })
//       });

//       // try to parse body in a permissive way
//       const ct = res.headers.get("content-type") || "";
//       let body = null;
//       if (ct.includes("application/json")) body = await res.json();
//       else {
//         const text = await res.text();
//         body = safeParseJSON(text) || text;
//       }

//       if (!res.ok) {
//         const msg = (body && (body.message || body.error)) || `Login failed (${res.status})`;
//         throw new Error(msg);
//       }

//       // accept various shapes: { token, user } or { accessToken, data } or token string
//       const jwt = body?.token || body?.accessToken || (typeof body === "string" && body.split(".").length === 3 ? body : null);
//       let userObj = body?.user || body?.data || null;

//       if (!jwt) {
//         // if backend returned { user, ... } but no token, try to infer tokenless auth (not recommended)
//         if (!userObj) throw new Error("Login succeeded but no token returned");
//       } else {
//         setToken(jwt);
//       }

//       if (!userObj && jwt) {
//         const payload = decodeJwtPayload(jwt);
//         if (payload) {
//           userObj = {
//             id: payload.id || payload.sub || payload._id,
//             username: payload.username || payload.user || payload.name,
//             name: payload.name || payload.username || payload.user,
//             role: payload.role || payload.r || payload.roles
//           };
//         }
//       }

//       if (userObj) setUser(userObj);
//       else setUser({ name: username });

//       return userObj || { name: username };
//     } catch (err) {
//       console.error("AuthProvider.login error:", err);
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   }

//   // apiFetch wrapper attaches Authorization header and handles JSON/text
//   async function apiFetch(path, opts = {}) {
//     const url = path.startsWith("http://") || path.startsWith("https://") ? path : `${API_BASE}${path}`;
//     const headers = { ...(opts.headers || {}) };

//     // default content type for JSON bodies
//     if (!headers["Content-Type"] && !(opts.body instanceof FormData)) {
//       headers["Content-Type"] = "application/json";
//     }

//     const t = token || localStorage.getItem("lm_token");
//     if (t) headers["Authorization"] = `Bearer ${t}`;

//     const res = await fetch(url, { ...opts, headers });

//     // handle 401s: token expired/invalid -> logout
//     if (res.status === 401) {
//       console.warn("apiFetch 401 — logging out");
//       logout();
//       const text = await res.text().catch(() => "");
//       const parsed = safeParseJSON(text) || {};
//       const err = new Error(parsed.message || "Unauthorized");
//       err.status = 401;
//       throw err;
//     }

//     const ct = res.headers.get("content-type") || "";
//     let body = null;
//     if (ct.includes("application/json")) {
//       body = await res.json();
//     } else {
//       // attempt text
//       body = await res.text().catch(() => null);
//       // try to parse JSON-ish strings
//       if (typeof body === "string") {
//         const maybe = safeParseJSON(body);
//         if (maybe) body = maybe;
//       }
//     }

//     if (!res.ok) {
//       const msg = (body && (body.message || body.error)) || `Request failed: ${res.status}`;
//       const err = new Error(msg);
//       err.status = res.status;
//       err.body = body;
//       throw err;
//     }

//     return body;
//   }

//   // helper to programmatically update stored user (useful after profile edit)
//   const updateUser = useCallback((u) => {
//     setUser(u);
//     if (u) localStorage.setItem("lm_user", JSON.stringify(u));
//     else localStorage.removeItem("lm_user");
//   }, []);

//   const value = {
//     user,
//     token,
//     loading,
//     login,
//     logout,
//     apiFetch,
//     refreshUser,
//     updateUser,
//     apiBase: API_BASE
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// }

// src/auth/AuthProvider.jsx
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);
export function useAuth() { return useContext(AuthContext); }

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

function safeParseJSON(str) {
  try { return JSON.parse(str); } catch { return null; }
}

// lightweight JWT payload decode (no dependency)
function decodeJwtPayload(token) {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1];
    // atob may throw for url-safe base64, so normalize
    const b64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64.padEnd(Math.ceil(b64.length / 4) * 4, "=");
    const json = atob(padded);
    return safeParseJSON(json);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  // initialize from localStorage
  const [token, setToken] = useState(() => localStorage.getItem("lm_token") || null);
  const [user, setUser] = useState(() => {
    const s = localStorage.getItem("lm_user");
    if (!s) return null;
    try { return JSON.parse(s); } catch { return { name: s }; }
  });
  const [loading, setLoading] = useState(false);

  // keep localStorage in sync
  useEffect(() => {
    if (token) localStorage.setItem("lm_token", token);
    else localStorage.removeItem("lm_token");
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem("lm_user", JSON.stringify(user));
    else localStorage.removeItem("lm_user");
  }, [user]);

  // logout: clear storage and navigate to login
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("lm_token");
    localStorage.removeItem("lm_user");
    try { navigate("/login", { replace: true }); } catch {}
  }, [navigate]);

  // refreshUser: optional endpoint /api/auth/me to get latest user profile
  const refreshUser = useCallback(async () => {
    if (!token) return null;
    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) {
        if (res.status === 401) { logout(); }
        return null;
      }
      const data = await res.json();
      if (data) {
        setUser(data.user || data);
        return data.user || data;
      }
      return null;
    } catch (err) {
      console.warn("refreshUser error", err);
      return null;
    }
  }, [token, logout]);

  // main login
  async function login({ username, password }) {
    if (!username || !password) throw new Error("Missing credentials");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const ct = res.headers.get("content-type") || "";
      let body = null;
      if (ct.includes("application/json")) body = await res.json();
      else {
        const text = await res.text();
        body = safeParseJSON(text) || text;
      }

      if (!res.ok) {
        const msg = (body && (body.message || body.error)) || `Login failed (${res.status})`;
        throw new Error(msg);
      }

      const jwt = body?.token || body?.accessToken || (typeof body === "string" && body.split(".").length === 3 ? body : null);
      let userObj = body?.user || body?.data || null;

      if (jwt) setToken(jwt);

      if (!userObj && jwt) {
        const payload = decodeJwtPayload(jwt);
        if (payload) {
          userObj = {
            id: payload.id || payload.sub || payload._id,
            username: payload.username || payload.user || payload.name,
            name: payload.name || payload.username || payload.user,
            role: payload.role || payload.r || payload.roles
          };
        }
      }

      if (userObj) setUser(userObj);
      else setUser({ name: username });

      return userObj || { name: username };
    } catch (err) {
      console.error("AuthProvider.login error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  // apiFetch wrapper
  async function apiFetch(path, opts = {}) {
    const url = path.startsWith("http://") || path.startsWith("https://") ? path : `${API_BASE}${path}`;
    const headers = { ...(opts.headers || {}) };

    if (!headers["Content-Type"] && !(opts.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const t = token || localStorage.getItem("lm_token");
    if (t) headers["Authorization"] = `Bearer ${t}`;

    const res = await fetch(url, { ...opts, headers });

    if (res.status === 401) {
      console.warn("apiFetch 401 — logging out");
      logout();
      const text = await res.text().catch(() => "");
      const parsed = safeParseJSON(text) || {};
      const err = new Error(parsed.message || "Unauthorized");
      err.status = 401;
      throw err;
    }

    const ct = res.headers.get("content-type") || "";
    let body = null;
    if (ct.includes("application/json")) {
      body = await res.json();
    } else {
      body = await res.text().catch(() => null);
      if (typeof body === "string") {
        const maybe = safeParseJSON(body);
        if (maybe) body = maybe;
      }
    }

    if (!res.ok) {
      const msg = (body && (body.message || body.error)) || `Request failed: ${res.status}`;
      const err = new Error(msg);
      err.status = res.status;
      err.body = body;
      throw err;
    }

    return body;
  }

  const updateUser = useCallback((u) => {
    setUser(u);
    if (u) localStorage.setItem("lm_user", JSON.stringify(u));
    else localStorage.removeItem("lm_user");
  }, []);

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    apiFetch,
    refreshUser,
    updateUser,
    apiBase: API_BASE
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

