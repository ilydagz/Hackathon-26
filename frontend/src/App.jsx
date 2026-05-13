import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Feed from './pages/Feed';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import InfoPage from './pages/InfoPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPosts from './pages/admin/AdminPosts';
import AdminUsers from './pages/admin/AdminUsers';
import AdminLogs from './pages/admin/AdminLogs';

// Role Based Access Control Wrapper
const AdminRoute = ({ children }) => {
  const role = localStorage.getItem('role');
  if (role !== 'admin') {
    return <Navigate to="/feed" replace />;
  }
  return children;
};

const UserRoute = ({ children }) => {
  const role = localStorage.getItem('role');
  if (role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  return children;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('auth') === 'true'
  );
  const [userRole, setUserRole] = useState(
    localStorage.getItem('role') || 'user'
  );

  // Sync auth state if changed elsewhere (e.g. login/logout)
  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(localStorage.getItem('auth') === 'true');
      setUserRole(localStorage.getItem('role') || 'user');
    };
    window.addEventListener('storage', handleStorageChange);
    // Custom event to handle local changes in same window
    window.addEventListener('auth-change', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-change', handleStorageChange);
    };
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-app-bg text-on-background flex flex-col font-body-main antialiased selection:bg-primary-container selection:text-on-primary-container">
        {/* Only show global Navbar for authenticated users who are NOT admins */}
        {isAuthenticated && userRole !== 'admin' && <Navbar />}
        <main className="flex-grow flex flex-col">
          <Routes>
            {/* Unauthenticated Routes */}
            {!isAuthenticated ? (
              <>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/info/:topic" element={<InfoPage />} />
                {/* Redirect any unknown route to landing if not authenticated */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            ) : (
              <>
                {/* Admin Routes */}
                {userRole === 'admin' && (
                  <>
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route index element={<AdminDashboard />} />
                      <Route path="posts" element={<AdminPosts />} />
                      <Route path="users" element={<AdminUsers />} />
                      <Route path="logs" element={<AdminLogs />} />
                    </Route>
                    {/* Admins are redirected to /admin everywhere else */}
                    <Route path="*" element={<Navigate to="/admin" replace />} />
                  </>
                )}

                {/* Regular User Routes */}
                {userRole !== 'admin' && (
                  <>
                    <Route path="/feed" element={<Feed />} />
                    <Route path="/messages" element={<Chat />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/info/:topic" element={<InfoPage />} />
                    
                    <Route path="/" element={<Navigate to="/feed" replace />} />
                    <Route path="/login" element={<Navigate to="/feed" replace />} />
                    <Route path="/register" element={<Navigate to="/feed" replace />} />
                    <Route path="/admin/*" element={<Navigate to="/feed" replace />} />
                    <Route path="*" element={<Navigate to="/feed" replace />} />
                  </>
                )}
              </>
            )}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
