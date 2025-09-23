// import React from 'react'
// import { Routes, Route } from 'react-router-dom'
// import Header from './components/Header'
// import Sidebar from './components/Sidebar'
// import Dashboard from './components/Dashboard'
// import ApplyLeaveForm from './components/ApplyLeaveForm'
// import MyLeaves from './pages/MyLeaves'
// import TeamLeaves from './pages/TeamLeaves'
// import Approvals from './pages/Approvals'
// import Reports from './pages/Reports'
// import Settings from './pages/Settings'

// export default function App() {
//   return (
//     <div className="app">
//       <Header />
//       <div className="main-area">
//         <Sidebar />
//         <main className="content">
//           <Routes>
//             <Route path="/" element={<Dashboard />} />
//             <Route path="/apply-leave" element={<ApplyLeaveForm />} />
//             <Route path="/my-leaves" element={<MyLeaves />} />
//             <Route path="/team-leaves" element={<TeamLeaves />} />
//             <Route path="/approvals" element={<Approvals />} />
//             <Route path="/reports" element={<Reports />} />
//             <Route path="/settings" element={<Settings />} />
//             {/* fallback route */}
//             <Route path="*" element={<Dashboard />} />
//           </Routes>
//         </main>
//       </div>
//     </div>
//   )
// }

// import React from 'react'
// import { Routes, Route, Navigate } from 'react-router-dom'
// import Header from './components/Header'
// import Sidebar from './components/Sidebar'
// import Dashboard from './components/Dashboard'
// import Login from './pages/Login'
// import ProtectedRoute from './auth/ProtectedRoute'
// import ApplyLeaveForm from './components/ApplyLeaveForm'
// import MyLeaves from './pages/MyLeaves'
// import TeamLeaves from './pages/TeamLeaves'
// import Approvals from './pages/Approvals'
// import Reports from './pages/Reports'
// import Settings from './pages/Settings'

// export default function App() {
//   return (
//     <div className="app">
//       <Header />
//       <div className="main-area">
//         <Sidebar />
//         <main className="content">
//           <Routes>
//             <Route path="/login" element={<Login />} />

//             <Route
//               path="/*"
//               element={
//                 <ProtectedRoute>
//                   <Routes>
//                     <Route path="/" element={<Dashboard />} />
//                     <Route path="/apply-leave" element={<ApplyLeaveForm />} />
//                     <Route path="/my-leaves" element={<MyLeaves />} />
//                     <Route path="/team-leaves" element={<TeamLeaves />} />
//                     <Route path="/approvals" element={<Approvals />} />
//                     <Route path="/reports" element={<Reports />} />
//                     <Route path="/settings" element={<Settings />} />
//                     <Route path="*" element={<Navigate to="/" replace />} />
//                   </Routes>
//                 </ProtectedRoute>
//               }
//             />
//           </Routes>
//         </main>
//       </div>
//     </div>
//   )
// }

// src/App.jsx


// import React from "react";
// import { Routes, Route, Navigate } from "react-router-dom";

// import Layout from "./components/Layout";
// import ProtectedRoute from "./auth/ProtectedRoute";

// import Login from "./pages/Login";
// import AddEmployee from './pages/AddEmployee';
// import Dashboard from "./components/Dashboard";
// import ApplyLeaveForm from "./components/ApplyLeaveForm";
// import MyLeaves from "./pages/MyLeaves";
// import TeamLeaves from "./pages/TeamLeaves";
// import Approvals from "./pages/Approvals";
// import Reports from "./pages/Reports";
// import Settings from "./pages/Settings";

// export default function App() {
//   return (
//     <Routes>
//       {/* standalone login page (no header/sidebar) */}
//       <Route path="/login" element={<Login />} />

//       {/* All other routes are inside the layout and protected */}
//       <Route
//         path="/*"
//         element={
//           <ProtectedRoute>
//             <Layout>
//               <Routes>
//                 <Route path="/" element={<Dashboard />} />
//                 <Route path="/apply-leave" element={<ApplyLeaveForm />} />
//                 <Route path="/my-leaves" element={<MyLeaves />} />
//                 <Route path="/team-leaves" element={<TeamLeaves />} />
//                 <Route path="/approvals" element={<Approvals />} />
//                 <Route path="/reports" element={<Reports />} />
//                 <Route path="/settings" element={<Settings />} />
//                 <Route path="*" element={<Navigate to="/" replace />} />
//                 <Route path="/add-employee" element={<AddEmployee />} />
//               </Routes>
//             </Layout>
//           </ProtectedRoute>
//         }
//       />
//     </Routes>
//   );
// }


// src/App.jsx
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import ApplyLeaveForm from './components/ApplyLeaveForm'
import MyLeaves from './pages/MyLeaves'
import TeamLeaves from './pages/TeamLeaves'
import Messages from './pages/Messages'      // <-- new
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import AddEmployee from './pages/AddEmployee'
import Login from './pages/Login'
import ProtectedRoute from './auth/ProtectedRoute'

export default function App(){
  return (
    <div className="app">
      <Header />
      <div className="main-area">
        <Sidebar />
        <main className="content">
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/apply-leave" element={<ApplyLeaveForm />} />
                    <Route path="/my-leaves" element={<MyLeaves />} />
                    <Route path="/team-leaves" element={<TeamLeaves />} />
                    <Route path="/messages" element={<Messages />} />         {/* <-- messages */}
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/add-employee" element={<AddEmployee />} />
                  </Routes>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
