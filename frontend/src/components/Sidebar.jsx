// import React from 'react'
// import { NavLink } from 'react-router-dom'

// const menu = [
//   { name: 'Dashboard', path: '/' },
//   { name: 'Apply Leave', path: '/apply-leave' },
//   { name: 'My Leaves', path: '/my-leaves' },
//   { name: 'Team Leaves', path: '/team-leaves' },
//   { name: 'Approvals', path: '/approvals' },
//   { name: 'Reports', path: '/reports' },
//   { name: 'Settings', path: '/settings' }
// ]

// export default function Sidebar() {
//   return (
//     <aside className="sidebar">
//       <ul className="menu">
//         {menu.map(m => (
//           <li key={m.name} className="menu-item">
//             <NavLink
//               to={m.path}
//               end={m.path === '/'}
//               className={({ isActive }) => (isActive ? 'active' : '')}
//             >
//               {m.name}
//             </NavLink>
//             {m.name === 'Approvals' && <span className="badge">3</span>}
//           </li>
//         ))}
//       </ul>
//     </aside>
//   )
// }


// import React from 'react'
// import { NavLink } from 'react-router-dom'
// import { useAuth } from '../auth/AuthProvider'

// const menu = [
//   { name: 'Dashboard', path: '/' },
//   { name: 'Apply Leave', path: '/apply-leave' },
//   { name: 'My Leaves', path: '/my-leaves' },
//   { name: 'Team Leaves', path: '/team-leaves' },
//   { name: 'Approvals', path: '/approvals' },
//   { name: 'Reports', path: '/reports' },
//   { name: 'Settings', path: '/settings' }
// ]

// export default function Sidebar() {
//   const auth = useAuth()
//   const showAddEmployee = auth.user?.role === 'manager'

//   return (
//     <aside className="sidebar">
//       <ul className="menu">
//         {menu.map((m) => (
//           <li key={m.name} className="menu-item">
//             <NavLink
//               to={m.path}
//               end={m.path === '/'}
//               className={({ isActive }) => (isActive ? 'active' : '')}
//             >
//               {m.name}
//             </NavLink>
//             {m.name === 'Approvals' && <span className="badge">3</span>}
//           </li>
//         ))}

//         {/* Manager-only link */}
//         {showAddEmployee && (
//           <li className="menu-item">
//             <NavLink
//               to="/add-employee"
//               className={({ isActive }) => (isActive ? 'active' : '')}
//             >
//               Add Employee
//             </NavLink>
//           </li>
//         )}
//       </ul>
//     </aside>
//   )
// }


// src/components/Sidebar.jsx
// import React from 'react'
// import { NavLink } from 'react-router-dom'
// import { useAuth } from '../auth/AuthProvider'

// const menu = [
//   { name: 'Dashboard', path: '/' },
//   { name: 'Apply Leave', path: '/apply-leave' },
//   { name: 'My Leaves', path: '/my-leaves' },
//   { name: 'Team Leaves', path: '/team-leaves' },
//   { name: 'Messages', path: '/messages' },
//   { name: 'Reports', path: '/reports' },
//   { name: 'Settings', path: '/settings' }
// ]

// export default function Sidebar() {
//   const auth = useAuth()
//   const showAddEmployee = auth.user?.role === 'manager'

//   if (!auth.user) return null

//   return (
//     <aside className="sidebar">
//       <ul className="menu">
//         {menu.map((m) => (
//           <li key={m.name} className="menu-item">
//             <NavLink
//               to={m.path}
//               end={m.path === '/'}
//               className={({ isActive }) => (isActive ? 'active' : '')}
//             >
//               {m.name}
//             </NavLink>
//           </li>
//         ))}

//         {showAddEmployee && (
//           <li className="menu-item">
//             <NavLink to="/add-employee" className={({ isActive }) => (isActive ? 'active' : '')}>Add Employee</NavLink>
//           </li>
//         )}
//       </ul>
//     </aside>
//   )
// }

import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import "../styles/sidebar.css"

/**
 * Modern Sidebar
 * - Collapsible (toggle pin/unpin)
 * - Tooltips when collapsed
 * - Smooth animations, glassy + soft-shadow style
 * - Active indicator (animated) and hover states
 * - Shows manager-only Add Employee
 *
 * Usage: drop into src/components, overwrite CSS, restart dev server.
 */

const ITEMS = [
  { name: "Dashboard", path: "/", icon: "home" },
  { name: "Apply Leave", path: "/apply-leave", icon: "calendar" },
  { name: "My Leaves", path: "/my-leaves", icon: "file" },
  { name: "Team Leaves", path: "/team-leaves", icon: "team" },
  { name: "Messages", path: "/messages", icon: "message", badgeKey: "messages" },
  { name: "Reports", path: "/reports", icon: "chart" },
  { name: "Settings", path: "/settings", icon: "settings" }
];

function Icon({ name, size = 20 }) {
  const s = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg" };
  switch (name) {
    case "home":
      return <svg {...s}><path d="M3 11.5L12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V11.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
    case "calendar":
      return <svg {...s}><rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M16 3v4M8 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
    case "file":
      return <svg {...s}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="1.5"/><path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.5"/></svg>;
    case "team":
      return <svg {...s}><path d="M17 21v-2a4 4 0 0 0-3-3.87M7 21v-2a4 4 0 0 1 3-3.87M7 7a4 4 0 1 1 8 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
    case "message":
      return <svg {...s}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.5"/></svg>;
    case "chart":
      return <svg {...s}><path d="M3 3v18h18" stroke="currentColor" strokeWidth="1.5"/><path d="M7 13v6M12 9v10M17 5v14" stroke="currentColor" strokeWidth="1.5"/></svg>;
    case "settings":
      return <svg {...s}><circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.5"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
    default:
      return null;
  }
}

export default function Sidebar() {
  const auth = useAuth();
  const user = auth.user;
  const [collapsed, setCollapsed] = useState(false);
  const showAddEmployee = user?.role === "manager";

  // Example dynamic badges: you can read real counts from context or API
  const badges = { messages: user?.unreadMessages || 0 };

  if (!user) return null;

  return (
    <aside className={`modern-sidebar ${collapsed ? "collapsed" : "expanded"}`} aria-label="Main navigation">
      {/* <div className="top">
        <div className="brand">
          <div className="brand-logo" aria-hidden="true">LM</div>
          {!collapsed && (
            <div className="brand-text">
              <div className="title">Leave Manager</div>
              <div className="subtitle">Hi, {user.name || user.username}</div>
            </div>
          )}
        </div>

        <button
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="collapse-btn"
          onClick={() => setCollapsed(s => !s)}
          title={collapsed ? "Expand" : "Collapse"}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div> */}

      <nav className="nav">
        <ul className="nav-list">
          {ITEMS.map((it) => (
            <li key={it.path} className="nav-item" title={collapsed ? it.name : undefined}>
              <NavLink
                to={it.path}
                end={it.path === "/"}
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                aria-current={({ isActive }) => (isActive ? "page" : undefined)}
              >
                <span className="nav-icon"><Icon name={it.icon} /></span>
                <span className="nav-label">{it.name}</span>
                {it.badgeKey && badges[it.badgeKey] > 0 && (
                  <span className="nav-badge" aria-hidden="true">{badges[it.badgeKey]}</span>
                )}
                <span className="active-indicator" aria-hidden="true" />
              </NavLink>
            </li>
          ))}

          {showAddEmployee && (
            <li className="nav-item" title={collapsed ? "Add Employee" : undefined}>
              <NavLink to="/add-employee" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                <span className="nav-icon"><Icon name="team" /></span>
                <span className="nav-label">Add Employee</span>
                <span className="active-indicator" aria-hidden="true" />
              </NavLink>
            </li>
          )}
        </ul>
      </nav>

      <div className="footer">
        <button className="logout" onClick={() => auth.logout()} title="Sign out">
          <span className="logout-icon"><Icon name="settings" /></span>
          {!collapsed && <span className="logout-label">Sign out</span>}
        </button>
      </div>
    </aside>
  );
}
