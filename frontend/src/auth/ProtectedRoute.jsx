// src/auth/ProtectedRoute.jsx
import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthProvider'

export default function ProtectedRoute({ children }) {
  const auth = useAuth()
  const token = localStorage.getItem('lm_token')
  if (!auth.user && !token) {
    return <Navigate to="/login" replace />
  }
  return children
}
