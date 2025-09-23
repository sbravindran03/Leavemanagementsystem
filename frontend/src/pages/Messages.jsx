// // src/pages/Messages.jsx
// import React, { useEffect, useMemo, useState } from "react";
// import { useAuth } from "../auth/AuthProvider";
// import { formatDistanceToNow } from "date-fns";

// /**
//  * Messages page
//  * - Employees: can message their manager (recipient auto-filled)
//  * - Managers: can message whole team or a specific employee (select dropdown)
//  *
//  * API assumptions (backend routes provided below):
//  * - GET  /api/messages            -> lists messages relevant to the logged-in user (inbox)
//  * - POST /api/messages            -> create message { to: <userId|'team'>, content }
//  * - POST /api/messages/:id/read   -> mark message as read (optional)
//  *
//  * Message model: { from, to (userId or 'team'), content, createdAt, readBy: [] }
//  */

// function niceTime(iso) {
//   try {
//     return formatDistanceToNow(new Date(iso), { addSuffix: true });
//   } catch {
//     return iso;
//   }
// }

// export default function Messages() {
//   const { apiFetch, user } = useAuth();
//   const [messages, setMessages] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [content, setContent] = useState("");
//   const [sending, setSending] = useState(false);

//   // manager: list of team employees for sending direct message
//   const [teamMembers, setTeamMembers] = useState([]);
//   const [recipient, setRecipient] = useState(""); // 'manager' (for employee), 'team' or userId (for manager)

//   async function loadMessages() {
//     setLoading(true);
//     setError("");
//     try {
//       const data = await apiFetch("/api/messages");
//       setMessages(Array.isArray(data) ? data : []);
//       // if manager, derive team members from messages or fetch /api/users?managerId=...
//       if (user?.role === "manager") {
//         // backend: optional route /api/users?managedBy=currentManager; if not available, derive from messages
//         try {
//           const team = await apiFetch("/api/users?managerId=" + user.id);
//           if (Array.isArray(team)) {
//             setTeamMembers(team);
//             if (!recipient) setRecipient("team");
//           } else {
//             setTeamMembers([]);
//             if (!recipient) setRecipient("team");
//           }
//         } catch (err) {
//           // fallback: build team from messages' employeeId
//           const map = new Map();
//           (data || []).forEach((m) => {
//             if (m.from && m.from._id && m.from._id !== user.id) {
//               map.set(String(m.from._id), { id: String(m.from._id), name: m.from.name || m.from.username });
//             }
//             if (m.to && m.to !== "team" && m.to._id && m.to._id !== user.id) {
//               map.set(String(m.to._id), { id: String(m.to._id), name: m.to.name || m.to.username });
//             }
//           });
//           const arr = Array.from(map.values());
//           setTeamMembers(arr);
//           if (!recipient) setRecipient("team");
//         }
//       } else {
//         // employee default recipient is manager
//         if (!recipient) setRecipient("manager");
//       }
//     } catch (err) {
//       console.error("Load messages error", err);
//       setError(err?.message || "Failed to load messages");
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     loadMessages();
//     const h = () => loadMessages();
//     window.addEventListener("messages:updated", h);
//     return () => window.removeEventListener("messages:updated", h);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [user?.id]);

//   const inbox = useMemo(() => {
//     // messages where current user is recipient (to === user.id) or to === 'team' and user is manager/member based on role
//     return (messages || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
//   }, [messages]);

//   async function handleSend(e) {
//     e && e.preventDefault();
//     if (!content.trim()) return;
//     // build payload
//     const payload = { content: content.trim() };

//     // recipient handling
//     if (user.role === "employee") {
//       // send to manager: backend will infer manager if to omitted — but we can set to 'manager'
//       payload.to = "manager";
//     } else if (user.role === "manager") {
//       // manager can send to 'team' or a specific userId
//       if (!recipient) { alert("Pick a recipient"); return; }
//       payload.to = recipient === "team" ? "team" : recipient;
//     }

//     setSending(true);
//     try {
//       await apiFetch("/api/messages", { method: "POST", body: JSON.stringify(payload) });
//       setContent("");
//       // refresh
//       window.dispatchEvent(new CustomEvent("messages:updated"));
//     } catch (err) {
//       console.error("Send message failed", err);
//       alert(err.message || "Send failed");
//     } finally {
//       setSending(false);
//     }
//   }

//   async function markRead(id) {
//     try {
//       await apiFetch(`/api/messages/${id}/read`, { method: "POST" });
//       window.dispatchEvent(new CustomEvent("messages:updated"));
//     } catch (err) {
//       console.error("markRead failed", err);
//     }
//   }

//   return (
//     <div className="page messages-page">
//       <div className="page-header">
//         <h2>Messages</h2>
//         <p className="muted">Exchange messages between employees and managers. Managers can broadcast to the whole team.</p>
//       </div>

//       <div className="messages-grid" style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 16 }}>
//         <aside className="compose-card" style={{ padding: 16, borderRadius: 12, background: "linear-gradient(180deg,#fff,#fbfdff)", border: "1px solid rgba(15,23,42,0.04)" }}>
//           <div style={{ marginBottom: 8, fontWeight: 800 }}>New message</div>

//           {/* Recipient selector */}
//           <div style={{ marginBottom: 10 }}>
//             {user.role === "employee" ? (
//               <div>
//                 <label style={{ fontSize: 13, color: "#475569" }}>To</label>
//                 <div style={{ marginTop: 6, fontWeight: 700 }}>Your manager</div>
//               </div>
//             ) : (
//               <div>
//                 <label style={{ fontSize: 13, color: "#475569" }}>Recipient</label>
//                 <select value={recipient} onChange={(e) => setRecipient(e.target.value)} style={{ marginTop: 6, padding: 8, width: "100%", borderRadius: 8 }}>
//                   <option value="team">Whole team</option>
//                   {teamMembers.map((m) => <option key={m.id} value={m.id}>{m.name || m.username}</option>)}
//                 </select>
//               </div>
//             )}
//           </div>

//           <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write a message..." rows={6} style={{ width: "100%", padding: 10, borderRadius: 8 }} />
//           <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
//             <button className="btn primary" onClick={handleSend} disabled={sending || !content.trim()}>{sending ? "Sending…" : "Send"}</button>
//             <button className="btn ghost" onClick={() => setContent("")} disabled={sending}>Clear</button>
//           </div>

//           <div style={{ marginTop: 12, fontSize: 13, color: "#64748b" }}>
//             {user.role === "manager" ? "Broadcast to team or message an individual." : "Messages go directly to your manager."}
//           </div>
//         </aside>

//         <main>
//           <div style={{ marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//             <div style={{ fontWeight: 700 }}>Inbox</div>
//             <div>
//               <button className="btn ghost" onClick={() => window.dispatchEvent(new CustomEvent("messages:updated"))}>Refresh</button>
//             </div>
//           </div>

//           <div className="inbox-list" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
//             {loading ? (
//               <div>Loading…</div>
//             ) : error ? (
//               <div style={{ color: "crimson" }}>{error}</div>
//             ) : inbox.length === 0 ? (
//               <div className="muted">No messages yet.</div>
//             ) : inbox.map((m) => {
//               // determine whether message is for this user: m.to === user.id OR m.to === 'team' + user under manager/team logic
//               const amSender = String(m.from?._id || m.from) === String(user.id);
//               const amRecipient = (m.to === "team") || (m.to && String(m.to._id || m.to) === String(user.id));
//               const unread = !(m.readBy || []).includes(String(user.id));
//               return (
//                 <div key={m._id || m.id} className={`message-item ${unread ? "unread" : ""}`} style={{ padding: 12, borderRadius: 10, background: unread ? "linear-gradient(180deg,#fff8f2,#fff)" : "white", border: "1px solid rgba(15,23,42,0.04)" }}>
//                   <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
//                     <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
//                       <div style={{ width: 44, height: 44, borderRadius: 10, background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>
//                         {(m.from?.name || m.from?.username || (String(m.from || "")).charAt(0)).charAt(0).toUpperCase()}
//                       </div>
//                       <div>
//                         <div style={{ fontWeight: 800 }}>{m.from?.name || m.from?.username || (m.from?.id || "Unknown")}</div>
//                         <div style={{ fontSize: 13, color: "#64748b" }}>{m.to === "team" ? "To: Team" : `To: ${m.to?.name || m.to?.username || (m.to || "")}`}</div>
//                       </div>
//                     </div>

//                     <div style={{ textAlign: "right" }}>
//                       <div style={{ fontSize: 13, color: "#64748b" }}>{niceTime(m.createdAt)}</div>
//                       <div style={{ marginTop: 6 }}>
//                         {!unread ? <small className="muted">Read</small> : <button className="btn tiny" onClick={() => markRead(m._id)}>Mark read</button>}
//                       </div>
//                     </div>
//                   </div>

//                   <div style={{ marginTop: 10, fontSize: 15, whiteSpace: "pre-wrap" }}>{m.content}</div>

//                   {/* if manager, allow quick reply to sender */}
//                   <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
//                     <button className="btn ghost tiny" onClick={() => { setRecipient(m.from?._id || m.from); setContent(`@${m.from?.username || m.from?.name || ""} `); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Reply</button>
//                     {user.role === "manager" && amRecipient && <button className="btn ghost tiny" onClick={() => { if (confirm("Broadcast this message to team?")) { setContent(m.content); setRecipient("team"); handleSend(); } }}>Broadcast</button>}
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </main>
//       </div>

//       <style>{`
//         .message-item.unread { box-shadow: 0 8px 24px rgba(124,58,237,0.04); }
//         .btn.tiny { padding:6px 8px; border-radius:8px; }
//         .muted { color:#64748b; }
//         @media (max-width: 900px) {
//           .messages-grid { grid-template-columns: 1fr; }
//         }
//       `}</style>
//     </div>
//   );
// }

// src/pages/Messages.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { formatDistanceToNow } from "date-fns";

function niceTime(iso) {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return iso;
  }
}

export default function Messages() {
  const { apiFetch, user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  const [teamMembers, setTeamMembers] = useState([]);
  const [recipient, setRecipient] = useState(""); // 'team' or userId

  async function loadMessages() {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch("/api/messages");
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Load messages error", err);
      setError(err?.message || "Failed to load messages");
    } finally {
      setLoading(false);
    }
  }

  async function loadTeamMembers() {
    if (user?.role !== "manager") return;
    try {
      const team = await apiFetch(`/api/users?managerId=${user.id}`);
      if (Array.isArray(team)) {
        setTeamMembers(team);
        if (!recipient) setRecipient("team");
      }
    } catch (err) {
      console.warn("Failed to load team members", err);
      setTeamMembers([]);
    }
  }

  useEffect(() => {
    loadMessages();
    loadTeamMembers();
    const h = () => { loadMessages(); loadTeamMembers(); };
    window.addEventListener("messages:updated", h);
    return () => window.removeEventListener("messages:updated", h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const inbox = useMemo(() => {
    return (messages || []).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [messages]);

  async function handleSend(e) {
    e && e.preventDefault();
    if (!content.trim()) return;

    const payload = { content: content.trim() };

    if (user.role === "employee") {
      payload.to = "manager";
    } else if (user.role === "manager") {
      if (!recipient) { alert("Pick a recipient"); return; }
      payload.to = recipient === "team" ? "team" : recipient;
    }

    setSending(true);
    try {
      await apiFetch("/api/messages", { method: "POST", body: JSON.stringify(payload) });
      setContent("");
      window.dispatchEvent(new CustomEvent("messages:updated"));
    } catch (err) {
      console.error("Send message failed", err);
      alert(err.message || "Send failed");
    } finally {
      setSending(false);
    }
  }

  async function markRead(id) {
    try {
      await apiFetch(`/api/messages/${id}/read`, { method: "POST" });
      window.dispatchEvent(new CustomEvent("messages:updated"));
    } catch (err) {
      console.error("markRead failed", err);
    }
  }

  return (
    <div className="page messages-page">
      <div className="page-header">
        <h2>Messages</h2>
        <p className="muted">Exchange messages between employees and managers. Managers can broadcast to the whole team.</p>
      </div>

      <div className="messages-grid" style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 16 }}>
        <aside className="compose-card" style={{ padding: 16, borderRadius: 12, background: "linear-gradient(180deg,#fff,#fbfdff)", border: "1px solid rgba(15,23,42,0.04)" }}>
          <div style={{ marginBottom: 8, fontWeight: 800 }}>New message</div>

          <div style={{ marginBottom: 10 }}>
            {user.role === "employee" ? (
              <div>
                <label style={{ fontSize: 13, color: "#475569" }}>To</label>
                <div style={{ marginTop: 6, fontWeight: 700 }}>Your manager</div>
              </div>
            ) : (
              <div>
                <label style={{ fontSize: 13, color: "#475569" }}>Recipient</label>
                <select value={recipient} onChange={(e) => setRecipient(e.target.value)} style={{ marginTop: 6, padding: 8, width: "100%", borderRadius: 8 }}>
                  <option value="team">Whole team</option>
                  {teamMembers.map((m) => (
                    <option key={m._id || m.id} value={m._id || m.id}>
                      {m.name || m.username}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write a message..." rows={6} style={{ width: "100%", padding: 10, borderRadius: 8 }} />
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button className="btn primary" onClick={handleSend} disabled={sending || !content.trim()}>{sending ? "Sending…" : "Send"}</button>
            <button className="btn ghost" onClick={() => setContent("")} disabled={sending}>Clear</button>
          </div>

          <div style={{ marginTop: 12, fontSize: 13, color: "#64748b" }}>
            {user.role === "manager" ? "Broadcast to team or message an individual." : "Messages go directly to your manager."}
          </div>
        </aside>

        <main>
          <div style={{ marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontWeight: 700 }}>Inbox</div>
            <div>
              <button className="btn ghost" onClick={() => window.dispatchEvent(new CustomEvent("messages:updated"))}>Refresh</button>
            </div>
          </div>

          <div className="inbox-list" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {loading ? (
              <div>Loading…</div>
            ) : error ? (
              <div style={{ color: "crimson" }}>{error}</div>
            ) : inbox.length === 0 ? (
              <div className="muted">No messages yet.</div>
            ) : inbox.map((m) => {
              const unread = !(m.readBy || []).includes(String(user.id));
              return (
                <div key={m._id || m.id} className={`message-item ${unread ? "unread" : ""}`} style={{ padding: 12, borderRadius: 10, background: unread ? "linear-gradient(180deg,#fff8f2,#fff)" : "white", border: "1px solid rgba(15,23,42,0.04)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <div style={{ width: 44, height: 44, borderRadius: 10, background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>
                        {(m.from?.name || m.from?.username || (String(m.from || "")).charAt(0)).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800 }}>{m.from?.name || m.from?.username || (m.from?.id || "Unknown")}</div>
                        <div style={{ fontSize: 13, color: "#64748b" }}>{m.to === "team" ? "To: Team" : `To: ${m.to?.name || m.to?.username || (m.to || "")}`}</div>
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 13, color: "#64748b" }}>{niceTime(m.createdAt)}</div>
                      <div style={{ marginTop: 6 }}>
                        {!unread ? <small className="muted">Read</small> : <button className="btn tiny" onClick={() => markRead(m._id)}>Mark read</button>}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: 10, fontSize: 15, whiteSpace: "pre-wrap" }}>{m.content}</div>

                  <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                    <button className="btn ghost tiny" onClick={() => { setRecipient(m.from?._id || m.from); setContent(`@${m.from?.username || m.from?.name || ""} `); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Reply</button>
                    {user.role === "manager" && (
                      <button className="btn ghost tiny" onClick={() => { if (confirm("Broadcast this message to team?")) { setContent(m.content); setRecipient("team"); handleSend(); } }}>
                        Broadcast
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      <style>{`
        .message-item.unread { box-shadow: 0 8px 24px rgba(124,58,237,0.04); }
        .btn.tiny { padding:6px 8px; border-radius:8px; }
        .muted { color:#64748b; }
        @media (max-width: 900px) {
          .messages-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
