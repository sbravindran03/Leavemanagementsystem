// import React from "react";

// export default function Header() {
//   return (
//     <header className="app-header">
//       <div className="brand">
//         <div className="logo">LM</div>
//         <div className="brand-title">LeaveManager</div>
//       </div>
//       <nav className="top-nav">
//         <span className="nav-item">Home</span>
//         <span className="nav-item">Apply Leave</span>
//         <span className="nav-item">Approvals</span>
//         <span className="nav-item">Reports</span>
//       </nav>

//       <div className="user-card">
//         <div className="avatar">R</div>
//         <div className="username">Ravindran</div>
//       </div>
//     </header>
//   );
// }
// import React from 'react'
// export default function Header(){
//   return (
//     <header className="app-header">
//       <div className="brand"><div className="logo">LM</div><div className="brand-title">LeaveManager</div></div>
//       {/* <nav className="top-nav"><span className="nav-item">Home</span></nav> */}
//       <div className="user-card"><div className="avatar">R</div><div className="username">Ravindran</div></div>
//     </header>
//   )
// }
import React from 'react'
import { useAuth } from '../auth/AuthProvider'

export default function Header(){
  const auth = useAuth()
  return (
    <header className="app-header">
      <div className="brand">
        <div className="logo">LM</div>
        <div className="brand-title">LeaveManager</div>
      </div>

      {/* <nav className="top-nav">
        <span className="nav-item">Home</span>
        <span className="nav-item">Apply Leave</span>
      </nav> */}

      <div className="user-card">
        {auth.user ? (
          <>
            <div className="avatar">{auth.user.name.charAt(0).toUpperCase()}</div>
            <div className="username">{auth.user.name}</div>
            <button className="btn ghost small" onClick={auth.logout}>Logout</button>
          </>
        ) : (
          <div className="username muted">Not signed in</div>
        )}
      </div>
    </header>
  )
}
