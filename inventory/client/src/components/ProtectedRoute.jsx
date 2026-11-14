// ProtectedRoute.jsx: Route guard ensuring user is authenticated
import React from 'react';
import { Navigate } from 'react-router-dom';
import Navbar from './Navbar';

/**
 * Higher-order wrapper component for protected pages.
 * If no JWT token is stored in localStorage, redirects user to /login.
 * Otherwise, renders the persistent Navbar and child page content.
 */
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');

  // If not logged in, redirect to login page
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Navbar />
      <main className="main-container">
        {children}
      </main>
    </>
  );
}

export default ProtectedRoute;
