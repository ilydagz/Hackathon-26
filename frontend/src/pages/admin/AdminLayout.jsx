import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../../api';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: 'dashboard' },
    { name: 'Posts', path: '/admin/posts', icon: 'list_alt' },
    { name: 'Users', path: '/admin/users', icon: 'group' },
    { name: 'Activity Logs', path: '/admin/logs', icon: 'history' },
  ];

  return (
    <div className="flex h-screen bg-surface-container-lowest">
      {/* Sidebar */}
      <aside className="w-64 bg-surface-card border-r border-border-subtle flex flex-col shrink-0">
        <div className="p-lg border-b border-border-subtle">
          <h2 className="font-headline-md text-headline-md text-primary font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px]">admin_panel_settings</span>
            Admin Panel
          </h2>
        </div>
        <nav className="flex-1 overflow-y-auto p-md space-y-2">
          {navItems.map((item) => (
            <Link 
              key={item.name} 
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-title-card text-title-card transition-colors ${
                location.pathname === item.path 
                  ? 'bg-primary text-on-primary shadow-sm' 
                  : 'text-on-surface-variant hover:bg-surface-muted hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-border-subtle">
          <button 
            onClick={async () => {
              await api.logout();
              localStorage.removeItem('auth');
              localStorage.removeItem('role');
              localStorage.removeItem('token');
              window.dispatchEvent(new Event('auth-change'));
              navigate('/');
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-status-error hover:bg-error/10 rounded-lg transition-colors font-label-caps text-label-caps"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-surface-container-lowest p-lg md:p-xl">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
