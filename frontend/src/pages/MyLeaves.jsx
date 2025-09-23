import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { format } from "date-fns";

/**
 * MyLeaves.jsx
 * Shows the leaves relevant to the logged-in user (employee => their leaves; manager => their own leaves)
 *
 * Important:
 * - Uses apiFetch('/api/leaves') which your backend provides and which the AuthProvider attaches token to.
 * - To support cancellation this calls DELETE /api/leaves/:id. If backend lacks that route you'll see a 404/405 message.
 */

const PAGE_SIZES = [6, 12, 18];

function formatDateISO(d) {
  try {
    return format(new Date(d), "yyyy-MM-dd");
  } catch {
    return d || "";
  }
}

function toCSV(rows) {
  const headers = ["id", "employee", "type", "from", "to", "status", "reason"];
  const lines = [headers.join(",")];
  for (const r of rows) {
    const fields = [
      (r._id || r.id || "").toString(),
      `"${(r.employeeId?.name || r.employeeId?.username || "").replace(/"/g, '""')}"`,
      (r.type || ""),
      (formatDateISO(r.from) || ""),
      (formatDateISO(r.to) || ""),
      (r.status || ""),
      `"${(r.reason || "").replace(/"/g, '""')}"`
    ];
    lines.push(fields.join(","));
  }
  return lines.join("\n");
}

export default function MyLeaves() {
  const { apiFetch, user } = useAuth();

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortDir, setSortDir] = useState("desc");
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [page, setPage] = useState(1);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      // backend returns the leaves relevant to the logged-in user
      const data = await apiFetch("/api/leaves");
      setLeaves(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Load leaves error", err);
      setError(err?.message || "Failed to load leaves");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener("leaves:updated", handler);
    return () => window.removeEventListener("leaves:updated", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const filtered = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    return (leaves || [])
      .filter((l) => {
        if (statusFilter !== "All" && (l.status || "") !== statusFilter) return false;
        if (!q) return true;
        const emp = (l.employeeId?.name || l.employeeId?.username || "").toLowerCase();
        return (
          emp.includes(q) ||
          (l.type || "").toLowerCase().includes(q) ||
          (l.reason || "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const va = new Date(a.from).getTime();
        const vb = new Date(b.from).getTime();
        return sortDir === "asc" ? va - vb : vb - va;
      });
  }, [leaves, query, statusFilter, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [pageSize, totalPages, page]);

  const start = (page - 1) * pageSize;
  const visible = filtered.slice(start, start + pageSize);

  async function handleCancel(id) {
    if (!confirm("Cancel this leave request? This action cannot be undone.")) return;
    try {
      // try delete; backend must implement DELETE /api/leaves/:id for this to succeed
      await apiFetch(`/api/leaves/${id}`, { method: "DELETE" });
      window.dispatchEvent(new CustomEvent("leaves:updated"));
    } catch (err) {
      // backend might not support DELETE; show clear message
      console.error("Cancel leave failed", err);
      if (err.status === 404 || err.status === 405) {
        alert("Cancel not available on the server. Implement DELETE /api/leaves/:id or use an equivalent endpoint.");
      } else {
        alert(err.message || "Failed to cancel leave");
      }
    }
  }

  async function exportCSV() {
    const csv = toCSV(filtered);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `my-leaves-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="page my-leaves-page">
      <div className="page-header">
        <h2>My Leaves</h2>
        <p className="muted">All leave requests relevant to <strong>{user?.name || user?.username}</strong></p>
      </div>

      <div className="controls-row" style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
        <input
          placeholder="Search employee, type or reason..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          style={{ flex: 1, padding: "8px 10px", borderRadius: 10, border: "1px solid rgba(15,23,42,0.06)" }}
        />

        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} style={{ padding: "8px 10px", borderRadius: 10 }}>
          {["All","Pending","Approved","Rejected"].map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select value={sortDir} onChange={(e) => setSortDir(e.target.value)} style={{ padding: "8px 10px", borderRadius: 10 }}>
          <option value="desc">Newest</option>
          <option value="asc">Oldest</option>
        </select>

        <button className="btn ghost" onClick={exportCSV}>Export CSV</button>
      </div>

      <div className="table-wrap modern-card" style={{ overflowX: "auto" }}>
        {loading ? (
          <div style={{ padding: 20 }}>Loading…</div>
        ) : error ? (
          <div style={{ padding: 20, color: "crimson" }}>{error}</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 20 }}>No leaves found.</div>
        ) : (
          <table className="modern-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "10px 12px" }}>#</th>
                <th style={{ textAlign: "left", padding: "10px 12px" }}>Employee</th>
                <th style={{ textAlign: "left", padding: "10px 12px" }}>Type</th>
                <th style={{ textAlign: "left", padding: "10px 12px" }}>From</th>
                <th style={{ textAlign: "left", padding: "10px 12px" }}>To</th>
                <th style={{ textAlign: "left", padding: "10px 12px" }}>Status</th>
                <th style={{ textAlign: "left", padding: "10px 12px" }}>Reason</th>
                <th style={{ textAlign: "center", padding: "10px 12px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((l, idx) => (
                <tr key={l._id || l.id} style={{ borderTop: "1px solid rgba(15,23,42,0.04)" }}>
                  <td style={{ padding: "12px" }}>{start + idx + 1}</td>
                  <td style={{ padding: "12px" }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10, background: "#eef2ff",
                        display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700
                      }}>
                        {(l.employeeId?.name || l.employeeId?.username || "U").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700 }}>{l.employeeId?.name || l.employeeId?.username}</div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>#{String(l.employeeId?._id || "").slice(0,6)}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px" }}>{l.type}</td>
                  <td style={{ padding: "12px" }}>{formatDateISO(l.from)}</td>
                  <td style={{ padding: "12px" }}>{formatDateISO(l.to)}</td>
                  <td style={{ padding: "12px" }}>
                    <span className={`status-chip ${String(l.status || "").toLowerCase()}`}>{l.status}</span>
                  </td>
                  <td style={{ padding: "12px" }}>{l.reason}</td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    {user?.role === "employee" && l.status === "Pending" ? (
                      <button className="btn ghost tiny" onClick={() => handleCancel(l._id || l.id)}>Cancel</button>
                    ) : (
                      <small className="muted">—</small>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* footer row: pagination */}
      <div className="footer-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
        <div>
          <small>Showing {Math.min(filtered.length, start+1)}–{Math.min(start+pageSize, filtered.length)} of {filtered.length}</small>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button className="btn small" onClick={() => setPage(1)} disabled={page === 1}>«</button>
          <button className="btn small" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}>‹</button>

          <div style={{ display: "flex", gap: 6 }}>
            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1;
              if (Math.abs(p - page) > 3 && p !== 1 && p !== totalPages) return null;
              return (
                <button
                  key={p}
                  className={`btn page-num ${p === page ? "active" : ""}`}
                  onClick={() => setPage(p)}
                  style={{ minWidth: 36 }}
                >
                  {p}
                </button>
              );
            })}
          </div>

          <button className="btn small" onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}>›</button>
          <button className="btn small" onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</button>

          <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} style={{ padding: "6px 8px", borderRadius: 8 }}>
            {PAGE_SIZES.map(n => <option key={n} value={n}>{n}/page</option>)}
          </select>
        </div>
      </div>

      <style>{`
        .modern-table th { background:transparent; text-transform:none; font-weight:700; color:#0b1220; font-size:13px; }
        .status-chip { display:inline-block; padding:6px 8px; border-radius:8px; font-weight:700; font-size:12px; }
        .status-chip.pending { background:#fff7ed; color:#92400e; border:1px solid rgba(245,158,11,0.08); }
        .status-chip.approved { background:#ecfdf5; color:#065f46; }
        .status-chip.rejected { background:#fff1f2; color:#9f1239; }
        .btn.ghost.tiny { padding:6px 8px; font-size:13px; border-radius:8px; }
        .btn.small { padding:6px 8px; border-radius:8px; background: #f8fafc; border:1px solid rgba(15,23,42,0.04); cursor:pointer; }
        .btn.page-num.active { background:#0ea5e9; color:white; }
        @media (max-width: 880px) {
          .grid { grid-template-columns: 1fr; }
          .controls-row { flex-direction:column; align-items:stretch; gap:8px; }
        }
      `}</style>
    </div>
  );
}
