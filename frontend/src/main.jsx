// import React from 'react'
// import { createRoot } from 'react-dom/client'
// import { BrowserRouter } from 'react-router-dom'
// import App from './App'
// import { AuthProvider } from './auth/AuthProvider'
// import './styles/variables.css'
// import './styles/layout.css'
// import './styles/sidebar.css'
// import './styles/dashboard.css'
// import './styles/form.css'

// const container = document.getElementById('root')
// if (!container) throw new Error("No #root element — check index.html")
// const root = createRoot(container)
// root.render(
//   <React.StrictMode>
//     <BrowserRouter>
//       <AuthProvider>
//         <App />
//       </AuthProvider>
//     </BrowserRouter>
//   </React.StrictMode>
// )
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './auth/AuthProvider'
import { Toaster } from 'react-hot-toast'   // ✅ import

import './styles/variables.css'
import './styles/layout.css'
import './styles/header.css'
import './styles/sidebar.css'
import './styles/dashboard.css'
import './styles/form.css'

const container = document.getElementById('root')
const root = createRoot(container)
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster position="top-right" />   {/* ✅ Toast container */}
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
