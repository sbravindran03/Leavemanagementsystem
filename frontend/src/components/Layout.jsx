// src/components/Layout.jsx
import React from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

/**
 * Layout wraps the main application UI (Header + Sidebar + content area)
 * Use this component for all protected routes so the Login page remains isolated.
 */
export default function Layout({ children }) {
  return (
    <div className="app">
      <Header />
      <div className="main-area">
        <Sidebar />
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
