// import React, { useEffect, useState } from "react";

// /**
//  * RecentActivity - modern UI
//  * - Click an item to mark as read
//  * - Show more / show less
//  * - Relative timestamps auto-update every 60s
//  */

// const INITIAL = [
//   {
//     id: 1,
//     user: "Alice",
//     text: "applied for 2 days",
//     meta: "Pending",
//     time: new Date(Date.now() - 1000 * 60 * 6).toISOString(), // 6 minutes ago
//     unread: true,
//   },
//   {
//     id: 2,
//     user: "Bob",
//     text: "canceled leave",
//     meta: "Approved",
//     time: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(), // 22 hours ago
//     unread: true,
//   },
//   {
//     id: 3,
//     user: "HR Team",
//     text: "added holiday: Oct 2",
//     meta: "Holiday",
//     time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(), // 4 days ago
//     unread: false,
//   },
//   {
//     id: 4,
//     user: "Vicky",
//     text: "requested WFH for 1 day",
//     meta: "Pending",
//     time: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
//     unread: true,
//   },
//   {
//     id: 5,
//     user: "Manager",
//     text: "approved Ravi's leave",
//     meta: "Approved",
//     time: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
//     unread: false,
//   },
// ];

// function timeAgo(iso) {
//   const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
//   if (diff < 60) return `${diff}s`;
//   if (diff < 3600) return `${Math.floor(diff / 60)}m`;
//   if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
//   return `${Math.floor(diff / 86400)}d`;
// }

// export default function RecentActivity() {
//   const [items, setItems] = useState(INITIAL);
//   const [showAll, setShowAll] = useState(false);
//   const [, setTick] = useState(0); // used to refresh time labels periodically

//   useEffect(() => {
//     const t = setInterval(() => setTick((s) => s + 1), 60_000); // refresh every minute
//     return () => clearInterval(t);
//   }, []);

//   function toggleRead(id) {
//     setItems((prev) => prev.map((it) => (it.id === id ? { ...it, unread: false } : it)));
//   }

//   function markAllRead() {
//     setItems((prev) => prev.map((it) => ({ ...it, unread: false })));
//   }

//   const visible = showAll ? items : items.slice(0, 3);

//   return (
//     <section className="recent-activity modern-activity-card" aria-labelledby="recent-activity-title">
//       <div className="ra-header">
//         <h3 id="recent-activity-title">Recent Activity</h3>
//         <div className="ra-actions">
//           <button className="btn small ghost" onClick={markAllRead} title="Mark all read">
//             Mark all read
//           </button>
//           <button
//             className="btn small"
//             onClick={() => setShowAll((s) => !s)}
//             aria-expanded={showAll}
//             title={showAll ? "Show less" : "Show more"}
//           >
//             {showAll ? "Show less" : "Show more"}
//           </button>
//         </div>
//       </div>

//       <ul className="activity-list" role="list">
//         {visible.map((it) => (
//           <li
//             key={it.id}
//             role="listitem"
//             className={`activity-item ${it.unread ? "unread" : "read"}`}
//             onClick={() => toggleRead(it.id)}
//             tabIndex={0}
//             onKeyDown={(e) => e.key === "Enter" && toggleRead(it.id)}
//           >
//             <div className="activity-left">
//               <div className="avatar-md" aria-hidden>
//                 {it.user.charAt(0)}
//               </div>
//             </div>

//             <div className="activity-body">
//               <div className="activity-top">
//                 <div className="activity-text">
//                   <strong className="actor">{it.user}</strong>{" "}
//                   <span className="verb">{it.text}</span>
//                 </div>
//                 <div className="activity-meta">
//                   <span className={`status mini ${it.meta.toLowerCase()}`}>{it.meta}</span>
//                   <time className="time" dateTime={it.time}>
//                     {timeAgo(it.time)}
//                   </time>
//                 </div>
//               </div>

//               <div className="activity-sub">
//                 {/* optional small description, could be extended */}
//                 <span className="subtle">Tap to mark read • Click for details</span>
//               </div>
//             </div>

//             {it.unread && <div className="unread-dot" aria-hidden />}
//           </li>
//         ))}
//       </ul>
//     </section>
//   );
// }
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { formatDistanceToNow } from "date-fns";

/**
 * RecentActivity component — dynamic by user.
 *
 * Behavior:
 * 1. Tries GET /api/activity (recommended) -> expects array of items:
 *      [{ id, type: 'message'|'leave'|'system', actor: {id,username,name}, text, meta, createdAt, unread }]
 * 2. If that endpoint fails, falls back to fetching /api/messages and /api/leaves
 *    and normalizes them into activity items.
 *
 * Features:
 * - Polls for updates every `pollInterval` ms
 * - Click an item to mark message as read (if message) or open details (callback)
 * - Load more pagination (server-side / client-side)
 *
 * Add or adapt backend endpoints:
 * - GET /api/activity?limit=20&skip=0  (recommended)
 * - GET /api/messages
 * - GET /api/leaves
 * - POST /api/messages/:id/read
 */

const POLL_INTERVAL_MS = 45_000;
const PAGE_SIZE = 6;

function niceTime(iso) {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return iso;
  }
}

function normalizeMessageToActivity(msg) {
  return {
    id: msg._id || msg.id,
    type: "message",
    actor: msg.from || { id: msg.from?._id || null, username: msg.from?.username },
    text: msg.content || "",
    meta: msg.to === "team" ? "To: team" : (msg.to?.username || msg.to?.name || msg.to || ""),
    createdAt: msg.createdAt || msg.created_at || msg.createdAt,
    unread: Array.isArray(msg.readBy) ? !msg.readBy.map(String).includes(String(msg._currentUserId || "")) && true : !!msg.unread
  };
}

function normalizeLeaveToActivity(l) {
  const actor = l.employee ? (typeof l.employee === "string" ? { name: l.employee } : l.employee) : { name: l.employeeName || l.employee || "Unknown" };
  const verb = l.status ? `${l.status}` : "applied";
  return {
    id: l._id || l.id,
    type: "leave",
    actor,
    text: `${actor.name || actor.username} ${verb} ${l.type || ""} (${l.from} → ${l.to})`,
    meta: l.status || "Pending",
    createdAt: l.createdAt || l.created_at || l.from || new Date().toISOString(),
    unread: false
  };
}

export default function RecentActivity({ pollInterval = POLL_INTERVAL_MS, pageSize = PAGE_SIZE }) {
  const { apiFetch, user } = useAuth();
  const [items, setItems] = useState([]);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(false);
  const [lastFetchAt, setLastFetchAt] = useState(null);

  const currentUserId = user?.id || user?._id || null;

  const fetchActivity = useCallback(async (opts = { replace: true, limit: pageSize, skip: 0 }) => {
    const { replace, limit, skip: s } = opts;
    try {
      if (replace) {
        setLoading(true);
        setError("");
      } else {
        setLoadingMore(true);
      }

      // 1) preferred unified endpoint
      try {
        const q = `?limit=${limit}&skip=${s}`;
        const data = await apiFetch(`/api/activity${q}`);
        // expect an array
        if (Array.isArray(data)) {
          // normalize minimal fields if necessary
          const normalized = data.map(it => ({
            id: it.id || it._id || it.messageId || `${it.type}-${it.id || it._id}`,
            type: it.type || it.kind || "item",
            actor: it.actor || it.from || it.user || {},
            text: it.text || it.content || it.title || "",
            meta: it.meta || it.status || it.note || "",
            createdAt: it.createdAt || it.created_at || it.timestamp || new Date().toISOString(),
            unread: !!it.unread
          }));
          if (replace) setItems(normalized);
          else setItems(prev => [...prev, ...normalized]);
          setHasMore(normalized.length === limit);
          setLastFetchAt(new Date().toISOString());
          return;
        }
      } catch (err) {
        // endpoint not available or failed — we'll fallback
      }

      // 2) fallback: messages + leaves
      const [messages, leaves] = await Promise.allSettled([
        apiFetch(`/api/messages`),
        apiFetch(`/api/leaves?limit=${limit}&skip=${s}`) // some APIs support this
      ]);

      let mItems = [];
      if (messages.status === "fulfilled" && Array.isArray(messages.value)) {
        const msgs = messages.value;
        mItems = msgs.map(m => {
          const normalized = normalizeMessageToActivity({ ...m, _currentUserId: currentUserId });
          // compute unread using readBy if present and current user
          if (Array.isArray(m.readBy)) normalized.unread = !m.readBy.map(String).includes(String(currentUserId));
          return normalized;
        });
      }

      let lItems = [];
      if (leaves.status === "fulfilled" && Array.isArray(leaves.value)) {
        lItems = leaves.value.map(normalizeLeaveToActivity);
      }

      // merge both and sort by createdAt desc
      const merged = [...mItems, ...lItems].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const pageSlice = merged.slice(s, s + limit);
      if (replace) setItems(pageSlice);
      else setItems(prev => [...prev, ...pageSlice]);

      setHasMore(merged.length > s + limit);
      setLastFetchAt(new Date().toISOString());
    } catch (err) {
      console.error("RecentActivity fetch error", err);
      setError(err?.message || "Failed to load activity");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [apiFetch, pageSize, currentUserId]);

  // initial load
  useEffect(() => {
    fetchActivity({ replace: true, limit: pageSize, skip: 0 });
    setSkip(0);
  }, [fetchActivity, pageSize]);

  // polling
  useEffect(() => {
    if (!pollInterval) return () => {};
    const id = setInterval(() => {
      // refresh newest page
      fetchActivity({ replace: true, limit: pageSize, skip: 0 });
    }, pollInterval);
    return () => clearInterval(id);
  }, [fetchActivity, pollInterval, pageSize]);

  // load more
  async function loadMore() {
    const next = skip + pageSize;
    setSkip(next);
    await fetchActivity({ replace: false, limit: pageSize, skip: next });
  }

  // mark message as read (if item.type === 'message')
  async function markItemRead(item) {
    if (item.type !== "message") return;
    // if item has an id and API supports POST /api/messages/:id/read
    try {
      if (item.unread) {
        await apiFetch(`/api/messages/${item.id}/read`, { method: "POST" });
        // mark locally
        setItems(prev => prev.map(it => it.id === item.id ? { ...it, unread: false } : it));
      }
    } catch (err) {
      console.warn("mark read failed", err);
    }
  }

  // open item (default: mark read + navigate or show details)
  function onClickItem(item) {
    // mark read if message
    markItemRead(item);
    // optionally: emit a global event for UI to open details
    window.dispatchEvent(new CustomEvent("activity:open", { detail: item }));
  }

  const unreadCount = useMemo(() => items.filter(it => it.unread).length, [items]);

  return (
    <section className="recent-activity modern-activity-card" aria-labelledby="recent-activity-title" style={{ padding: 14 }}>
      <div className="ra-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <h3 id="recent-activity-title" style={{ margin: 0 }}>Recent Activity</h3>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ fontSize: 13, color: "#475569" }}>{unreadCount ? `${unreadCount} unread` : "All caught up"}</div>
          <button className="btn small ghost" onClick={() => fetchActivity({ replace: true, limit: pageSize, skip: 0 })}>Refresh</button>
        </div>
      </div>

      <ul role="list" style={{ listStyle: "none", padding: 0, margin: "12px 0", display: "grid", gap: 10 }}>
        {loading ? (
          <li>Loading…</li>
        ) : error ? (
          <li style={{ color: "crimson" }}>{error}</li>
        ) : items.length === 0 ? (
          <li className="muted">No recent activity</li>
        ) : items.map((it) => (
          <li key={it.id} className={`activity-item ${it.unread ? "unread" : "read"}`} onClick={() => onClickItem(it)} style={{
            display: "flex",
            gap: 12,
            alignItems: "flex-start",
            padding: 10,
            borderRadius: 10,
            cursor: "pointer",
            background: it.unread ? "linear-gradient(180deg,#fff8f0,#fff)" : "white",
            border: "1px solid rgba(15,23,42,0.04)"
          }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>
              {(it.actor && (it.actor.name || it.actor.username) ? (it.actor.name || it.actor.username) : String(it.type || "X")).charAt(0).toUpperCase()}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <div>
                  <div style={{ fontWeight: 800 }}>{it.actor?.name || it.actor?.username || (it.type === "system" ? "System" : "Unknown")}</div>
                  <div style={{ fontSize: 13, color: "#475569" }}>{it.text}</div>
                </div>
                <div style={{ textAlign: "right", minWidth: 96 }}>
                  <div style={{ fontSize: 12, color: "#64748b" }}>{it.meta}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}>{niceTime(it.createdAt)}</div>
                </div>
              </div>

              <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                {it.type === "message" && it.unread && <button className="btn tiny ghost" onClick={(e) => { e.stopPropagation(); markItemRead(it); }}>Mark read</button>}
                <button className="btn tiny ghost" onClick={(e) => { e.stopPropagation(); window.alert(`Open details for ${it.type} — id ${it.id}`); }}>Details</button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
        <div style={{ fontSize: 12, color: "#94a3b8" }}>{lastFetchAt ? `Updated ${niceTime(lastFetchAt)}` : ""}</div>
        <div>
          {hasMore ? (
            <button className="btn small" onClick={loadMore} disabled={loadingMore}>{loadingMore ? "Loading…" : "Load more"}</button>
          ) : (
            <button className="btn small ghost" onClick={() => { setSkip(0); fetchActivity({ replace: true, limit: pageSize, skip: 0 }); }}>Refresh</button>
          )}
        </div>
      </div>
    </section>
  );
}

