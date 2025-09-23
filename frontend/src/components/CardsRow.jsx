// import React from "react";

// const cards = [
//   { title: "Leave Balance", value: "12 days", variant: "positive" },
//   { title: "Pending Approvals", value: "2", variant: "alert" },
//   { title: "Upcoming Holidays", value: "1", variant: "info" },
// ];

// export default function CardsRow() {
//   return (
//     <div className="cards-row">
//       {cards.map((c) => (
//         <div key={c.title} className={`card ${c.variant}`}>
//           <div className="card-title">{c.title}</div>
//           <div className="card-value">{c.value}</div>
//         </div>
//       ))}
//     </div>
//   );
// }

// import React, { useEffect, useMemo, useState } from "react";
// import { useAuth } from "../auth/AuthProvider";

// /**
//  * CardsRow - dynamic summary cards
//  *
//  * Assumptions:
//  * - Employee monthly allowance: 5 days per calendar month.
//  * - apiFetch('/api/leaves') returns:
//  *    - for employee: their leaves
//  *    - for manager: leaves where managerId == manager
//  * - apiFetch supports ?status=Pending or ?status=Approved
//  *
//  * Behaviour:
//  * - computes days taken within current month (inclusive)
//  * - pending approvals shown differently for employee vs manager
//  * - upcoming leaves => approved leaves with any overlap in next N days
//  */
// const MONTH_ALLOWANCE = 5;
// const UPCOMING_DAYS = 30;
// const MS_PER_DAY = 1000 * 60 * 60 * 24;

// function parseDate(d) {
//   // incoming dates may be ISO strings
//   if (!d) return null;
//   return new Date(d);
// }

// function daysOverlap(startA, endA, startB, endB) {
//   const s = Math.max(startA.getTime(), startB.getTime());
//   const e = Math.min(endA.getTime(), endB.getTime());
//   if (e < s) return 0;
//   // inclusive days
//   return Math.floor((e - s) / MS_PER_DAY) + 1;
// }

// export default function CardsRow() {
//   const { apiFetch, user } = useAuth();
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [leaves, setLeaves] = useState([]);
//   const [pendingCount, setPendingCount] = useState(0);
//   const [approvedUpcomingCount, setApprovedUpcomingCount] = useState(0);
//   const [totalCount, setTotalCount] = useState(0);

//   async function loadData() {
//     setLoading(true);
//     setError(null);

//     try {
//       // 1) fetch all leaves relevant to the current user (employee => their leaves; manager => their assigned leaves)
//       const allLeaves = await apiFetch("/api/leaves");
//       setLeaves(Array.isArray(allLeaves) ? allLeaves : []);

//       // 2) pending
//       const pending = await apiFetch("/api/leaves?status=Pending");
//       setPendingCount(Array.isArray(pending) ? pending.length : 0);

//       // 3) approved (for upcoming)
//       const approved = await apiFetch("/api/leaves?status=Approved");
//       const approvedArr = Array.isArray(approved) ? approved : [];

//       // compute upcoming approved within next N days
//       const now = new Date();
//       const upcomingWindowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // today 00:00
//       const upcomingWindowEnd = new Date(upcomingWindowStart.getTime() + (UPCOMING_DAYS * MS_PER_DAY));
//       const upcomingCount = approvedArr.reduce((acc, l) => {
//         const from = parseDate(l.from);
//         const to = parseDate(l.to);
//         if (!from || !to) return acc;
//         const overlap = daysOverlap(from, to, upcomingWindowStart, upcomingWindowEnd);
//         return acc + (overlap > 0 ? 1 : 0);
//       }, 0);
//       setApprovedUpcomingCount(upcomingCount);

//       // total count (this year)
//       const yearStart = new Date(now.getFullYear(), 0, 1);
//       const yearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
//       const total = (Array.isArray(allLeaves) ? allLeaves : []).filter((l) => {
//         const from = parseDate(l.from);
//         const to = parseDate(l.to);
//         if (!from || !to) return false;
//         return daysOverlap(from, to, yearStart, yearEnd) > 0;
//       }).length;
//       setTotalCount(total);
//     } catch (err) {
//       console.error("CardsRow load error", err);
//       setError(err.message || "Failed to load summary");
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     loadData();
//     // refresh when leaves are updated elsewhere
//     const handler = () => loadData();
//     window.addEventListener("leaves:updated", handler);
//     return () => window.removeEventListener("leaves:updated", handler);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [user?.id]);

//   // compute days taken in current month (employee view)
//   const daysTakenThisMonth = useMemo(() => {
//     if (!user || !leaves || leaves.length === 0) return 0;
//     const now = new Date();
//     const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
//     const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
//     return leaves.reduce((acc, l) => {
//       const from = parseDate(l.from);
//       const to = parseDate(l.to);
//       if (!from || !to) return acc;
//       const overlap = daysOverlap(from, to, monthStart, monthEnd);
//       return acc + overlap;
//     }, 0);
//   }, [leaves, user]);

//   const remainingThisMonth = Math.max(0, MONTH_ALLOWANCE - daysTakenThisMonth);

//   return (
//     <div className="cards-row" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
//       <div className="card balance">
//         <div className="card-title">Leave Balance (this month)</div>
//         <div className="card-value" aria-live="polite">
//           {loading ? "…" : `${remainingThisMonth} / ${MONTH_ALLOWANCE} days`}
//         </div>
//         <div className="card-sub">
//           {loading ? "Loading…" : daysTakenThisMonth > 0 ? `${daysTakenThisMonth} day(s) used this month` : "No leaves taken this month"}
//         </div>
//       </div>

//       <div className="card pending">
//         <div className="card-title">{user?.role === "manager" ? "Pending Approvals" : "Pending Requests"}</div>
//         <div className="card-value">{loading ? "…" : pendingCount}</div>
//         <div className="card-sub">{loading ? "" : user?.role === "manager" ? "Requests awaiting your action" : "Your pending requests"}</div>
//       </div>

//       <div className="card upcoming">
//         <div className="card-title">Upcoming (next {UPCOMING_DAYS} days)</div>
//         <div className="card-value">{loading ? "…" : approvedUpcomingCount}</div>
//         <div className="card-sub">{loading ? "" : user?.role === "manager" ? "Team approved upcoming leaves" : "Your approved upcoming leaves"}</div>
//       </div>

//       <div className="card total">
//         <div className="card-title">{user?.role === "manager" ? "Team Leaves (this year)" : "My leaves (this year)"}</div>
//         <div className="card-value">{loading ? "…" : totalCount}</div>
//         <div className="card-sub">{loading ? "" : "Total leaves overlapping this year"}</div>
//       </div>

//       {error && (
//         <div style={{ gridColumn: "1 / -1", color: "crimson", marginTop: 8 }}>
//           {error}
//         </div>
//       )}

//       <style jsx>{`
//         .card {
//           background: white;
//           border-radius: 10px;
//           padding: 14px;
//           box-shadow: 0 8px 20px rgba(16, 24, 40, 0.04);
//           border: 1px solid rgba(230, 235, 255, 0.6);
//         }
//         .card-title { color: #475569; font-weight:700; font-size:13px; margin-bottom:6px; }
//         .card-value { font-size:22px; font-weight:800; color:#0f172a; margin-bottom:6px; }
//         .card-sub { font-size:12px; color:#64748b; }
//       `}</style>
//     </div>
//   );
// }


import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { useNavigate } from "react-router-dom";

/**
 * CardsRow (per-employee allowance)
 *
 * - MONTH_ALLOWANCE applies to each employee per calendar month.
 * - Employee users see their own remaining days.
 * - Manager users see:
 *    - a "Team overview" (average remaining days across employees)
 *    - a dropdown to pick an employee and view their exact counts.
 *
 * Implementation detail:
 * - For managers we derive the team member list from the leaves returned by /api/leaves
 *   (unique employeeId entries). No backend change required.
 */

const MONTH_ALLOWANCE = 5;
const UPCOMING_DAYS = 30;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

function parseDate(d) {
  if (!d) return null;
  return new Date(d);
}
function daysOverlap(startA, endA, startB, endB) {
  const s = Math.max(startA.getTime(), startB.getTime());
  const e = Math.min(endA.getTime(), endB.getTime());
  if (e < s) return 0;
  return Math.floor((e - s) / MS_PER_DAY) + 1;
}

export default function CardsRow() {
  const { apiFetch, user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // allLeaves: for employees it's their own leaves; for managers it's team leaves
  const [allLeaves, setAllLeaves] = useState([]);

  // pending/approved counts fetched separately (server filters)
  const [pendingCount, setPendingCount] = useState(0);
  const [approvedUpcomingCount, setApprovedUpcomingCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // manager-specific state: selected employee to inspect
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]); // array of { id, username, name }

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const arrAll = await apiFetch("/api/leaves"); // employee -> own leaves; manager -> team leaves
      const arrPending = await apiFetch("/api/leaves?status=Pending");
      const arrApproved = await apiFetch("/api/leaves?status=Approved");

      setAllLeaves(Array.isArray(arrAll) ? arrAll : []);
      setPendingCount(Array.isArray(arrPending) ? arrPending.length : 0);

      // upcoming approved in next UPCOMING_DAYS
      const now = new Date();
      const upcomingWindowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const upcomingWindowEnd = new Date(upcomingWindowStart.getTime() + UPCOMING_DAYS * MS_PER_DAY);

      const upcomingCount = (Array.isArray(arrApproved) ? arrApproved : []).reduce((acc, l) => {
        const from = parseDate(l.from), to = parseDate(l.to);
        if (!from || !to) return acc;
        const overlap = daysOverlap(from, to, upcomingWindowStart, upcomingWindowEnd);
        return acc + (overlap > 0 ? 1 : 0);
      }, 0);
      setApprovedUpcomingCount(upcomingCount);

      // compute team members for manager view from arrAll
      if (user?.role === "manager") {
        // arrAll items contain employeeId { _id, username, name } if populated by backend
        const map = new Map();
        (Array.isArray(arrAll) ? arrAll : []).forEach((l) => {
          const e = l.employeeId;
          if (!e) return;
          const id = String(e._id || e);
          if (!map.has(id)) map.set(id, { id, username: e.username || id, name: e.name || e.username || `Emp ${id.slice(0,6)}` });
        });
        const members = Array.from(map.values());
        setTeamMembers(members);
        // default select first member if none selected
        if (!selectedEmployeeId && members.length > 0) setSelectedEmployeeId(members[0].id);
      }

      // total count for current year (exclude Rejected)
      const yearStart = new Date(now.getFullYear(), 0, 1);
      const yearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
      const nonRejected = (Array.isArray(arrAll) ? arrAll : []).filter((l) => String(l.status || "").toLowerCase() !== "rejected");
      const total = nonRejected.filter((l) => {
        const from = parseDate(l.from), to = parseDate(l.to);
        if (!from || !to) return false;
        return daysOverlap(from, to, yearStart, yearEnd) > 0;
      }).length;
      setTotalCount(total);

    } catch (err) {
      console.error("CardsRow load error", err);
      setError(err.message || "Failed to load summary");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    const handler = () => loadData();
    window.addEventListener("leaves:updated", handler);
    return () => window.removeEventListener("leaves:updated", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // helper: compute days taken in current month for a given employee id (or for the current user)
  const computeDaysTakenThisMonth = (employeeId) => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // filter leaves for the employee (or for current user if employeeId omitted)
    const relevant = (allLeaves || []).filter((l) => {
      if (String(l.status || "").toLowerCase() === "rejected") return false; // ignore rejected
      const eid = l.employeeId?._id || l.employeeId || l.employeeId?._id;
      const eStr = eid ? String(eid) : null;
      if (employeeId) return eStr === String(employeeId);
      // if employee user, compare to user.id
      return String(eStr) === String(user?.id);
    });

    const days = relevant.reduce((acc, l) => {
      const from = parseDate(l.from), to = parseDate(l.to);
      if (!from || !to) return acc;
      const overlap = daysOverlap(from, to, monthStart, monthEnd);
      return acc + overlap;
    }, 0);
    return days;
  };

  // helper: compute total approved upcoming for employee or team
  const computeApprovedUpcoming = (employeeId) => {
    // use allLeaves filtered by status Approved
    const approved = (allLeaves || []).filter((l) => String(l.status || "").toLowerCase() === "approved");
    const now = new Date();
    const upcomingWindowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const upcomingWindowEnd = new Date(upcomingWindowStart.getTime() + UPCOMING_DAYS * MS_PER_DAY);

    const arr = approved.filter((l) => {
      const eid = l.employeeId?._id || l.employeeId;
      if (employeeId) {
        if (String(eid) !== String(employeeId)) return false;
      }
      return true;
    });

    return arr.reduce((acc, l) => {
      const from = parseDate(l.from), to = parseDate(l.to);
      if (!from || !to) return acc;
      return acc + (daysOverlap(from, to, upcomingWindowStart, upcomingWindowEnd) > 0 ? 1 : 0);
    }, 0);
  };

  // compute per-employee remaining (for selectedEmployeeId or for current user)
  const {
    displayTitle,
    remainingThisMonth,
    usedThisMonth,
    upcomingCount,
    totalCountDisplay
  } = useMemo(() => {
    if (user?.role === "manager") {
      // show team overview (average) when no specific employee selected
      if (!selectedEmployeeId) {
        // compute remaining for every team member
        const remList = teamMembers.map((m) => {
          const used = computeDaysTakenThisMonth(m.id);
          return Math.max(0, MONTH_ALLOWANCE - used);
        });
        const avgRemaining = remList.length ? Math.round(remList.reduce((a, b) => a + b, 0) / remList.length) : MONTH_ALLOWANCE;
        const totalLeaves = totalCount; // already computed earlier
        return {
          displayTitle: `Team overview (${teamMembers.length} members)`,
          remainingThisMonth: avgRemaining,
          usedThisMonth: null,
          upcomingCount: approvedUpcomingCount,
          totalCountDisplay: totalLeaves
        };
      } else {
        // show data for selected employee
        const used = computeDaysTakenThisMonth(selectedEmployeeId);
        const remaining = Math.max(0, MONTH_ALLOWANCE - used);
        const upcoming = computeApprovedUpcoming(selectedEmployeeId);
        // compute total leaves for that employee in the year
        const now = new Date();
        const yearStart = new Date(now.getFullYear(), 0, 1);
        const yearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
        const totalForEmp = (allLeaves || []).filter((l) => {
          const eid = l.employeeId?._id || l.employeeId;
          if (String(eid) !== String(selectedEmployeeId)) return false;
          if (String(l.status || "").toLowerCase() === "rejected") return false;
          const from = parseDate(l.from), to = parseDate(l.to);
          if (!from || !to) return false;
          return daysOverlap(from, to, yearStart, yearEnd) > 0;
        }).length;
        return {
          displayTitle: `Employee: ${teamMembers.find(m => m.id === selectedEmployeeId)?.name || selectedEmployeeId}`,
          remainingThisMonth: remaining,
          usedThisMonth: used,
          upcomingCount: upcoming,
          totalCountDisplay: totalForEmp
        };
      }
    } else {
      // employee: show their own
      const used = computeDaysTakenThisMonth(null);
      const remaining = Math.max(0, MONTH_ALLOWANCE - used);
      const upcoming = computeApprovedUpcoming(null);
      return {
        displayTitle: "Your balance",
        remainingThisMonth: remaining,
        usedThisMonth: used,
        upcomingCount: upcoming,
        totalCountDisplay: totalCount
      };
    }
    // eslint-disable-next-line
  }, [user, allLeaves, teamMembers, selectedEmployeeId, pendingCount, approvedUpcomingCount, totalCount, loading]);

  // navigation helpers
  function goToApply() { navigate("/apply-leave"); }
  function goToPending() { navigate("/approvals"); }
  function goToMyLeaves() { navigate("/my-leaves"); }

  // UI: manager dropdown handler
  function handleSelectEmployee(e) {
    const v = e.target.value;
    setSelectedEmployeeId(v || null);
  }

  return (
    <div className="cards-row-modern">
      <div className="card glass balance" role="region" aria-label="Leave balance">
        <div className="card-top">
          <div className="card-title">{displayTitle}</div>
          <div className="card-action" onClick={goToApply} role="button" tabIndex={0}>Apply</div>
        </div>

        {/* manager: show dropdown to pick employee */}
        {user?.role === "manager" && (
          <div style={{ marginBottom: 8 }}>
            <label style={{ fontSize: 13, color: "#475569" }}>
              Inspect employee:
              <select value={selectedEmployeeId || ""} onChange={handleSelectEmployee} style={{ marginLeft: 8, padding: "6px 8px", borderRadius: 8 }}>
                <option value="">Team overview</option>
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name || m.username}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        <div className="card-value">
          <span className="big">{loading ? "…" : remainingThisMonth}</span>
          <span className="muted">/ {MONTH_ALLOWANCE} days</span>
        </div>

        <div className="progress-row" style={{ marginTop: 10 }}>
          <div className="progress-bar" aria-hidden style={{ flex: 1 }}>
            <div
              className="progress-fill"
              style={{
                width: `${Math.min(100, Math.round(((MONTH_ALLOWANCE - (remainingThisMonth || 0)) / MONTH_ALLOWANCE) * 100))}%`
              }}
            />
          </div>
          <div className="progress-meta" style={{ marginLeft: 12 }}>
            {loading ? "Loading…" : (usedThisMonth != null ? `${usedThisMonth} used` : `avg remaining ${remainingThisMonth}`)}
          </div>
        </div>
      </div>

      <div className="card glass pending" role="region" aria-label="Pending approvals">
        <div className="card-top">
          <div className="card-title">{user?.role === "manager" ? "Pending Approvals" : "Pending Requests"}</div>
          <div className="card-action" onClick={goToPending} role="button" tabIndex={0}>View</div>
        </div>

        <div className="card-value">
          <span className="big">{loading ? "…" : pendingCount}</span>
        </div>

        <div className="card-sub muted">
          {loading ? "" : user?.role === "manager" ? "Requests awaiting your action" : "Your pending requests"}
        </div>
      </div>

      <div className="card glass upcoming" role="region" aria-label="Upcoming leaves">
        <div className="card-top">
          <div className="card-title">Upcoming</div>
          <div className="card-action" onClick={goToMyLeaves} role="button" tabIndex={0}>Open</div>
        </div>

        <div className="card-value">
          <span className="big">{loading ? "…" : (loading ? "…" : approvedUpcomingCount)}</span>
        </div>

        <div className="card-sub muted">Next {UPCOMING_DAYS} days</div>
      </div>

      <div className="card glass total" role="region" aria-label="Total leaves">
        <div className="card-top">
          <div className="card-title">{user?.role === "manager" ? "Team Leaves (year)" : "My Leaves (year)"}</div>
          <div className="card-action" onClick={goToMyLeaves} role="button" tabIndex={0}>Open</div>
        </div>

        <div className="card-value">
          <span className="big">{loading ? "…" : totalCountDisplay}</span>
        </div>

        <div className="card-sub muted">Total overlapping this year</div>
      </div>

      {error && <div className="cards-error">{error}</div>}
    </div>
  );
}
