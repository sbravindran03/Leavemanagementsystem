📅 Leave Management System (LMS)

A full-stack Leave Management System built with React, Node.js, Express, and MongoDB.
It helps employees apply for leaves, managers review requests, track team leaves, and manage communication.

🚀 Features

🔐 Authentication & Authorization

JWT-based login & registration

Role-based access (employee, manager)

👤 User Management

Update profile (name)

Change password securely (bcrypt + JWT refresh)

Delete account with confirmation

📄 Leave Management

Employees can apply for leave

Managers can approve/reject leave requests

Track personal leave history & team leave requests

💬 Messaging

Send and receive messages between employees and managers

⚙️ Settings

Theme toggle (light/dark, saved to localStorage)

Email notifications preference (saved to DB)

Export account data (JSON download)

📊 Reports

View and analyze leave statistics

🛠️ Tech Stack
Frontend

⚛️ React (Vite)

📦 React Router

🔔 React Hot Toast (notifications)

🎨 Custom CSS (modern sidebar, cards, forms)

Backend

🟢 Node.js & Express

🗄️ MongoDB + Mongoose

🔐 JWT Authentication (with refresh)

🔑 bcrypt for password hashing



⚡ Getting Started
1️⃣ Clone the Repository
git clone https://github.com/your-username/LMS.git
cd LMS

2️⃣ Backend Setup
cd backend
npm install


Create a .env file in /backend:

PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/leave_management
JWT_SECRET=supersecretkey
JWT_EXPIRES_IN=7d


Run the backend:

npm run dev

3️⃣ Frontend Setup
cd ../frontend
npm install


Create a .env file in /frontend:

VITE_API_BASE_URL=http://localhost:4000


Run the frontend:

npm run dev


Now visit 👉 http://localhost:5173

📦 Deployment

Backend: Can be deployed on Render
, Railway
, or Heroku
.

Frontend: Can be deployed on Vercel
 or Netlify
.

🙌 Contributors

Ravindran SB – Full Stack Developer
