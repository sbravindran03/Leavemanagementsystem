// import React, { useEffect, useMemo, useState } from "react";

// /* Modern AppliedLeaves component
//  - search by employee/type/reason
//  - filter by status
//  - client-side sorting (by from date)
//  - clean UI with chips and subtle animations
//  - still uses MOCK_LEAVES; replace load with fetch() when backend ready
// */

// const MOCK_LEAVES = Array.from({ length: 37 }).map((_, i) => ({
//   id: i + 1,
//   employee: ["Ravi", "Shyam", "Vicky", "Alice", "Bob"][(i + 2) % 5],
//   type: ["Casual", "Sick", "Paid", "WFH"][i % 4],
//   from: new Date(2025, (i % 11), (i % 27) + 1).toISOString().slice(0, 10),
//   to: new Date(2025, (i % 11), (i % 27) + 1 + (i % 3)).toISOString().slice(0, 10),
//   status: ["Pending", "Approved", "Rejected"][i % 3],
//   reason: "Short note for leave",
// }));

// const STATUS_ORDER = ["All", "Pending", "Approved", "Rejected"];

// export default function AppliedLeaves({
//   pageSizeDefault = 6,
//   showPageSizeSelector = true,
// }) {
//   const [leaves, setLeaves] = useState([]);
//   const [query, setQuery] = useState("");
//   const [statusFilter, setStatusFilter] = useState("All");
//   const [pageSize, setPageSize] = useState(pageSizeDefault);
//   const [page, setPage] = useState(1);
//   const [sortDir, setSortDir] = useState("desc"); // sort by from date
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     setLoading(true);
//     const load = async () => {
//       await new Promise((r) => setTimeout(r, 250));
//       setLeaves(MOCK_LEAVES);
//       setLoading(false);
//     };
//     load();
//   }, []);

//   // derived filtered & sorted list
//   const filtered = useMemo(() => {
//     const q = query.trim().toLowerCase();
//     return leaves
//       .filter((l) => {
//         if (statusFilter !== "All" && l.status !== statusFilter) return false;
//         if (!q) return true;
//         return (
//           l.employee.toLowerCase().includes(q) ||
//           l.type.toLowerCase().includes(q) ||
//           l.reason.toLowerCase().includes(q)
//         );
//       })
//       .sort((a, b) => {
//         const va = new Date(a.from).getTime();
//         const vb = new Date(b.from).getTime();
//         return sortDir === "asc" ? va - vb : vb - va;
//       });
//   }, [leaves, query, statusFilter, sortDir]);

//   const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
//   useEffect(() => {
//     if (page > totalPages) setPage(totalPages);
//   }, [pageSize, totalPages, page]);

//   const start = (page - 1) * pageSize;
//   const visible = filtered.slice(start, start + pageSize);

//   function goTo(p) {
//     if (p < 1) p = 1;
//     if (p > totalPages) p = totalPages;
//     setPage(p);
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   }

//   function statusClass(s) {
//     return `status-chip ${s.toLowerCase()}`;
//   }

//   return (
//     <section className="applied-leaves modern-card">
//       <div className="card-header">
//         <div className="header-left">
//           <h2>Applied Leaves</h2>
//           <div className="sub">Team & personal leave applications</div>
//         </div>

//         <div className="header-actions">
//           <div className="search">
//             <input
//               aria-label="Search leaves"
//               placeholder="Search employee, type or reason..."
//               value={query}
//               onChange={(e) => {
//                 setQuery(e.target.value);
//                 setPage(1);
//               }}
//             />
//             <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24">
//               <path fill="currentColor" d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
//               <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2" fill="none"></circle>
//             </svg>
//           </div>

//           <div className="filters">
//             <select
//               title="Filter by status"
//               value={statusFilter}
//               onChange={(e) => {
//                 setStatusFilter(e.target.value);
//                 setPage(1);
//               }}
//             >
//               {STATUS_ORDER.map((s) => (
//                 <option key={s} value={s}>
//                   {s}
//                 </option>
//               ))}
//             </select>

//             <select
//               title="Sort by from date"
//               value={sortDir}
//               onChange={(e) => setSortDir(e.target.value)}
//             >
//               <option value="desc">Newest</option>
//               <option value="asc">Oldest</option>
//             </select>
//           </div>
//         </div>
//       </div>

//       <div className="card-body">
//         {loading ? (
//           <div className="loader">Loading…</div>
//         ) : filtered.length === 0 ? (
//           <div className="empty">No leaves found matching your criteria.</div>
//         ) : (
//           <>
//             <div className="table-wrap">
//               <table className="modern-table" role="table" aria-label="Applied leaves">
//                 <thead>
//                   <tr>
//                     <th>#</th>
//                     <th>Employee</th>
//                     <th>Type</th>
//                     <th>From</th>
//                     <th>To</th>
//                     <th>Status</th>
//                     <th className="reason-col">Reason</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {visible.map((l, idx) => (
//                     <tr key={l.id}>
//                       <td>{start + idx + 1}</td>
//                       <td>
//                         <div className="employee-cell">
//                           <div className="avatar-sm">{l.employee.charAt(0)}</div>
//                           <div>
//                             <div className="emp-name">{l.employee}</div>
//                             <div className="emp-sub">#EMP{String(l.id).padStart(3, "0")}</div>
//                           </div>
//                         </div>
//                       </td>
//                       <td>{l.type}</td>
//                       <td>{l.from}</td>
//                       <td>{l.to}</td>
//                       <td>
//                         <span className={statusClass(l.status)}>{l.status}</span>
//                       </td>
//                       <td className="reason-col">{l.reason}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             <div className="footer-row">
//               <div className="left-meta">
//                 <small>
//                   Showing {start + 1}–{Math.min(start + pageSize, filtered.length)} of{" "}
//                   {filtered.length} results
//                 </small>
//               </div>

//               <div className="pagination-controls">
//                 <div className="pager">
//                   <button className="btn small" onClick={() => goTo(1)} disabled={page === 1}>
//                     «
//                   </button>
//                   <button className="btn small" onClick={() => goTo(page - 1)} disabled={page === 1}>
//                     ‹
//                   </button>

//                   {/* compact numeric pages */}
//                   {Array.from({ length: totalPages }).map((_, i) => {
//                     const p = i + 1;
//                     // show window of 5 pages
//                     const windowSize = 5;
//                     const half = Math.floor(windowSize / 2);
//                     const startP = Math.max(1, Math.min(page - half, Math.max(1, totalPages - windowSize + 1)));
//                     const endP = Math.min(totalPages, startP + windowSize - 1);
//                     if (p < startP || p > endP) return null;
//                     return (
//                       <button
//                         key={p}
//                         className={`btn page-num ${p === page ? "active" : ""}`}
//                         onClick={() => goTo(p)}
//                         aria-current={p === page ? "page" : undefined}
//                       >
//                         {p}
//                       </button>
//                     );
//                   })}

//                   <button className="btn small" onClick={() => goTo(page + 1)} disabled={page === totalPages}>
//                     ›
//                   </button>
//                   <button className="btn small" onClick={() => goTo(totalPages)} disabled={page === totalPages}>
//                     »
//                   </button>
//                 </div>

//                 {showPageSizeSelector && (
//                   <div className="page-size">
//                     <label>
//                       Show
//                       <select
//                         value={pageSize}
//                         onChange={(e) => {
//                           setPageSize(Number(e.target.value));
//                           setPage(1);
//                         }}
//                       >
//                         {[6, 12, 18].map((n) => (
//                           <option key={n} value={n}>
//                             {n}
//                           </option>
//                         ))}
//                       </select>
//                       /page
//                     </label>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </>
//         )}
//       </div>
//     </section>
//   );
// }

// src/components/AppliedLeaves.jsx
import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../auth/AuthProvider'

export default function AppliedLeaves({ pageSizeDefault = 6 }) {
  const { apiFetch, user } = useAuth()
  const [leaves, setLeaves] = useState([])
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [pageSize, setPageSize] = useState(pageSizeDefault)
  const [page, setPage] = useState(1)
  const [sortDir, setSortDir] = useState('desc')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function loadLeaves() {
    try {
      setLoading(true)
      setError(null)
      // managers might want to see pending by default
      const qs = []
      if (statusFilter && statusFilter !== 'All') qs.push(`status=${encodeURIComponent(statusFilter)}`)
      // manager view: by default show Pending; employee view: server returns their own leaves
      const qstr = qs.length ? `?${qs.join('&')}` : ''
      const data = await apiFetch(`/api/leaves${qstr}`)
      setLeaves(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Load leaves error', err)
      setError(err.message || 'Failed to load leaves')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLeaves()
    // listen for when a leave is created/updated elsewhere
    const handler = () => loadLeaves()
    window.addEventListener('leaves:updated', handler)
    return () => window.removeEventListener('leaves:updated', handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, sortDir, pageSize, user?.id])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return leaves
      .filter((l) => {
        if (statusFilter !== 'All' && l.status !== statusFilter) return false
        if (!q) return true
        return (
          String(l.employeeId?.username || l.employeeId?.name || '')
            .toLowerCase()
            .includes(q) ||
          (l.type || '').toLowerCase().includes(q) ||
          (l.reason || '').toLowerCase().includes(q)
        )
      })
      .sort((a, b) => {
        const va = new Date(a.from).getTime()
        const vb = new Date(b.from).getTime()
        return sortDir === 'asc' ? va - vb : vb - va
      })
  }, [leaves, query, statusFilter, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [pageSize, totalPages, page])

  const start = (page - 1) * pageSize
  const visible = filtered.slice(start, start + pageSize)

  async function approve(id) {
    try {
      await apiFetch(`/api/leaves/${id}/approve`, { method: 'POST' })
      // refresh
      window.dispatchEvent(new CustomEvent('leaves:updated'))
    } catch (err) {
      alert(err.message || 'Approve failed')
    }
  }

  async function reject(id) {
    try {
      await apiFetch(`/api/leaves/${id}/reject`, { method: 'POST' })
      window.dispatchEvent(new CustomEvent('leaves:updated'))
    } catch (err) {
      alert(err.message || 'Reject failed')
    }
  }

  function goTo(p) {
    if (p < 1) p = 1
    if (p > totalPages) p = totalPages
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <section className="applied-leaves modern-card">
      <div className="card-header">
        <div className="header-left">
          <h2>Applied Leaves</h2>
          <div className="sub">Team & personal leave applications</div>
        </div>

        <div className="header-actions">
          <div className="search">
            <input
              placeholder="Search employee, type or reason..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setPage(1)
              }}
            />
          </div>

          <div className="filters">
            <select
              title="Filter by status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
            >
              {['All', 'Pending', 'Approved', 'Rejected'].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select title="Sort by from date" value={sortDir} onChange={(e) => setSortDir(e.target.value)}>
              <option value="desc">Newest</option>
              <option value="asc">Oldest</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card-body">
        {loading ? (
          <div className="loader">Loading…</div>
        ) : error ? (
          <div className="empty">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="empty">No leaves found matching your criteria.</div>
        ) : (
          <>
            <div className="table-wrap">
              <table className="modern-table" role="table" aria-label="Applied leaves">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Employee</th>
                    <th>Type</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Status</th>
                    <th className="reason-col">Reason</th>
                    <th className="actions-col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((l, idx) => (
                    <tr key={l._id || l.id}>
                      <td>{start + idx + 1}</td>
                      <td>
                        <div className="employee-cell">
                          <div className="avatar-sm">
                            {(l.employeeId?.name || l.employeeId?.username || 'U').charAt(0)}
                          </div>
                          <div>
                            <div className="emp-name">{l.employeeId?.name || l.employeeId?.username}</div>
                            <div className="emp-sub">#{String(l.employeeId?._id || '').slice(0, 6)}</div>
                          </div>
                        </div>
                      </td>
                      <td>{l.type}</td>
                      <td>{(new Date(l.from)).toISOString().slice(0,10)}</td>
                      <td>{(new Date(l.to)).toISOString().slice(0,10)}</td>
                      <td>
                        <span className={`status-chip ${String(l.status || '').toLowerCase()}`}>{l.status}</span>
                      </td>
                      <td className="reason-col">{l.reason}</td>
                      <td className="actions-col">
                        {/* manager actions */}
                        {user?.role === 'manager' && l.status === 'Pending' ? (
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn small" onClick={() => approve(l._id)}>Approve</button>
                            <button className="btn small" onClick={() => reject(l._id)}>Reject</button>
                          </div>
                        ) : (
                          <small className="muted">—</small>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="footer-row">
              <div className="left-meta">
                <small>
                  Showing {start + 1}–{Math.min(start + pageSize, filtered.length)} of {filtered.length} results
                </small>
              </div>

              <div className="pagination-controls">
                <div className="pager">
                  <button className="btn small" onClick={() => goTo(1)} disabled={page === 1}>
                    «
                  </button>
                  <button className="btn small" onClick={() => goTo(page - 1)} disabled={page === 1}>
                    ‹
                  </button>

                  {Array.from({ length: totalPages }).map((_, i) => {
                    const p = i + 1
                    const windowSize = 5
                    const half = Math.floor(windowSize / 2)
                    const startP = Math.max(1, Math.min(page - half, Math.max(1, totalPages - windowSize + 1)))
                    const endP = Math.min(totalPages, startP + windowSize - 1)
                    if (p < startP || p > endP) return null
                    return (
                      <button key={p} className={`btn page-num ${p === page ? 'active' : ''}`} onClick={() => goTo(p)}>
                        {p}
                      </button>
                    )
                  })}

                  <button className="btn small" onClick={() => goTo(page + 1)} disabled={page === totalPages}>
                    ›
                  </button>
                  <button className="btn small" onClick={() => goTo(totalPages)} disabled={page === totalPages}>
                    »
                  </button>
                </div>

                <div className="page-size">
                  <label>
                    Show
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value))
                        setPage(1)
                      }}
                    >
                      {[6, 12, 18].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                    /page
                  </label>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
