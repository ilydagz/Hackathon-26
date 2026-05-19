import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { useNotifications } from '../../context/NotificationContext';
import { buildStaticUrl } from '../../utils/backendUrl';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotifications();
  const currentUserId = Number(localStorage.getItem('userId'));

  const getAvatarSrc = (avatarUrl) => {
    if (!avatarUrl) return '';
    return avatarUrl.startsWith('http') ? avatarUrl : buildStaticUrl(avatarUrl);
  };

  const fetchUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const results = users.filter(user => 
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredUsers(results);
  }, [search, users]);

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    if (window.confirm(`Are you sure you want to ${newStatus === 'suspended' ? 'suspend' : 'reactivate'} this user?`)) {
      try {
        const updatedUser = await api.toggleUserStatus(id);
        setUsers(users.map(u => u.id === id ? updatedUser : u));
        addNotification({
          titleKey: 'notif.profileUpdated',
          messageKey: 'nav.profile',
          type: 'system',
          userId: currentUserId
        });
      } catch (err) {
        addNotification({
          titleKey: 'profile.error',
          messageKey: 'profile.error',
          type: 'system',
          userId: currentUserId
        });
      }
    }
  };

  const handleDeactivate = async (id) => {
    if (window.confirm('Are you sure you want to permanently deactivate and remove this account? This cannot be undone.')) {
      try {
        await api.deleteUser(id);
        setUsers(users.filter(u => u.id !== id));
        addNotification({
          titleKey: 'notif.accountDeleted',
          messageKey: 'nav.signOut',
          type: 'system',
          userId: currentUserId
        });
      } catch (err) {
        addNotification({
          titleKey: 'profile.error',
          messageKey: 'profile.error',
          type: 'system',
          userId: currentUserId
        });
      }
    }
  };

  if (loading) return <div className="p-xl text-center">Loading...</div>;

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-lg">
        <h1 className="font-display-lg md:text-display-lg text-on-background">User Management</h1>
        <div className="bg-surface-muted rounded-lg px-4 py-2 border border-border-subtle flex items-center gap-2 text-on-surface-variant font-body-main">
          <span className="material-symbols-outlined text-[20px]">search</span>
          <input 
            type="text" 
            placeholder="Search users..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none focus:ring-0 outline-none w-48" 
          />
        </div>
      </div>

      <div className="bg-surface-card rounded-2xl shadow-sm border border-border-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-muted border-b border-border-subtle font-label-caps text-label-caps text-text-secondary uppercase tracking-wider">
                <th className="p-4">User ID</th>
                <th className="p-4">Avatar</th>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Joined</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="font-body-main text-body-main text-on-surface">
              {filteredUsers.map(user => (
                <tr key={user.id} className="border-b border-border-subtle hover:bg-surface-muted transition-colors">
                  <td className="p-4 font-title-card text-title-card">{user.id}</td>
                  <td className="p-4">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-muted flex items-center justify-center text-xs font-bold text-on-surface-variant">
                      {getAvatarSrc(user.avatar_url) ? (
                        <img src={getAvatarSrc(user.avatar_url)} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        user.name.substring(0, 2).toUpperCase()
                      )}
                    </div>
                  </td>
                  <td className="p-4 font-bold">{user.name}</td>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${user.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-surface-container text-text-secondary'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">{new Date(user.created_at).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${user.status === 'suspended' ? 'bg-error/10 text-error' : 'bg-status-success/10 text-status-success'}`}>
                      {user.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button 
                      onClick={() => toggleStatus(user.id, user.status)} 
                      className="text-secondary hover:bg-surface-container p-2 rounded transition-colors" 
                      title={user.status === 'active' ? 'Suspend User' : 'Reactivate User'}
                    >
                      <span className="material-symbols-outlined text-[20px]">{user.status === 'active' ? 'person_off' : 'person_check'}</span>
                    </button>
                    <button onClick={() => handleDeactivate(user.id)} className="text-error hover:bg-error/10 p-2 rounded transition-colors" title="Deactivate Account">
                      <span className="material-symbols-outlined text-[20px]">person_remove</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredUsers.length === 0 && (
          <div className="p-xl text-center text-text-secondary font-body-main">No users found.</div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
