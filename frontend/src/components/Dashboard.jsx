// import React from "react";
// import CardsRow from "./CardsRow";
// // replaced ApplyLeaveForm with AppliedLeaves
// import AppliedLeaves from "./AppliedLeaves";
// import TeamCalendar from "./TeamCalendar";
// import RecentActivity from "./RecentActivity";

// export default function Dashboard() {
//   return (
//     <div className="dashboard">
//       <div className="page-header">
//         <h1>Dashboard</h1>
//         <p className="subtitle">Overview of leaves and quick actions</p>
//       </div>

//       <CardsRow />

//       <div className="dashboard-grid">
//         {/* Left column: Applied leaves with pagination */}
//         <AppliedLeaves />

//         <div className="right-column">
//           <TeamCalendar />
//           <RecentActivity />
//         </div>
//       </div>

//       <footer className="dashboard-footer">
//         Designed for Leave Management - Node.js + React + MongoDB
//       </footer>
//     </div>
//   );
// }
import React from 'react'
import CardsRow from './CardsRow'
import AppliedLeaves from './AppliedLeaves'
import TeamCalendar from './TeamCalendar'
import RecentActivity from './RecentActivity'

export default function Dashboard(){
  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p className="subtitle">Overview of leaves and quick actions</p>
      </div>

      <CardsRow />

      <div className="dashboard-grid">
        <AppliedLeaves />
        <div className="right-column">
          <TeamCalendar />
          <RecentActivity />
        </div>
      </div>

      <footer className="dashboard-footer">Designed for Leave Management - Node.js + React + MongoDB</footer>
    </div>
  )
}
